import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { type TableData, useAllTablesData } from "@/hooks/useTableData";
import { cn } from "@/lib/utils";
import { DatabaseIcon, LoaderIcon } from "./icons";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TableViewDashboardProps {
	connectionString: string;
	tableNames: string[];
}

/**
 * TableViewDashboard - Displays data from multiple tables using TanStack Table.
 * Shows each table in a card with pagination and sorting support.
 */
export function TableViewDashboard({ connectionString, tableNames }: TableViewDashboardProps) {
	const { data, isLoading, error, refetch } = useAllTablesData({
		connectionString,
		tableNames,
		limit: 100,
	});

	if (isLoading) {
		return (
			<Card>
				<CardContent className="py-12">
					<div className="flex flex-col items-center justify-center gap-4">
						<LoaderIcon className="size-8 text-primary animate-spin" />
						<div className="text-center">
							<h3 className="text-lg font-semibold mb-1">Loading Table Data</h3>
							<p className="text-sm text-muted-foreground">Fetching data from your database...</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className="py-12">
					<div className="flex flex-col items-center justify-center gap-4">
						<div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center">
							<DatabaseIcon className="size-6 text-destructive" />
						</div>
						<div className="text-center">
							<h3 className="text-lg font-semibold mb-1 text-destructive">Failed to Load Data</h3>
							<p className="text-sm text-muted-foreground max-w-md">{error.message}</p>
						</div>
						<Button variant="outline" onClick={() => refetch()}>
							Try Again
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!data || data.tables.length === 0) {
		return (
			<Card>
				<CardContent className="py-12">
					<div className="flex flex-col items-center justify-center gap-4">
						<div className="size-12 rounded-full bg-muted flex items-center justify-center">
							<DatabaseIcon className="size-6 text-muted-foreground" />
						</div>
						<div className="text-center">
							<h3 className="text-lg font-semibold mb-1">No Tables Found</h3>
							<p className="text-sm text-muted-foreground">
								The requested tables don't exist or have no data.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold flex items-center gap-2">
					<DatabaseIcon className="size-5 text-primary" />
					Your Data
				</h2>
				<Button variant="outline" size="sm" onClick={() => refetch()}>
					Refresh
				</Button>
			</div>

			{data.tables.map((table) => (
				<DataTableCard key={table.tableName} table={table} />
			))}
		</div>
	);
}

interface DataTableCardProps {
	table: TableData;
}

function DataTableCard({ table }: DataTableCardProps) {
	const [sorting, setSorting] = useState<SortingState>([]);

	// Generate columns dynamically from table columns
	const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => {
		return table.columns.map((col) => ({
			accessorKey: col.name,
			header: formatColumnHeader(col.name),
			cell: ({ getValue }) => {
				const value = getValue();
				return <CellValue value={value} dataType={col.dataType} />;
			},
		}));
	}, [table.columns]);

	const reactTable = useReactTable({
		data: table.rows,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageSize: 10,
			},
		},
	});

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base font-medium">{table.tableName}</CardTitle>
					<span className="text-sm text-muted-foreground">
						{table.totalRows} {table.totalRows === 1 ? "row" : "rows"}
					</span>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="rounded-md border overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-muted/50">
								{reactTable.getHeaderGroups().map((headerGroup) => (
									<tr key={headerGroup.id}>
										{headerGroup.headers.map((header) => (
											<th
												key={header.id}
												className={cn(
													"px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap",
													header.column.getCanSort() &&
														"cursor-pointer select-none hover:text-foreground",
												)}
												onClick={header.column.getToggleSortingHandler()}
											>
												<div className="flex items-center gap-1">
													{flexRender(header.column.columnDef.header, header.getContext())}
													{header.column.getIsSorted() && (
														<span className="text-xs">
															{header.column.getIsSorted() === "asc" ? "↑" : "↓"}
														</span>
													)}
												</div>
											</th>
										))}
									</tr>
								))}
							</thead>
							<tbody>
								{reactTable.getRowModel().rows.length === 0 ? (
									<tr>
										<td
											colSpan={columns.length}
											className="px-4 py-8 text-center text-muted-foreground"
										>
											No data available
										</td>
									</tr>
								) : (
									reactTable.getRowModel().rows.map((row) => (
										<tr
											key={row.id}
											className="border-t border-border hover:bg-muted/30 transition-colors"
										>
											{row.getVisibleCells().map((cell) => (
												<td
													key={cell.id}
													className="px-4 py-3 whitespace-nowrap max-w-[300px] truncate"
												>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</td>
											))}
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Pagination */}
				{table.rows.length > 10 && (
					<div className="flex items-center justify-between mt-4">
						<div className="text-sm text-muted-foreground">
							Showing {reactTable.getState().pagination.pageIndex * 10 + 1} to{" "}
							{Math.min((reactTable.getState().pagination.pageIndex + 1) * 10, table.rows.length)}{" "}
							of {table.rows.length} rows
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => reactTable.previousPage()}
								disabled={!reactTable.getCanPreviousPage()}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => reactTable.nextPage()}
								disabled={!reactTable.getCanNextPage()}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

/**
 * Formats snake_case column names to Title Case
 */
function formatColumnHeader(name: string): string {
	return name
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Renders cell value based on data type
 */
function CellValue({ value, dataType }: { value: unknown; dataType: string }) {
	if (value === null || value === undefined) {
		return <span className="text-muted-foreground italic">null</span>;
	}

	// Boolean values
	if (typeof value === "boolean") {
		return (
			<span
				className={cn(
					"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
					value
						? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
						: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
				)}
			>
				{value ? "true" : "false"}
			</span>
		);
	}

	// JSON/Object values
	if (typeof value === "object") {
		const jsonStr = JSON.stringify(value);
		return (
			<span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded" title={jsonStr}>
				{jsonStr.length > 50 ? `${jsonStr.slice(0, 50)}...` : jsonStr}
			</span>
		);
	}

	// Numeric values
	if (dataType.includes("numeric") || dataType.includes("int") || dataType.includes("float")) {
		return <span className="font-mono tabular-nums">{String(value)}</span>;
	}

	// Date/Time values
	if (dataType.includes("timestamp") || dataType.includes("date")) {
		const dateStr = String(value);
		try {
			const date = new Date(dateStr);
			if (!Number.isNaN(date.getTime())) {
				return <span title={dateStr}>{date.toLocaleString()}</span>;
			}
		} catch {
			// Fall through to default
		}
	}

	// URLs
	const strValue = String(value);
	if (strValue.startsWith("http://") || strValue.startsWith("https://")) {
		return (
			<a
				href={strValue}
				target="_blank"
				rel="noopener noreferrer"
				className="text-primary hover:underline"
				title={strValue}
			>
				{strValue.length > 40 ? `${strValue.slice(0, 40)}...` : strValue}
			</a>
		);
	}

	// Default text value
	return <span title={strValue.length > 50 ? strValue : undefined}>{strValue}</span>;
}
