import { describe, expect, it } from "bun:test";
import {
	buildBrowserbaseWsUrl,
	canUseBrowserbase,
	connectBrowserbase,
	connectBrowserbaseWithSessionId,
} from "./browserbase";

describe("browserbase helpers", () => {
	it("builds websocket URL with session id", () => {
		const url = buildBrowserbaseWsUrl("api-key", "session-123");
		expect(url).toBe("wss://connect.browserbase.com?apiKey=api-key&sessionId=session-123");
	});

	it("builds websocket URL without session id", () => {
		const url = buildBrowserbaseWsUrl("api-key");
		expect(url).toBe("wss://connect.browserbase.com?apiKey=api-key");
	});

	it("detects when Browserbase config is available", () => {
		const env = {
			BROWSERBASE_API_KEY: "api-key",
			BROWSERBASE_PROJECT_ID: "project-id",
		} as NodeJS.ProcessEnv;

		expect(canUseBrowserbase(env)).toBe(true);
	});

	it("returns null when Browserbase env is missing", async () => {
		const originalApiKey = process.env.BROWSERBASE_API_KEY;
		const originalProjectId = process.env.BROWSERBASE_PROJECT_ID;

		try {
			delete process.env.BROWSERBASE_API_KEY;
			delete process.env.BROWSERBASE_PROJECT_ID;

			await expect(connectBrowserbase()).resolves.toBeNull();
		} finally {
			if (originalApiKey === undefined) {
				delete process.env.BROWSERBASE_API_KEY;
			} else {
				process.env.BROWSERBASE_API_KEY = originalApiKey;
			}

			if (originalProjectId === undefined) {
				delete process.env.BROWSERBASE_PROJECT_ID;
			} else {
				process.env.BROWSERBASE_PROJECT_ID = originalProjectId;
			}
		}
	});

	it("returns null when connecting with sessionId without API key", async () => {
		const originalApiKey = process.env.BROWSERBASE_API_KEY;

		try {
			delete process.env.BROWSERBASE_API_KEY;

			await expect(connectBrowserbaseWithSessionId("session-123")).resolves.toBeNull();
		} finally {
			if (originalApiKey === undefined) {
				delete process.env.BROWSERBASE_API_KEY;
			} else {
				process.env.BROWSERBASE_API_KEY = originalApiKey;
			}
		}
	});
});
