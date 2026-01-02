import { Hono } from "hono";
import { tablesRoutes } from "./tables";
import { testConnectionRoutes } from "./test-connection";

// Database routes - mounts all database-related subroutes
const dbRoutes = new Hono()
	//
	.route("/test", testConnectionRoutes)
	.route("/tables", tablesRoutes);

export { dbRoutes };
