import { useMutation } from "@tanstack/react-query";

// API response types
export interface BrowsingMetadata {
	pagesVisited: number;
	visitedUrls: string[];
	stepsExecuted: number;
	extractionPrompts: Array<{
		pageUrl: string;
		extractPrompt: string;
	}>;
	toolCalls: Array<{
		tools: Array<{
			name: string;
			input: unknown;
		}>;
	}>;
	browserbaseUsed: boolean;
}

export interface BrowsingSuccessResponse {
	success: true;
	url: string;
	report: string;
	metadata: BrowsingMetadata;
}

export interface BrowsingErrorResponse {
	success: false;
	url: string;
	error: string;
}

export type BrowsingResponse = BrowsingSuccessResponse | BrowsingErrorResponse;

// Input type for the API call
export interface AnalyzeBrowsingInput {
	url: string;
	sessionId?: string;
}

// API function
async function analyzeBrowsing(input: AnalyzeBrowsingInput): Promise<BrowsingResponse> {
	const response = await fetch("http://localhost:3001/browsing", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			url: input.url,
			...(input.sessionId && { sessionId: input.sessionId }),
		}),
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
}

interface UseAnalyzeBrowsingOptions {
	onSuccess?: (data: BrowsingResponse) => void;
	onError?: (error: Error) => void;
}

export function useAnalyzeBrowsing(options?: UseAnalyzeBrowsingOptions) {
	return useMutation({
		mutationFn: analyzeBrowsing,
		onSuccess: (data) => {
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			options?.onError?.(error);
		},
	});
}
