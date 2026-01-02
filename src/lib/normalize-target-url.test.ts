import { describe, expect, test } from "bun:test";
import { normalizeTargetUrl } from "./normalize-target-url";

describe("normalizeTargetUrl", () => {
	test("returns null for empty input", () => {
		expect(normalizeTargetUrl("   ")).toBeNull();
	});

	test("keeps fully qualified URLs", () => {
		expect(normalizeTargetUrl("https://example.com/path")).toBe("https://example.com/path");
	});

	test("adds https:// when protocol is missing", () => {
		expect(normalizeTargetUrl("example.com")).toBe("https://example.com");
	});
});
