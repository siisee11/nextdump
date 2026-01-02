import { describe, expect, it } from "bun:test";
import type { BrowserContext } from "puppeteer-core";
import { fetchPageContentWithBrowserbase } from "./fetch-page";

describe("fetchPageContentWithBrowserbase", () => {
	it("extracts title, content, and unique links from a browser context page", async () => {
		let closeCalled = false;
		const mockPage = {
			goto: async () => undefined,
			url: () => "https://example.com/final",
			title: async () => "Example Title",
			evaluate: async () => ({
				text: "Hello    world",
				links: ["https://a.com", "https://a.com", "https://b.com"],
			}),
			close: async () => {
				closeCalled = true;
			},
		};

		const mockContext = {
			newPage: async () => mockPage,
		};

		const result = await fetchPageContentWithBrowserbase(
			"https://example.com",
			mockContext as unknown as BrowserContext,
		);

		expect(result.success).toBe(true);
		expect(result.url).toBe("https://example.com/final");
		expect(result.title).toBe("Example Title");
		expect(result.content).toBe("Hello world");
		expect(result.links).toEqual(["https://a.com", "https://b.com"]);
		expect(closeCalled).toBe(true);
	});
});
