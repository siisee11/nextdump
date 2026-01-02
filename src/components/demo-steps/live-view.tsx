import { GlobeIcon, NextDumpIcon } from "@/components/icons";
import { Safari } from "@/components/ui/safari";

interface DemoLiveViewStepProps {
	targetUrl: string;
	liveViewUrl: string | null;
	isLoading: boolean;
}

/**
 * Step 1: Live View
 * Shows the target URL and live browser preview
 */
export function DemoLiveViewStep({ targetUrl, liveViewUrl, isLoading }: DemoLiveViewStepProps) {
	return (
		<div className="h-full flex flex-col gap-4">
			{/* Target URL display (compact) */}
			<div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
				<GlobeIcon className="size-4 text-primary shrink-0" />
				<code className="text-sm truncate">{targetUrl}</code>
			</div>

			{/* Live browser preview */}
			<div className="flex-1 min-h-0">
				<Safari url={targetUrl} className="w-full">
					<div className="relative size-full bg-background">
						{isLoading || !liveViewUrl ? (
							<div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted/50">
								<NextDumpIcon className="size-8 text-primary" />
								<div className="text-center">
									<p className="font-medium">Starting browser session...</p>
									<p className="text-sm text-muted-foreground">This may take a few seconds</p>
								</div>
							</div>
						) : (
							<iframe
								src={liveViewUrl}
								sandbox="allow-same-origin allow-scripts"
								allow="clipboard-read; clipboard-write"
								title="Browserbase Live View"
								className="size-full"
							/>
						)}
					</div>
				</Safari>
			</div>
		</div>
	);
}
