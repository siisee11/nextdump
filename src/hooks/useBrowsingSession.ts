import { useMutation } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";
import { api } from "@/lib/api";

// Infer response type from the Hono RPC client
export type BrowsingSessionResponse = InferResponseType<typeof api.browsing.session.$post>;

// API function using Hono RPC
async function createBrowsingSession(): Promise<BrowsingSessionResponse> {
	const response = await api.browsing.session.$post();

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
}

interface UseBrowsingSessionOptions {
	onSuccess?: (data: BrowsingSessionResponse) => void;
	onError?: (error: Error) => void;
}

export function useBrowsingSession(options?: UseBrowsingSessionOptions) {
	return useMutation({
		mutationFn: createBrowsingSession,
		onSuccess: (data) => {
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			options?.onError?.(error);
		},
	});
}
