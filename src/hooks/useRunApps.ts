import { useMutation } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono/client";
import { api } from "@/lib/api";

// Infer types from the Hono RPC client
export type RunAppsResponse = InferResponseType<typeof api.apps.run.$post>;
export type RunAppsInput = InferRequestType<typeof api.apps.run.$post>["json"];
export type AppRunResult = RunAppsResponse["results"][number];

// API function using Hono RPC
async function runApps(input: RunAppsInput): Promise<RunAppsResponse> {
	const response = await api.apps.run.$post({
		json: input,
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: "Unknown error" }));
		throw new Error(
			(error as { error?: string }).error || `HTTP error! status: ${response.status}`,
		);
	}

	return response.json();
}

interface UseRunAppsOptions {
	onSuccess?: (data: RunAppsResponse) => void;
	onError?: (error: Error) => void;
}

export function useRunApps(options?: UseRunAppsOptions) {
	return useMutation({
		mutationFn: runApps,
		onSuccess: (data) => {
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			options?.onError?.(error);
		},
	});
}
