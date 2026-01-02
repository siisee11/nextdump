import { Hono } from "hono";
import { cors } from "hono/cors";
import { appsRoutes } from "./routes/apps/index";
import { browsingRoutes } from "./routes/browsing/index";
import { dbRoutes } from "./routes/db/index";

const app = new Hono()
	// CORS middleware for development
	.use("*", cors())
	// Health check route
	.get("/hello", (c) => {
		return c.json({ message: "Hello from Hono server!" });
	})
	// Mount route modules
	.route("/browsing", browsingRoutes)
	.route("/db", dbRoutes)
	.route("/apps", appsRoutes);

// Export type for Hono RPC client
export type AppType = typeof app;

// Start server
const PORT = process.env.PORT || 3001;

export default {
	port: PORT,
	fetch: app.fetch,
	idleTimeout: 120,
};

console.log(`🚀 Hono server running at http://localhost:${PORT}`);
