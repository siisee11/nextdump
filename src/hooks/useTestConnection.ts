import { useMutation } from "@tanstack/react-query";

// API response types
export interface TestConnectionSuccess {
	success: true;
	database: string;
	version: string;
}

export interface TestConnectionError {
	success: false;
	error: string;
}

export type TestConnectionResponse = TestConnectionSuccess | TestConnectionError;

// Input type for the API call
export interface TestConnectionInput {
	connectionString: string;
}

// API function
async function testConnection(input: TestConnectionInput): Promise<TestConnectionResponse> {
	const response = await fetch("http://localhost:3001/db/test", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			connectionString: input.connectionString,
		}),
	});

	// The API returns 400 for connection failures with a JSON body
	const data = await response.json();
	return data;
}

interface UseTestConnectionOptions {
	onSuccess?: (data: TestConnectionResponse) => void;
	onError?: (error: Error) => void;
}

export function useTestConnection(options?: UseTestConnectionOptions) {
	return useMutation({
		mutationFn: testConnection,
		onSuccess: (data) => {
			options?.onSuccess?.(data);
		},
		onError: (error) => {
			options?.onError?.(error);
		},
	});
}
