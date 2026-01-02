import { describe, expect, test } from "bun:test";
import {
	alignColumns,
	buildPromptSample,
	getInsertColumnOrder,
	getInsertPlaceholderCount,
	normalizeTableName,
	parseAiSqlResponse,
	validateAiSqlResponse,
} from "./nextrows-pg-wrapper";

describe("normalizeTableName", () => {
	test("sanitizes and prefixes app ids", () => {
		expect(normalizeTableName("0smoimgaw6")).toBe("nextrows_app_0smoimgaw6");
		expect(normalizeTableName("App ID!")).toBe("nextrows_app_app_id");
	});
});

describe("buildPromptSample", () => {
	test("truncates when sample exceeds max bytes", () => {
		const items = Array.from({ length: 10 }, (_value, index) => ({
			id: index,
			name: "x".repeat(80),
		}));

		const { sample, truncated } = buildPromptSample(items, 120, 10);
		expect(truncated).toBe(true);
		expect(sample.length).toBeGreaterThan(0);
		expect(sample.length).toBeLessThan(items.length);
	});
});

describe("parseAiSqlResponse", () => {
	test("extracts json from fenced output", () => {
		const text = [
			"```json",
			JSON.stringify({
				tableName: "nextrows_app_demo",
				createTableSql: "CREATE TABLE IF NOT EXISTS nextrows_app_demo (id TEXT)",
				insertSql: "INSERT INTO nextrows_app_demo (id) VALUES ($1)",
				columns: [{ sourceKey: "id", columnName: "id", dataType: "TEXT" }],
			}),
			"```",
		].join("\n");

		const parsed = parseAiSqlResponse(text);
		expect(parsed.tableName).toBe("nextrows_app_demo");
		expect(parsed.columns[0].columnName).toBe("id");
	});
});

describe("validateAiSqlResponse", () => {
	test("accepts valid sql response and aligns columns", () => {
		const response = parseAiSqlResponse(
			JSON.stringify({
				tableName: "nextrows_app_demo",
				createTableSql: "CREATE TABLE IF NOT EXISTS nextrows_app_demo (id TEXT)",
				insertSql: "INSERT INTO nextrows_app_demo (id) VALUES ($1)",
				columns: [{ sourceKey: "id", columnName: "id", dataType: "TEXT" }],
			}),
		);

		validateAiSqlResponse(response, "nextrows_app_demo");

		const order = getInsertColumnOrder(response.insertSql);
		expect(order).toEqual(["id"]);
		expect(getInsertPlaceholderCount(response.insertSql)).toBe(1);
		expect(alignColumns(response.columns, order)[0]?.columnName).toBe("id");
	});
});
