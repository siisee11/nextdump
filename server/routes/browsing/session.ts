import { Hono } from "hono";
import { canUseBrowserbase, createAndConnectBrowserbaseSession } from "../../utils/browserbase";

// Session routes - handles Browserbase session creation
const sessionRoutes = new Hono()
	// Session creation endpoint - creates a Browserbase session, connects to the browser,
	// and returns live view URL. The browser connection is stored for reuse in /browsing.
	.post("/", async (c) => {
		try {
			if (!canUseBrowserbase()) {
				return c.json({
					success: true,
					sessionId: null,
					liveViewUrl: null,
				});
			}

			// This creates the session, connects to the browser, and stores it in memory
			const session = await createAndConnectBrowserbaseSession();

			if (!session) {
				return c.json({
					success: false,
					sessionId: null,
					liveViewUrl: null,
				});
			}

			return c.json({
				success: true,
				sessionId: session.sessionId,
				liveViewUrl: session.debuggerFullscreenUrl,
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			console.error("Session creation error:", errorMessage);
			return c.json(
				{
					success: false,
					sessionId: null,
					liveViewUrl: null,
					error: errorMessage,
				},
				500,
			);
		}
	});

export { sessionRoutes };
