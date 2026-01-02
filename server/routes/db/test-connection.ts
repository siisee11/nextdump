import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Client } from "pg";
import { z } from "zod";

// Request schema
const testConnectionSchema = z.object({
	connectionString: z.string().min(1, "Connection string is required"),
});

// Response types
interface TestConnectionSuccess {
	success: true;
	database: string;
	version: string;
}

interface TestConnectionError {
	success: false;
	error: string;
}

const testConnectionRoutes = new Hono()
	//
	.post("/", zValidator("json", testConnectionSchema), async (c) => {
		const { connectionString } = c.req.valid("json");

		let client: Client | null = null;

		try {
			client = new Client({ connectionString });

			// Set a connection timeout
			const connectPromise = client.connect();
			const timeoutPromise = new Promise<never>((_, reject) => {
				setTimeout(() => reject(new Error("Connection timeout after 10 seconds")), 10000);
			});

			await Promise.race([connectPromise, timeoutPromise]);

			// Get database info
			const versionResult = await client.query("SELECT version()");
			const dbNameResult = await client.query("SELECT current_database()");

			const version = versionResult.rows[0]?.version ?? "Unknown";
			const database = dbNameResult.rows[0]?.current_database ?? "Unknown";

			// Extract short version string (e.g., "PostgreSQL 15.4")
			const shortVersion = version.match(/PostgreSQL\s+[\d.]+/)?.[0] ?? version;

			const response: TestConnectionSuccess = {
				success: true,
				database,
				version: shortVersion,
			};

			return c.json(response);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to connect to database";

			// Sanitize error message to avoid exposing sensitive info
			const sanitizedError = sanitizeConnectionError(errorMessage);

			const response: TestConnectionError = {
				success: false,
				error: sanitizedError,
			};

			return c.json(response, 400);
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
 * Sanitizes error messages to avoid exposing sensitive connection details
 */
function sanitizeConnectionError(message: string): string {
	// Common PostgreSQL connection errors with user-friendly messages
	if (message.includes("ECONNREFUSED")) {
		return "Connection refused. Please check that the database server is running and accessible.";
	}
	if (message.includes("ENOTFOUND") || message.includes("getaddrinfo")) {
		return "Could not resolve database host. Please check the hostname in your connection string.";
	}
	if (message.includes("ETIMEDOUT") || message.includes("timeout")) {
		return "Connection timed out. Please check your network connection and database host.";
	}
	if (message.includes("password authentication failed")) {
		return "Authentication failed. Please check your username and password.";
	}
	if (message.includes("does not exist")) {
		return "Database does not exist. Please check the database name in your connection string.";
	}
	if (message.includes("SSL")) {
		return "SSL connection error. Try adding ?sslmode=require or ?sslmode=disable to your connection string.";
	}
	if (message.includes("no pg_hba.conf entry")) {
		return "Connection rejected by server. The database may not be configured to accept connections from your IP.";
	}

	// For other errors, return a generic message
	return "Failed to connect to database. Please check your connection string.";
}

export { testConnectionRoutes };
