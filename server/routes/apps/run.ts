import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { NextRowsPGWrapper, normalizeTableName } from "../../libs/nextrows-pg-wrapper";

// Request schema for running a single app
const runAppRequestSchema = z.object({
	appId: z.string().min(1, "App ID is required"),
	tableName: z.string().optional(),
	connectionString: z.string().min(1, "Connection string is required"),
});

// Request schema for running multiple apps
const runAppsRequestSchema = z.object({
	apps: z
		.array(
			z.object({
				appId: z.string().min(1, "App ID is required"),
				tableName: z.string().optional(),
			}),
		)
		.min(1, "At least one app is required"),
	connectionString: z.string().min(1, "Connection string is required"),
});

// Response types
export interface AppRunResult {
	appId: string;
	tableName: string;
	status: "success" | "error";
	insertedCount?: number;
	totalItems?: number;
	error?: string;
}

export interface RunAppsResponse {
	success: boolean;
	results: AppRunResult[];
	summary: {
		total: number;
		succeeded: number;
		failed: number;
		totalRowsInserted: number;
	};
}

const runRoutes = new Hono()
	// Run a single app
	.post(
		"/single",
		//
		zValidator("json", runAppRequestSchema),
		async (c) => {
			const { appId, tableName, connectionString } = c.req.valid("json");

			const apiKey = process.env.NEXTROWS_API_KEY;
			if (!apiKey) {
				return c.json(
					{
						success: false,
						error: "Server configuration error: NEXTROWS_API_KEY not set",
					},
					500,
				);
			}

			try {
				const wrapper = new NextRowsPGWrapper({
					nextrowsApiKey: apiKey,
					pgConnectionString: connectionString,
				});

				const result = await wrapper.runAndSaveApp(appId, tableName || undefined);

				const response: AppRunResult = {
					appId,
					tableName: result.tableName,
					status: "success",
					insertedCount: result.insertedCount,
					totalItems: result.totalItems,
				};

				return c.json(response);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

				const response: AppRunResult = {
					appId,
					tableName: tableName || normalizeTableName(appId),
					status: "error",
					error: sanitizeError(errorMessage),
				};

				return c.json(response, 400);
			}
		},
	)
	// Run multiple apps sequentially
	.post("/", zValidator("json", runAppsRequestSchema), async (c) => {
		const { apps, connectionString } = c.req.valid("json");

		const apiKey = process.env.NEXTROWS_API_KEY;
		if (!apiKey) {
			return c.json(
				{
					success: false,
					results: [],
					summary: { total: 0, succeeded: 0, failed: 0, totalRowsInserted: 0 },
					error: "Server configuration error: NEXTROWS_API_KEY not set",
				},
				500,
			);
		}

		const results: AppRunResult[] = [];
		let succeeded = 0;
		let failed = 0;
		let totalRowsInserted = 0;

		for (const app of apps) {
			try {
				const wrapper = new NextRowsPGWrapper({
					nextrowsApiKey: apiKey,
					pgConnectionString: connectionString,
				});

				const result = await wrapper.runAndSaveApp(app.appId, app.tableName || undefined);

				results.push({
					appId: app.appId,
					tableName: result.tableName,
					status: "success",
					insertedCount: result.insertedCount,
					totalItems: result.totalItems,
				});

				succeeded += 1;
				totalRowsInserted += result.insertedCount;
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

				results.push({
					appId: app.appId,
					tableName: app.tableName || normalizeTableName(app.appId),
					status: "error",
					error: sanitizeError(errorMessage),
				});

				failed += 1;
			}
		}

		const response: RunAppsResponse = {
			success: failed === 0,
			results,
			summary: {
				total: apps.length,
				succeeded,
				failed,
				totalRowsInserted,
			},
		};

		return c.json(response);
	});

/**
 * Sanitizes error messages to avoid exposing sensitive information
 */
function sanitizeError(message: string): string {
	// NextRows API errors
	if (message.includes("runAppJson failed")) {
		return "Failed to run NextRows app. Please check the app ID is correct.";
	}
	if (message.includes("returned an empty array")) {
		return "The app returned no data. Make sure the app has been configured correctly in NextRows.";
	}
	if (message.includes("returned no data")) {
		return "The app returned no data. Please check the app configuration.";
	}
	if (message.includes("returned non-array data")) {
		return "The app returned invalid data format. Expected an array of objects.";
	}

	// Database errors
	if (message.includes("ECONNREFUSED")) {
		return "Database connection refused. Please check the database is running.";
	}
	if (message.includes("password authentication failed")) {
		return "Database authentication failed. Please check your credentials.";
	}
	if (message.includes("does not exist")) {
		return "Database does not exist. Please check your connection string.";
	}
	if (message.includes("permission denied")) {
		return "Permission denied. The database user may not have sufficient privileges.";
	}

	// AI/Schema errors
	if (message.includes("AI response")) {
		return "Failed to generate table schema. Please try again.";
	}

	// SQL safety errors
	if (message.includes("disallowed statements")) {
		return "Security error: Generated SQL contained unsafe statements.";
	}

	// Generic fallback - don't expose full error
	if (message.length > 200) {
		return "An error occurred while running the app. Please try again.";
	}

	return message;
}

export { runRoutes };
