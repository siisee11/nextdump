import { NextDumpIcon } from "@/components/icons";
import { Safari } from "@/components/ui/safari";

interface DemoAnalyzingStepProps {
	liveViewUrl: string | null;
	targetUrl: string;
}

/**
 * Step 2: Analyzing
 * Shows the live preview with an overlay indicating analysis is in progress
 */
export function DemoAnalyzingStep({ liveViewUrl, targetUrl }: DemoAnalyzingStepProps) {
	return (
		<div className="h-full flex flex-col relative">
			{/* Live browser preview (continues showing) */}
			<div className="flex-1 min-h-0">
				<Safari url={targetUrl} className="w-full">
					<div className="relative size-full bg-background">
						{liveViewUrl ? (
							<iframe
								src={liveViewUrl}
								sandbox="allow-same-origin allow-scripts"
								allow="clipboard-read; clipboard-write"
								title="Browserbase Live View"
								className="size-full"
							/>
						) : (
							<div className="absolute inset-0 bg-muted/20" />
						)}

						{/* Analysis overlay */}
						<div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex flex-col items-center justify-center gap-4">
							<div className="relative">
								<div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
								<div className="relative size-16 rounded-full bg-primary/10 flex items-center justify-center">
									<NextDumpIcon className="size-8 text-primary" />
								</div>
							</div>
							<div className="text-center">
								<h3 className="text-lg font-semibold mb-1">Analyzing website...</h3>
								<p className="text-sm text-muted-foreground">
									Our AI is examining the website structure
								</p>
							</div>

							{/* Subtle progress indicator */}
							<div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
								<div className="h-full bg-primary/50 animate-[progress_2s_ease-in-out_infinite]" />
							</div>
						</div>
					</div>
				</Safari>
			</div>

			<style>{`
				@keyframes progress {
					0% { width: 0%; transform: translateX(0); }
					50% { width: 100%; transform: translateX(0); }
					100% { width: 100%; transform: translateX(100%); }
				}
			`}</style>
		</div>
	);
}
