import { useState } from "react";
import { type AppEntry, AppIdInput } from "@/components/app-id-input";
import { AppRunStatus } from "@/components/app-run-status";
import { DatabaseConnectionForm } from "@/components/database-connection-form";
import { CheckCircleIcon, LoaderIcon } from "@/components/icons";
import { PromptList } from "@/components/prompt-list";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { BrowsingResponse } from "@/hooks/useAnalyzeBrowsing";
import { type RunAppsResponse, useRunApps } from "@/hooks/useRunApps";

type AnalysisSuccessProps = {
	data: BrowsingResponse & { success: true };
};

export function AnalysisSuccess({ data }: AnalysisSuccessProps) {
	// Phase 2 state - App IDs and Database Connection
	const [apps, setApps] = useState<AppEntry[]>([]);
	const [connectionString, setConnectionString] = useState("");
	const [isConnectionValid, setIsConnectionValid] = useState(false);

	// Phase 3 state - Run results
	const [runResult, setRunResult] = useState<RunAppsResponse | null>(null);

	// Run apps mutation
	const { mutate: runApps, isPending: isRunning } = useRunApps({
		onSuccess: (result) => {
			setRunResult(result);
		},
	});

	// Check if ready to proceed to Phase 3
	const canRunApps = apps.length > 0 && isConnectionValid && !isRunning && !runResult;

	// Handle running apps
	const handleRunApps = () => {
		if (!canRunApps) return;

		runApps({
			apps: apps.map((app) => ({
				appId: app.appId,
				tableName: app.tableName || undefined,
			})),
			connectionString,
		});
	};

	// Reset to run again
	const handleRunAgain = () => {
		setRunResult(null);
	};

	return (
		<div className="space-y-6">
			{/* Success Header */}
			<Card className="border-green-500/50 bg-green-500/5">
				<CardContent className="py-4">
					<div className="flex items-center gap-3">
						<CheckCircleIcon className="size-6 text-green-500" />
						<div>
							<h3 className="font-semibold">Analysis Complete</h3>
							<p className="text-sm text-muted-foreground">
								Visited {data.metadata.pagesVisited} pages in {data.metadata.stepsExecuted} steps
								{data.metadata.browserbaseUsed && " (with live browser)"}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Step 1: Extraction Prompts */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base flex items-center gap-2">
						<span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
							1
						</span>
						Create NextRows Apps
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground mb-4">
						Use the prompts below to create apps in NextRows. Copy each prompt and paste it into
						NextRows to generate an extraction app.
					</p>
					<PromptList prompts={data.metadata.extractionPrompts} />
				</CardContent>
			</Card>

			{/* Step 2: App ID Input */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base flex items-center gap-2">
						<span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
							2
						</span>
						Add App IDs
					</CardTitle>
				</CardHeader>
				<CardContent>
					<AppIdInput apps={apps} onChange={setApps} disabled={isRunning || !!runResult} />
				</CardContent>
			</Card>

			{/* Step 3: Database Connection */}
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-base flex items-center gap-2">
						<span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
							3
						</span>
						Connect Your Database
					</CardTitle>
				</CardHeader>
				<CardContent>
					<DatabaseConnectionForm
						connectionString={connectionString}
						onConnectionStringChange={setConnectionString}
						onConnectionValidated={setIsConnectionValid}
						disabled={isRunning || !!runResult}
					/>
				</CardContent>
			</Card>

			{/* Run Status - Shows when running or completed */}
			{(isRunning || runResult) && (
				<AppRunStatus response={runResult} isRunning={isRunning} appsCount={apps.length} />
			)}

			{/* Action Button */}
			<Card>
				<CardContent className="py-4">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div>
							<h3 className="font-semibold">
								{runResult ? "Run Complete" : isRunning ? "Running..." : "Ready to Run?"}
							</h3>
							<p className="text-sm text-muted-foreground">
								{runResult
									? runResult.success
										? "All apps completed successfully. You can run again with different apps."
										: "Some apps failed. Review the results above and try again."
									: isRunning
										? "Please wait while the apps are running..."
										: !apps.length && !isConnectionValid
											? "Add at least one app ID and connect your database to continue."
											: !apps.length
												? "Add at least one app ID to continue."
												: !isConnectionValid
													? "Test your database connection to continue."
													: `Run ${apps.length} app${apps.length > 1 ? "s" : ""} and insert data into your database.`}
							</p>
						</div>
						{runResult ? (
							<Button size="lg" onClick={handleRunAgain} variant="outline" className="min-w-32">
								Run Again
							</Button>
						) : (
							<Button size="lg" disabled={!canRunApps} onClick={handleRunApps} className="min-w-32">
								{isRunning ? (
									<>
										<LoaderIcon className="size-4 mr-2 animate-spin" />
										Running...
									</>
								) : (
									"Run Apps"
								)}
							</Button>
						)}
					</div>
				</CardContent>
			</Card>

			<Separator />

			{/* Pages Visited - Collapsible */}
			<Card>
				<Accordion>
					<AccordionItem value="pages-visited">
						<CardHeader className="pb-0">
							<AccordionTrigger>
								<CardTitle className="text-base">
									Pages Visited ({data.metadata.visitedUrls.length})
								</CardTitle>
							</AccordionTrigger>
						</CardHeader>
						<AccordionContent>
							<CardContent className="pt-4">
								<ul className="space-y-1">
									{data.metadata.visitedUrls.map((visitedUrl) => (
										<li key={visitedUrl} className="text-sm">
											<a
												href={visitedUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary hover:underline break-all"
											>
												{visitedUrl}
											</a>
										</li>
									))}
								</ul>
							</CardContent>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</Card>

			{/* Crawling Report - Collapsible */}
			<Card>
				<Accordion>
					<AccordionItem value="crawling-report">
						<CardHeader className="pb-0">
							<AccordionTrigger>
								<CardTitle className="text-base">Raw Crawling Report</CardTitle>
							</AccordionTrigger>
						</CardHeader>
						<AccordionContent>
							<CardContent className="pt-4">
								<div className="prose prose-sm dark:prose-invert max-w-none">
									<pre className="whitespace-pre-wrap text-sm leading-relaxed bg-muted p-4 rounded-lg overflow-x-auto">
										{data.report}
									</pre>
								</div>
							</CardContent>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</Card>
		</div>
	);
}
