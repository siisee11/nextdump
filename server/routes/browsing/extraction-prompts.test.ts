import { describe, expect, it } from "bun:test";
import { buildExtractionPrompts, normalizeUrlPattern } from "./extraction-prompts";

describe("normalizeUrlPattern", () => {
	it("replaces numeric segments with [id] and strips query params", () => {
		const url = "https://example.com/products/123?ref=home";
		expect(normalizeUrlPattern(url)).toBe("https://example.com/products/[id]");
	});
});

describe("buildExtractionPrompts", () => {
	it("returns an empty list when no pages are provided", () => {
		const prompts = buildExtractionPrompts([]);
		expect(prompts).toEqual([]);
	});

	it("dedupes prompts by normalized page type and infers product fields", () => {
		const prompts = buildExtractionPrompts([
			{
				url: "https://example.com/products/123",
				title: "Widget 123",
				content: "Price $10",
				links: [],
			},
			{
				url: "https://example.com/products/456",
				title: "Widget 456",
				content: "Price $12",
				links: [],
			},
		]);

		expect(prompts).toHaveLength(1);
		expect(prompts[0].extractPrompt).toContain("productName");
		expect(prompts[0].extractPrompt).toContain("https://example.com/products/[id]");
	});

	it("uses people fields for team-style pages", () => {
		const prompts = buildExtractionPrompts([
			{
				url: "https://example.com/managers",
				title: "Managers",
				content: "Meet our leadership team.",
				links: [],
			},
		]);

		expect(prompts[0].extractPrompt).toContain("personName");
		expect(prompts[0].extractPrompt).toContain("profileUrl");
	});
});
