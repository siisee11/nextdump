import { DemoCarousel } from "@/components/demo-carousel";

/**
 * DemoProjectPage - Carousel-based demo flow.
 *
 * Demo Flow (7 steps):
 * 1. LIVE_VIEW - Browser session opens, shows live preview of target site
 * 2. ANALYZING - AI agent analyzes the website structure
 * 3. CREATING_APPS - Animated "creating apps" phase (15s animation)
 * 4. DB_CONNECT - Form prompts user for PostgreSQL connection string
 * 5. RUNNING_APPS - Apps execute and data is saved to database
 * 6. COMPLETE - Success confirmation with summary
 * 7. TABLE_VIEW - Display extracted data in table format
 *
 * All steps are displayed in a single viewport with a carousel-based step indicator.
 */
export function DemoProjectPage() {
	return <DemoCarousel />;
}
