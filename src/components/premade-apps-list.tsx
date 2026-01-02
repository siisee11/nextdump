import type { ReactNode } from "react";
import { BriefcaseIcon, GlobeIcon, TrendingUpIcon } from "@/components/icons";
import type { DemoApp } from "@/lib/demo-config";

interface PremadeAppsListProps {
	apps: DemoApp[];
}

// Gradient configurations for each app
const GRADIENTS = [
	"bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300",
	"bg-gradient-to-br from-pink-400 via-rose-400 to-blue-400",
	"bg-gradient-to-br from-blue-400 via-teal-400 to-emerald-400",
];

// Map table names to icons
function getIconForApp(tableName: string): ReactNode {
	switch (tableName) {
		case "superinvestor_portfolios":
			return <BriefcaseIcon className="size-6" />;
		case "insider_buys":
			return <TrendingUpIcon className="size-6" />;
		case "top_holdings":
			return <GlobeIcon className="size-6" />;
		default:
			return <BriefcaseIcon className="size-6" />;
	}
}

// Format table name for display
function formatTableName(tableName: string): string {
	return tableName
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * PremadeAppsList - Visual display of premade NextRows apps for demo mode.
 *
 * Shows cards with:
 * - Colorful gradient header with icon
 * - App title and table count
 * - Progress bar showing completion
 */
export function PremadeAppsList({ apps }: PremadeAppsListProps) {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="text-center">
				<h2 className="text-2xl font-bold">Apps Ready!</h2>
				<p className="text-muted-foreground mt-1">{apps.length} extraction apps configured</p>
			</div>

			{/* App Cards Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{apps.map((app, index) => (
					<AppCard key={app.appId} app={app} gradient={GRADIENTS[index % GRADIENTS.length]} />
				))}
			</div>
		</div>
	);
}

interface AppCardProps {
	app: DemoApp;
	gradient: string;
}

function AppCard({ app, gradient }: AppCardProps) {
	return (
		<div className="rounded-2xl overflow-hidden bg-card border shadow-sm hover:shadow-md transition-shadow">
			{/* Gradient Header with Icon */}
			<div className={`${gradient} p-6 pb-8`}>
				<div className="size-12 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-sm">
					{getIconForApp(app.tableName)}
				</div>
			</div>

			{/* Content */}
			<div className="p-4 -mt-2 bg-card rounded-t-xl relative">
				<h3 className="font-bold text-lg leading-tight">{formatTableName(app.tableName)}</h3>
				<p className="text-sm text-muted-foreground mt-1">1 table ready</p>

				{/* Progress Bar */}
				<div className="mt-4 flex items-center gap-3">
					<div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
						<div className="h-full w-full bg-rose-500 rounded-full" />
					</div>
					<span className="text-sm font-medium text-rose-500">100%</span>
				</div>
			</div>
		</div>
	);
}
