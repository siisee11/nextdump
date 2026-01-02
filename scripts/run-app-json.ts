import { z } from "zod";
import { NextRowsPGWrapper } from "../server/libs/nextrows-pg-wrapper";

const APP_ID = "0smoimgaw6";

export const itemSchema = z.object({
	managerFund: z.string(),
	updated: z.string(),
	holdingsUrl: z.string(),
	managerCode: z.string(),
	sourceUrl: z.string(),
});

export type Item = z.infer<typeof itemSchema>;

export function parseItems(data: unknown): Item[] {
	return itemSchema.array().parse(data);
}

async function main() {
	const connectionString = process.env.EXAMPLE_DATABASE_CONNECTION_STRING;
	if (!connectionString) {
		throw new Error("Missing EXAMPLE_DATABASE_CONNECTION_STRING in environment.");
	}

	const apiKey = process.env.NEXTROWS_API_KEY;
	if (!apiKey) {
		throw new Error("Missing NEXTROWS_API_KEY in environment.");
	}

	const wrapper = new NextRowsPGWrapper({
		nextrowsApiKey: apiKey,
		pgConnectionString: connectionString,
	});

	const appId = process.env.NEXTROWS_APP_ID ?? APP_ID;
	const result = await wrapper.runAndSaveApp(appId);

	console.log(
		`Inserted ${result.insertedCount}/${result.totalItems} rows into ${result.tableName}.`,
	);
}

if (import.meta.main) {
	main().catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
}
