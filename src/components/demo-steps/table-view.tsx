import { ArrowLeftIcon } from "@/components/icons";
import { TableViewDashboard } from "@/components/table-view-dashboard";
import { Button } from "@/components/ui/button";

interface DemoTableViewStepProps {
	connectionString: string;
	tableNames: string[];
	onRunAgain: () => void;
	onBackToHome: () => void;
}

/**
 * Step 7: Table View
 * Shows extracted data in table format with pagination
 */
export function DemoTableViewStep({
	connectionString,
	tableNames,
	onRunAgain,
	onBackToHome,
}: DemoTableViewStepProps) {
	return (
		<div className="h-full flex flex-col overflow-hidden">
			{/* Table data with internal scrolling */}
			<div className="flex-1 overflow-y-auto min-h-0 py-2">
				<TableViewDashboard connectionString={connectionString} tableNames={tableNames} />
			</div>

			{/* Action buttons (fixed at bottom) */}
			<div className="shrink-0 pt-4 flex justify-center gap-4 border-t bg-background">
				<Button variant="outline" onClick={onBackToHome}>
					<ArrowLeftIcon className="size-4 mr-1" />
					Back to Home
				</Button>
				<Button onClick={onRunAgain}>
					Run Again
				</Button>
			</div>
		</div>
	);
}
