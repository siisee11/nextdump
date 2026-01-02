import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Client } from "pg";
import { z } from "zod";

// Query params schema for pagination
const queryParamsSchema = z.object({
	connectionString: z.string().min(1, "Connection string is required"),
	limit: z
		.string()
		.optional()
		.transform((val) => (val ? Number.parseInt(val, 10) : 100)),
	offset: z
		.string()
		.optional()
		.transform((val) => (val ? Number.parseInt(val, 10) : 0)),
});

// Response types
export interface TableColumn {
	name: string;
	dataType: string;
}

export interface TableDataResponse {
	success: true;
	tableName: string;
	columns: TableColumn[];
	rows: Record<string, unknown>[];
	totalRows: number;
	limit: number;
	offset: number;
}

export interface TableDataError {
	success: false;
	error: string;
}

// Route for fetching all tables data (for demo mode - fetches multiple tables at once)
const fetchAllTablesSchema = z.object({
	connectionString: z.string().min(1, "Connection string is required"),
	tableNames: z.array(z.string().min(1)).min(1, "At least one table name is required"),
	limit: z.number().optional().default(100),
});

export interface AllTablesDataResponse {
	success: true;
	tables: {
		tableName: string;
		columns: TableColumn[];
		rows: Record<string, unknown>[];
		totalRows: number;
	}[];
}

const tablesRoutes = new Hono()
	// GET /db/tables/:tableName - Fetch rows from a specific table
	.get("/:tableName", zValidator("query", queryParamsSchema), async (c) => {
		const tableName = c.req.param("tableName");
		const { connectionString, limit, offset } = c.req.valid("query");

		// Validate table name to prevent SQL injection
		if (!isValidTableName(tableName)) {
			const response: TableDataError = {
				success: false,
				error: "Invalid table name. Table names must be alphanumeric with underscores only.",
			};
			return c.json(response, 400);
		}

		let client: Client | null = null;

		try {
			client = new Client({ connectionString });

			// Set a connection timeout
			const connectPromise = client.connect();
			const timeoutPromise = new Promise<never>((_, reject) => {
				setTimeout(() => reject(new Error("Connection timeout after 10 seconds")), 10000);
			});

			await Promise.race([connectPromise, timeoutPromise]);

			// Check if table exists
			const tableExistsResult = await client.query(
				`SELECT EXISTS (
					SELECT FROM information_schema.tables 
					WHERE table_schema = 'public' 
					AND table_name = $1
				)`,
				[tableName],
			);

			if (!tableExistsResult.rows[0]?.exists) {
				const response: TableDataError = {
					success: false,
					error: `Table '${tableName}' does not exist.`,
				};
				return c.json(response, 404);
			}

			// Get column information
			const columnsResult = await client.query(
				`SELECT column_name, data_type 
				FROM information_schema.columns 
				WHERE table_schema = 'public' AND table_name = $1 
				ORDER BY ordinal_position`,
				[tableName],
			);

			const columns: TableColumn[] = columnsResult.rows.map((row) => ({
				name: row.column_name,
				dataType: row.data_type,
			}));

			// Get total row count
			const countResult = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
			const totalRows = Number.parseInt(countResult.rows[0]?.count ?? "0", 10);

			// Fetch rows with pagination
			const rowsResult = await client.query(`SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`, [
				limit,
				offset,
			]);

			const response: TableDataResponse = {
				success: true,
				tableName,
				columns,
				rows: rowsResult.rows,
				totalRows,
				limit,
				offset,
			};

			return c.json(response);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to fetch table data";

			const response: TableDataError = {
				success: false,
				error: sanitizeError(errorMessage),
			};

			return c.json(response, 500);
		} finally {
			if (client) {
				try {
					await client.end();
				} catch {
					// Ignore cleanup errors
				}
			}
		}
	})
	// POST /db/tables/all - Fetch data from multiple tables at once
	.post("/all", zValidator("json", fetchAllTablesSchema), async (c) => {
		const { connectionString, tableNames, limit } = c.req.valid("json");

		let client: Client | null = null;

		try {
			client = new Client({ connectionString });

			// Set a connection timeout
			const connectPromise = client.connect();
			const timeoutPromise = new Promise<never>((_, reject) => {
				setTimeout(() => reject(new Error("Connection timeout after 10 seconds")), 10000);
			});

			await Promise.race([connectPromise, timeoutPromise]);

			const tables: AllTablesDataResponse["tables"] = [];

			for (const tableName of tableNames) {
				// Validate table name
				if (!isValidTableName(tableName)) {
					continue;
				}

				try {
					// Check if table exists
					const tableExistsResult = await client.query(
						`SELECT EXISTS (
							SELECT FROM information_schema.tables 
							WHERE table_schema = 'public' 
							AND table_name = $1
						)`,
						[tableName],
					);

					if (!tableExistsResult.rows[0]?.exists) {
						continue;
					}

					// Get column information
					const columnsResult = await client.query(
						`SELECT column_name, data_type 
						FROM information_schema.columns 
						WHERE table_schema = 'public' AND table_name = $1 
						ORDER BY ordinal_position`,
						[tableName],
					);

					const columns: TableColumn[] = columnsResult.rows.map((row) => ({
						name: row.column_name,
						dataType: row.data_type,
					}));

					// Get total row count
					const countResult = await client.query(`SELECT COUNT(*) as count FROM "${tableName}"`);
					const totalRows = Number.parseInt(countResult.rows[0]?.count ?? "0", 10);

					// Fetch rows
					const rowsResult = await client.query(`SELECT * FROM "${tableName}" LIMIT $1`, [limit]);

					tables.push({
						tableName,
						columns,
						rows: rowsResult.rows,
						totalRows,
					});
				} catch {}
			}

			const response: AllTablesDataResponse = {
				success: true,
				tables,
			};

			return c.json(response);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to fetch table data";

			const response: TableDataError = {
				success: false,
				error: sanitizeError(errorMessage),
			};

			return c.json(response, 500);
		} finally {
			if (client) {
				try {
					await client.end();
				} catch {
					// Ignore cleanup errors
				}
			}
		}
	});

/**
 * Validates table name to prevent SQL injection.
 * Only allows alphanumeric characters and underscores.
 */
function isValidTableName(name: string): boolean {
	return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) && name.length <= 63;
}

/**
 * Sanitizes error messages to avoid exposing sensitive connection details
 */
function sanitizeError(message: string): string {
	if (message.includes("ECONNREFUSED")) {
		return "Connection refused. Please check that the database server is running.";
	}
	if (message.includes("ETIMEDOUT") || message.includes("timeout")) {
		return "Connection timed out.";
	}
	if (message.includes("password authentication failed")) {
		return "Authentication failed.";
	}

	// For other errors, return a generic message
	return "Failed to fetch table data.";
}

export { tablesRoutes };
