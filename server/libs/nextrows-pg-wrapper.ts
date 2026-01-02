import { openai } from "@ai-sdk/openai";
import { Nextrows } from "@wordbricks/nextrows-client";
import { generateText } from "ai";
import { Client } from "pg";
import { z } from "zod";

const DEFAULT_MODEL = "gpt-5.1";
const DEFAULT_SAMPLE_BYTES = 60_000;
const DEFAULT_SAMPLE_ITEMS = 50;

const sqlResponseSchema = z.object({
	tableName: z.string().min(1),
	createTableSql: z.string().min(1),
	insertSql: z.string().min(1),
	columns: z
		.array(
			z.object({
				sourceKey: z.string().min(1),
				columnName: z.string().min(1),
				dataType: z.string().min(1),
			}),
		)
		.min(1),
});

export type AiSqlResponse = z.infer<typeof sqlResponseSchema>;

export interface NextRowsPGWrapperOptions {
	nextrowsApiKey: string;
	pgConnectionString: string;
	aiModel?: string;
	maxSampleBytes?: number;
	maxSampleItems?: number;
}

export interface RunAndSaveResult {
	tableName: string;
	insertedCount: number;
	totalItems: number;
	sampleItems: number;
}

const SQL_SYSTEM_PROMPT = [
	"You are a PostgreSQL expert.",
	"Generate SQL for creating a table and inserting rows based on JSON data.",
	"Return only JSON with keys: tableName, createTableSql, insertSql, columns.",
	"- if tableName is not provided, create a proper table name based on the samples.",
	"- if tableName is provided, tableName must match the provided name exactly.",
	"- createTableSql should be CREATE TABLE IF NOT EXISTS ...",
	"- insertSql should be INSERT INTO ... VALUES ($1, $2, ...), with no values.",
	"- columns is an array of { sourceKey, columnName, dataType } matching insertSql order.",
	"- Use snake_case column names derived from source keys.",
	"- Use TEXT for strings, BOOLEAN for booleans, NUMERIC for numbers, JSONB for objects/arrays.",
	"- Use TIMESTAMPTZ for ISO-8601 timestamps when confident.",
	"- Avoid NOT NULL unless every sample row has a non-null value.",
].join("\n");

export class NextRowsPGWrapper {
	private readonly nextrowsClient: Nextrows;
	private readonly pgConnectionString: string;
	private readonly aiModel: string;
	private readonly maxSampleBytes: number;
	private readonly maxSampleItems: number;

	constructor(options: NextRowsPGWrapperOptions) {
		this.nextrowsClient = new Nextrows({
			apiKey: options.nextrowsApiKey,
		});
		this.pgConnectionString = options.pgConnectionString;
		this.aiModel = options.aiModel ?? DEFAULT_MODEL;
		this.maxSampleBytes = options.maxSampleBytes ?? DEFAULT_SAMPLE_BYTES;
		this.maxSampleItems = options.maxSampleItems ?? DEFAULT_SAMPLE_ITEMS;
	}

	async runAndSaveApp(appId: string, customTableName?: string): Promise<RunAndSaveResult> {
		const items = await this.runAppJson(appId);
		if (items.length === 0) {
			throw new Error("runAppJson returned an empty array.");
		}

		const keys = collectKeys(items);
		const { sample, truncated } = buildPromptSample(
			items,
			this.maxSampleBytes,
			this.maxSampleItems,
		);
		const tableName = customTableName
			? normalizeTableName(customTableName)
			: normalizeTableName(appId);

		const prompt = buildSqlPrompt({
			tableName,
			keys,
			sample,
			totalItems: items.length,
			truncated,
		});

		const aiResult = await generateText({
			model: openai(this.aiModel),
			system: SQL_SYSTEM_PROMPT,
			prompt,
		});

		const aiSql = parseAiSqlResponse(aiResult.text);
		validateAiSqlResponse(aiSql, tableName);

		const insertColumnOrder = getInsertColumnOrder(aiSql.insertSql);
		const orderedColumns = alignColumns(aiSql.columns, insertColumnOrder);
		const insertSql = aiSql.insertSql;

		const client = new Client({ connectionString: this.pgConnectionString });
		await client.connect();

		let insertedCount = 0;
		let transactionStarted = false;

		try {
			await client.query(aiSql.createTableSql);
			await client.query("BEGIN");
			transactionStarted = true;

			for (const item of items) {
				const values = buildInsertValues(item, orderedColumns);
				await client.query(insertSql, values);
				insertedCount += 1;
			}

			await client.query("COMMIT");
			transactionStarted = false;
		} catch (error) {
			if (transactionStarted) {
				await client.query("ROLLBACK");
			}
			throw error;
		} finally {
			await client.end();
		}

		return {
			tableName,
			insertedCount,
			totalItems: items.length,
			sampleItems: sample.length,
		};
	}

