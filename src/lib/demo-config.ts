/**
 * Demo Mode Configuration
 *
 * Contains premade app IDs and configuration for the demo flow.
 * These apps are pre-created in NextRows and extract data from SEC EDGAR.
 */

export interface DemoApp {
	appId: string;
	tableName: string;
	description: string;
}

/**
 * Premade NextRows apps for demo mode.
 * These apps extract superinvestor data from Dataroma.
 */
export const DEMO_APPS: DemoApp[] = [
	{
		appId: "sheow0b5m0",
		tableName: "superinvestor_portfolios",
		description: "Superinvestor portfolio updates",
	},
	{
		appId: "5uq0m2gxq4",
		tableName: "insider_buys",
		description: "Latest insider buy transactions",
	},
	{
		appId: "4ep0tzmt4o",
		tableName: "top_holdings",
		description: "Most owned stocks by superinvestors",
	},
];

/**
 * Demo target URL - Dataroma superinvestor portfolios
 */
export const DEMO_TARGET_URL = "https://www.dataroma.com/m/home.php";

/**
 * Demo step identifiers for the carousel-based demo flow
 */
export type DemoStep =
	| "LIVE_VIEW"
	| "ANALYZING"
	| "CREATING_APPS"
	| "DB_CONNECT"
	| "RUNNING_APPS"
	| "COMPLETE"
	| "TABLE_VIEW";

/**
 * Step configuration for the demo carousel
 */
export interface StepConfig {
	id: DemoStep;
	index: number;
	shortLabel: string;
	fullLabel: string;
	autoAdvance: boolean;
}

/**
 * Demo steps configuration
 */
export const DEMO_STEPS: StepConfig[] = [
	{ id: "LIVE_VIEW", index: 0, shortLabel: "Live View", fullLabel: "Viewing Website", autoAdvance: true },
	{ id: "ANALYZING", index: 1, shortLabel: "Analyzing", fullLabel: "Analyzing Structure", autoAdvance: true },
	{ id: "CREATING_APPS", index: 2, shortLabel: "Creating", fullLabel: "Creating Apps", autoAdvance: true },
	{ id: "DB_CONNECT", index: 3, shortLabel: "Connect", fullLabel: "Database Connection", autoAdvance: false },
	{ id: "RUNNING_APPS", index: 4, shortLabel: "Running", fullLabel: "Running Apps", autoAdvance: true },
	{ id: "COMPLETE", index: 5, shortLabel: "Complete", fullLabel: "Complete", autoAdvance: false },
	{ id: "TABLE_VIEW", index: 6, shortLabel: "Data", fullLabel: "Your Data", autoAdvance: false },
];

/**
 * Helper to get step config by ID
 */
export function getStepConfig(stepId: DemoStep): StepConfig {
	const step = DEMO_STEPS.find((s) => s.id === stepId);
	if (!step) throw new Error(`Unknown step: ${stepId}`);
	return step;
}

/**
 * Helper to get step index
 */
export function getStepIndex(stepId: DemoStep): number {
	return getStepConfig(stepId).index;
}

/**
 * Animation phases for "Creating Apps" animation (15 seconds total)
 */
export const APP_CREATION_PHASES = [
	{ message: "Analyzing website structure...", duration: 5000 },
	{ message: "Generating extraction apps...", duration: 5000 },
	{ message: "Finalizing app configuration...", duration: 5000 },
] as const;

export const APP_CREATION_TOTAL_DURATION = 15000; // 15 seconds
