import { Hono } from "hono";
import { runRoutes } from "./run";

// Apps routes - mounts all app-related subroutes
const appsRoutes = new Hono()
	//
	.route("/run", runRoutes);

export { appsRoutes };