	private async runAppJson(appId: string): Promise<Array<Record<string, unknown>>> {
		const response = await this.nextrowsClient.runAppJson<unknown>({ appId, inputs: [] });

		if (!response.success) {
			throw new Error(response.error ?? "runAppJson failed.");
		}

		if (!response.data) {
			throw new Error("runAppJson returned no data.");
		}

		if (!Array.isArray(response.data)) {
			throw new Error("runAppJson returned non-array data.");
		}

		const items = response.data.filter(isRecord);
		if (items.length !== response.data.length) {
			throw new Error("runAppJson returned items that are not objects.");
		}

		return items;
	}
}

export function normalizeTableName(appId: string): string {
	const cleaned = appId
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");

	return cleaned.length > 0 ? `${cleaned}` : "nextrows_app";
}

export function buildPromptSample(
	items: Array<Record<string, unknown>>,
	maxBytes: number,
	maxItems: number,
): { sample: Array<Record<string, unknown>>; truncated: boolean } {
	let sample = items.slice(0, Math.min(items.length, maxItems));
	let sampleJson = safeStringify(sample);

	if (byteLength(sampleJson) <= maxBytes) {
		return { sample, truncated: sample.length < items.length };
	}

	while (sample.length > 1 && byteLength(sampleJson) > maxBytes) {
		sample = sample.slice(0, Math.ceil(sample.length / 2));
		sampleJson = safeStringify(sample);
	}

	return { sample, truncated: true };
}

export function buildSqlPrompt(options: {
	tableName: string;
	keys: string[];
	sample: Array<Record<string, unknown>>;
	totalItems: number;
	truncated: boolean;
}): string {
	const sampleNotice = options.truncated
		? "Sample is truncated for size; infer schema from sample and keys."
		: "Sample includes all rows.";

	return [
		`Table name (use exactly): ${options.tableName}`,
		`Total rows: ${options.totalItems}`,
		`Keys: ${safeStringify(options.keys)}`,
		`${sampleNotice}`,
		`Sample rows: ${safeStringify(options.sample)}`,
	].join("\n");
}

export function parseAiSqlResponse(text: string): AiSqlResponse {
	const jsonText = extractJsonFromText(text);
	const parsed = JSON.parse(jsonText) as unknown;
	return sqlResponseSchema.parse(parsed);
}

export function validateAiSqlResponse(response: AiSqlResponse, expectedTableName: string): void {
	if (response.tableName !== expectedTableName) {
		throw new Error("AI response tableName does not match expected table name.");
	}

	const uniqueColumns = new Set(response.columns.map((column) => column.columnName));
	if (uniqueColumns.size !== response.columns.length) {
		throw new Error("AI response column names are not unique.");
	}

	for (const column of response.columns) {
		if (!/^[a-z][a-z0-9_]*$/.test(column.columnName)) {
			throw new Error(`Invalid column name: ${column.columnName}`);
		}
	}

	guardSqlSafety(response.createTableSql, "create");
	guardSqlSafety(response.insertSql, "insert");

	if (!response.createTableSql.toLowerCase().includes(expectedTableName)) {
		throw new Error("CREATE TABLE SQL does not reference expected table name.");
	}
	if (!response.insertSql.toLowerCase().includes(expectedTableName)) {
		throw new Error("INSERT SQL does not reference expected table name.");
	}

	const insertColumns = getInsertColumnOrder(response.insertSql);
	if (insertColumns.length !== response.columns.length) {
		throw new Error("INSERT SQL column count does not match column definitions.");
	}

	const placeholderCount = getInsertPlaceholderCount(response.insertSql);
	if (placeholderCount !== response.columns.length) {
		throw new Error("INSERT SQL placeholder count does not match column definitions.");
	}
}

