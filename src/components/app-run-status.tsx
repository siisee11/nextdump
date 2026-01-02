import { AlertCircleIcon, CheckCircleIcon, DatabaseIcon, LoaderIcon } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import type { AppRunResult, RunAppsResponse } from "@/hooks/useRunApps";

interface AppRunStatusProps {
	response: RunAppsResponse | null;
	isRunning: boolean;
	appsCount: number;
}

export function AppRunStatus({ response, isRunning, appsCount }: AppRunStatusProps) {
	if (isRunning) {
		return (
			<Card>
				<CardContent className="py-6">
					<div className="flex flex-col items-center justify-center gap-4">
						<LoaderIcon className="size-8 text-primary animate-spin" />
						<div className="text-center">
							<h3 className="font-semibold mb-1">Running Apps...</h3>
							<p className="text-sm text-muted-foreground">
								Executing {appsCount} app{appsCount > 1 ? "s" : ""} and inserting data into your
								database.
							</p>
							<p className="text-xs text-muted-foreground mt-2">
								This may take a few minutes depending on the data volume.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!response) {
		return null;
	}

	return (
		<div className="space-y-4">
			{/* Summary Card */}
			<Card
				className={
					response.success
						? "border-green-500/50 bg-green-500/5"
						: "border-amber-500/50 bg-amber-500/5"
				}
			>
				<CardContent className="py-4">
					<div className="flex items-center gap-3">
						{response.success ? (
							<CheckCircleIcon className="size-6 text-green-500" />
						) : (
							<AlertCircleIcon className="size-6 text-amber-500" />
						)}
						<div>
							<h3 className="font-semibold">
								{response.success ? "All Apps Completed Successfully" : "Some Apps Failed"}
							</h3>
							<p className="text-sm text-muted-foreground">
								{response.summary.succeeded} of {response.summary.total} apps succeeded
								{response.summary.totalRowsInserted > 0 && (
									<span>
										{" "}
										• {response.summary.totalRowsInserted.toLocaleString()} rows inserted
									</span>
								)}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Individual App Results */}
			<div className="space-y-2">
				{response.results.map((result) => (
					<AppResultCard key={result.appId} result={result} />
				))}
			</div>
		</div>
	);
}

function AppResultCard({ result }: { result: AppRunResult }) {
	const isSuccess = result.status === "success";

	return (
		<div
			className={`flex items-start gap-3 p-3 rounded-lg border ${
				isSuccess ? "border-green-500/30 bg-green-500/5" : "border-destructive/30 bg-destructive/5"
			}`}
		>
			{isSuccess ? (
				<CheckCircleIcon className="size-5 text-green-500 shrink-0 mt-0.5" />
			) : (
				<AlertCircleIcon className="size-5 text-destructive shrink-0 mt-0.5" />
			)}

			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 flex-wrap">
					<code className="text-sm font-mono font-medium">{result.appId}</code>
					<span className="text-muted-foreground">→</span>
					<span className="flex items-center gap-1 text-sm">
						<DatabaseIcon className="size-3.5" />
						<code className="font-mono">{result.tableName}</code>
					</span>
				</div>

				{isSuccess ? (
					<p className="text-sm text-muted-foreground mt-1">
						Inserted {result.insertedCount?.toLocaleString()} of{" "}
						{result.totalItems?.toLocaleString()} rows
					</p>
				) : (
					<p className="text-sm text-destructive mt-1">{result.error}</p>
				)}
			</div>
		</div>
	);
}
