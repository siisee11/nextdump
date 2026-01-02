import { hc } from "hono/client";
import type { AppType } from "../../server/index.ts";

// Create typed Hono RPC client
const baseUrl = "http://localhost:3001";

export const api = hc<AppType>(baseUrl);
