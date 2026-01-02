import Browserbase from "@browserbasehq/sdk";
import type {
	SessionCreateResponse,
	SessionRetrieveResponse,
} from "@browserbasehq/sdk/resources/index.mjs";
import puppeteer, { type Browser, type BrowserContext } from "puppeteer-core";

export type BrowserbaseClient = {
	browser: Browser;
	context: BrowserContext;
	sessionId: string;
};

export function canUseBrowserbase(env = process.env): boolean {
	return Boolean(env.BROWSERBASE_API_KEY && env.BROWSERBASE_PROJECT_ID);
}

export function buildBrowserbaseWsUrl(apiKey: string, sessionId?: string): string {
	const baseUrl = `wss://connect.browserbase.com?apiKey=${apiKey}`;
	return sessionId ? `${baseUrl}&sessionId=${sessionId}` : baseUrl;
}

async function resolveBrowserbaseConnectUrl(
	apiKey: string,
	sessionId: string,
	session?: Pick<SessionRetrieveResponse, "connectUrl">,
): Promise<string> {
	if (session?.connectUrl) {
		return session.connectUrl;
	}

	const client = new Browserbase({ apiKey });
	const hydratedSession = await client.sessions.retrieve(sessionId);
	if (hydratedSession.connectUrl) {
		return hydratedSession.connectUrl;
	}

	return buildBrowserbaseWsUrl(apiKey, sessionId);
}

export async function connectBrowserbase(): Promise<BrowserbaseClient | null> {
	const apiKey = process.env.BROWSERBASE_API_KEY;
	const projectId = process.env.BROWSERBASE_PROJECT_ID;

	if (!apiKey || !projectId) {
		return null;
	}

	const client = new Browserbase({ apiKey });
	const session: SessionCreateResponse = await client.sessions.create({ projectId });
	if (!session.id || !session.connectUrl) {
		throw new Error("Browserbase session missing id or connectUrl");
	}

	const browser = await puppeteer.connect({ browserWSEndpoint: session.connectUrl });
	const context = browser.browserContexts()[0] ?? (await browser.createBrowserContext());

	return { browser, context, sessionId: session.id };
}

export async function connectBrowserbaseWithSessionId(
	sessionId: string,
): Promise<BrowserbaseClient | null> {
	const apiKey = process.env.BROWSERBASE_API_KEY;

	if (!apiKey) {
		return null;
	}

	const connectUrl = await resolveBrowserbaseConnectUrl(apiKey, sessionId);
	const browser = await puppeteer.connect({ browserWSEndpoint: connectUrl });
	const context = browser.browserContexts()[0] ?? (await browser.createBrowserContext());

	return { browser, context, sessionId };
}

export async function closeBrowserbase(client: BrowserbaseClient): Promise<void> {
	await client.browser.close();
}

export type BrowserbaseSessionWithDebugUrls = {
	sessionId: string;
	debuggerUrl: string;
	debuggerFullscreenUrl: string;
};

/**
 * Creates a Browserbase session, connects to the browser, stores it in memory,
 * and returns the debug URLs for live preview.
 *
 * The connected browser is stored in memory and can be retrieved later with
 * `getStoredBrowserbaseClient(sessionId)`.
 */
export async function createAndConnectBrowserbaseSession(): Promise<BrowserbaseSessionWithDebugUrls | null> {
	const apiKey = process.env.BROWSERBASE_API_KEY;
	const projectId = process.env.BROWSERBASE_PROJECT_ID;

	if (!apiKey || !projectId) {
		return null;
	}

	// Create the session
	const bb = new Browserbase({ apiKey });
	const session: SessionCreateResponse = await bb.sessions.create({ projectId });
	if (!session.id || !session.connectUrl) {
		throw new Error("Browserbase session missing id or connectUrl");
	}

	console.log(`Created Browserbase session ${session.id}, connection URL: ${session.connectUrl}`);
	// Get debug URLs for live preview
	const debugData = await bb.sessions.debug(session.id);

	return {
		sessionId: session.id,
		debuggerUrl: debugData.debuggerUrl,
		debuggerFullscreenUrl: debugData.debuggerFullscreenUrl,
	};
}

export async function getBrowserBySessionId(sessionId: string): Promise<Browser | null> {
	const apiKey = process.env.BROWSERBASE_API_KEY;
	const projectId = process.env.BROWSERBASE_PROJECT_ID;

	if (!apiKey || !projectId) {
		return null;
	}

	// Create the session
	const bb = new Browserbase({ apiKey });
	const session = await bb.sessions.retrieve(sessionId);
	if (!session.id || !session.connectUrl) {
		throw new Error("Browserbase session missing id or connectUrl");
	}

	const browser = await puppeteer.connect({ browserWSEndpoint: session.connectUrl });
	console.log(`[getBrowserBySessionId] Connected to Browserbase session ${sessionId}`);
	return browser;
}
