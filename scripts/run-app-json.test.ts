import { describe, expect, test } from "bun:test";
import { itemSchema, parseItems } from "./run-app-json";

describe("itemSchema", () => {
	test("parses a valid item", () => {
		const item = {
			managerFund: "Example Fund",
			updated: "2025-01-01",
			holdingsUrl: "https://example.com/holdings",
			managerCode: "EXM",
			sourceUrl: "https://example.com/source",
		};

		expect(itemSchema.parse(item)).toEqual(item);
	});
});

describe("parseItems", () => {
	test("parses an array of items", () => {
		const items = [
			{
				managerFund: "Example Fund",
				updated: "2025-01-01",
				holdingsUrl: "https://example.com/holdings",
				managerCode: "EXM",
				sourceUrl: "https://example.com/source",
			},
		];

		expect(parseItems(items)).toEqual(items);
	});
});