export function getInsertColumnOrder(insertSql: string): string[] {
	const match = insertSql.match(/insert\s+into\s+[^()]+\(([^)]+)\)/i);
	if (!match) {
		throw new Error("INSERT SQL must include an explicit column list.");
	}

	return match[1]
		.split(",")
		.map((column) => column.trim().replace(/"/g, ""))
		.filter(Boolean);
}

export function getInsertPlaceholderCount(insertSql: string): number {
	const matches = [...insertSql.matchAll(/\$(\d+)/g)];
	if (matches.length === 0) {
		throw new Error("INSERT SQL must use positional placeholders.");
	}

	const indexes = matches.map((match) => Number(match[1])).filter(Number.isFinite);
	const unique = new Set(indexes);
	const maxIndex = Math.max(...indexes);

	if (unique.size !== maxIndex || maxIndex !== indexes.length) {
		throw new Error("INSERT SQL placeholders must be sequential and unique.");
	}

	return maxIndex;
}

export function alignColumns(
	columns: AiSqlResponse["columns"],
	orderedNames: string[],
): AiSqlResponse["columns"] {
	const columnMap = new Map(columns.map((column) => [column.columnName, column]));
	return orderedNames.map((name) => {
		const column = columnMap.get(name);
		if (!column) {
			throw new Error(`INSERT SQL references unknown column: ${name}`);
		}
		return column;
	});
}

export function buildInsertValues(
	item: Record<string, unknown>,
	columns: AiSqlResponse["columns"],
): Array<unknown> {
	return columns.map((column) => normalizeValue(item[column.sourceKey], column.dataType));
}

function normalizeValue(value: unknown, dataType: string): unknown {
	if (value === null || value === undefined) {
		return null;
	}

	if (typeof value === "bigint") {
		return value.toString();
	}

	if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
		if (dataType.toLowerCase().includes("json")) {
			return JSON.stringify(value);
		}
		return JSON.stringify(value);
	}

	return value;
}

function collectKeys(items: Array<Record<string, unknown>>): string[] {
	const keys = new Set<string>();
	for (const item of items) {
		for (const key of Object.keys(item)) {
			keys.add(key);
		}
	}
	return [...keys].sort();
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeStringify(value: unknown): string {
	return JSON.stringify(value, (_key, entry) => {
		if (typeof entry === "bigint") {
			return entry.toString();
		}
		return entry;
	});
}

function byteLength(value: string): number {
	return Buffer.byteLength(value, "utf8");
}

function extractJsonFromText(text: string): string {
	const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
	const candidate = fenceMatch ? fenceMatch[1] : text;
	const start = candidate.indexOf("{");
	const end = candidate.lastIndexOf("}");

	if (start === -1 || end === -1 || end <= start) {
		throw new Error("AI response did not contain a JSON object.");
	}

	return candidate.slice(start, end + 1);
}

function guardSqlSafety(sql: string, mode: "create" | "insert"): void {
	const trimmed = sql.trim();
	const lowered = trimmed.toLowerCase();

	if (mode === "create" && !lowered.startsWith("create table")) {
		throw new Error("CREATE TABLE SQL must start with CREATE TABLE.");
	}
	if (mode === "insert" && !lowered.startsWith("insert into")) {
		throw new Error("INSERT SQL must start with INSERT INTO.");
	}

	if (/(drop|alter|delete|update|truncate|grant|revoke)\b/.test(lowered)) {
		throw new Error("SQL contains disallowed statements.");
	}
}
