import { useQuery } from "@tanstack/react-query";

// Types matching the backend response
export interface TableColumn {
	name: string;
	dataType: string;
}

export interface TableData {
	tableName: string;
	columns: TableColumn[];
	rows: Record<string, unknown>[];
	totalRows: number;
}

export interface AllTablesDataResponse {
	success: true;
	tables: TableData[];
}

export interface TableDataError {
	success: false;
	error: string;
}

interface UseAllTablesDataParams {
	connectionString: string;
	tableNames: string[];
	limit?: number;
}

/**
 * Fetches data from multiple tables at once.
 * Used in demo mode to display all tables after app execution.
 */
async function fetchAllTablesData(params: UseAllTablesDataParams): Promise<AllTablesDataResponse> {
	const response = await fetch("http://localhost:3001/db/tables/all", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			connectionString: params.connectionString,
			tableNames: params.tableNames,
			limit: params.limit ?? 100,
		}),
	});

	if (!response.ok) {
		const errorData = (await response.json()) as TableDataError;
		throw new Error(errorData.error ?? `HTTP error! status: ${response.status}`);
	}

	return response.json();
}

/**
 * Hook to fetch data from multiple tables at once.
 * Automatically queries when enabled and refetches on param changes.
 */
export function useAllTablesData(params: UseAllTablesDataParams & { enabled?: boolean }) {
	const { connectionString, tableNames, limit, enabled = true } = params;

	return useQuery({
		queryKey: ["allTablesData", connectionString, tableNames, limit],
		queryFn: () => fetchAllTablesData({ connectionString, tableNames, limit }),
		enabled: enabled && !!connectionString && tableNames.length > 0,
		staleTime: 30_000, // 30 seconds
		refetchOnWindowFocus: false,
	});
}

// Single table fetch for granular use
interface UseSingleTableDataParams {
	connectionString: string;
	tableName: string;
	limit?: number;
	offset?: number;
}

export interface SingleTableDataResponse {
	success: true;
	tableName: string;
	columns: TableColumn[];
	rows: Record<string, unknown>[];
	totalRows: number;
	limit: number;
	offset: number;
}

async function fetchSingleTableData(
	params: UseSingleTableDataParams,
): Promise<SingleTableDataResponse> {
	const searchParams = new URLSearchParams({
		connectionString: params.connectionString,
		limit: String(params.limit ?? 100),
		offset: String(params.offset ?? 0),
	});

	const response = await fetch(
		`http://localhost:3001/db/tables/${encodeURIComponent(params.tableName)}?${searchParams}`,
	);

	if (!response.ok) {
		const errorData = (await response.json()) as TableDataError;
		throw new Error(errorData.error ?? `HTTP error! status: ${response.status}`);
	}

	return response.json();
}

/**
 * Hook to fetch data from a single table with pagination support.
 */
export function useTableData(params: UseSingleTableDataParams & { enabled?: boolean }) {
	const { connectionString, tableName, limit, offset, enabled = true } = params;

	return useQuery({
		queryKey: ["tableData", connectionString, tableName, limit, offset],
		queryFn: () => fetchSingleTableData({ connectionString, tableName, limit, offset }),
		enabled: enabled && !!connectionString && !!tableName,
		staleTime: 30_000, // 30 seconds
		refetchOnWindowFocus: false,
	});
}
