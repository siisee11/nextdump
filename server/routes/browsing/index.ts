import { Hono } from "hono";
import { analyzeRoutes } from "./analyze";
import { sessionRoutes } from "./session";

// Browsing routes - mounts all browsing-related subroutes
const browsingRoutes = new Hono()
	//
	.route("/session", sessionRoutes)
	.route("/", analyzeRoutes);

export { browsingRoutes };
