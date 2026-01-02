import { CheckCircleIcon, DatabaseIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { RunAppsResponse } from "@/hooks/useRunApps";

interface DemoCompleteStepProps {
	response: RunAppsResponse | null;
	onViewData: () => void;
}

/**
 * Step 6: Complete
 * Shows success animation and summary stats
 */
export function DemoCompleteStep({ response, onViewData }: DemoCompleteStepProps) {
	if (!response) return null;

	const { summary } = response;

	return (
		<div className="h-full flex flex-col items-center justify-center p-8">
			<div className="w-full max-w-md flex flex-col items-center gap-6">
				{/* Success animation */}
				<div className="relative">
					<div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
					<div className="relative size-20 rounded-full bg-green-500/10 flex items-center justify-center">
						<CheckCircleIcon className="size-12 text-green-500" />
					</div>
				</div>

				{/* Title */}
				<div className="text-center">
					<h3 className="text-2xl font-bold mb-2">Demo Complete!</h3>
					<p className="text-muted-foreground">
						Your data has been successfully extracted and saved
					</p>
				</div>

				{/* Summary stats */}
				<Card className="w-full">
					<CardContent className="py-6">
						<div className="grid grid-cols-3 gap-4 text-center">
							<div>
								<div className="text-3xl font-bold text-primary">{summary.succeeded}</div>
								<div className="text-sm text-muted-foreground">Apps Run</div>
							</div>
							<div>
								<div className="text-3xl font-bold text-primary">
									{summary.totalRowsInserted.toLocaleString()}
								</div>
								<div className="text-sm text-muted-foreground">Rows Inserted</div>
							</div>
							<div>
								<div className="text-3xl font-bold text-primary">{summary.succeeded}</div>
								<div className="text-sm text-muted-foreground">Tables Created</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* View Data button */}
				<Button size="lg" onClick={onViewData} className="px-8">
					<DatabaseIcon className="size-4 mr-2" />
					View Data
				</Button>
			</div>
		</div>
	);
}
