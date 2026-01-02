import { useEffect, useState } from "react";
import { CheckCircleIcon, LoaderIcon } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { APP_CREATION_PHASES, APP_CREATION_TOTAL_DURATION } from "@/lib/demo-config";

interface AppCreatingAnimationProps {
	onComplete: () => void;
}

/**
 * AppCreatingAnimation - 15-second animated component for demo mode.
 *
 * Shows phased text transitions:
 * - 0-5s: "Analyzing website structure..."
 * - 5-10s: "Generating extraction apps..."
 * - 10-15s: "Finalizing app configuration..."
 *
 * Auto-transitions to next state after 15 seconds.
 */
export function AppCreatingAnimation({ onComplete }: AppCreatingAnimationProps) {
	const [currentPhase, setCurrentPhase] = useState(0);
	const [progress, setProgress] = useState(0);
	const [completedPhases, setCompletedPhases] = useState<number[]>([]);

	// Handle phase transitions
	useEffect(() => {
		const phaseTimers: NodeJS.Timeout[] = [];
		let elapsed = 0;

		// Set up timers for each phase transition
		for (let i = 0; i < APP_CREATION_PHASES.length; i++) {
			elapsed += APP_CREATION_PHASES[i].duration;

			// Mark current phase as complete and move to next
			if (i < APP_CREATION_PHASES.length - 1) {
				const timer = setTimeout(() => {
					setCompletedPhases((prev) => [...prev, i]);
					setCurrentPhase(i + 1);
				}, elapsed);
				phaseTimers.push(timer);
			}
		}

		// Call onComplete after all phases are done
		const completeTimer = setTimeout(() => {
			setCompletedPhases((prev) => [...prev, APP_CREATION_PHASES.length - 1]);
			// Small delay before transition to show completion
			setTimeout(onComplete, 500);
		}, APP_CREATION_TOTAL_DURATION);

		return () => {
			for (const timer of phaseTimers) {
				clearTimeout(timer);
			}
			clearTimeout(completeTimer);
		};
	}, [onComplete]);

	// Animate progress bar
	useEffect(() => {
		const startTime = Date.now();
		const interval = setInterval(() => {
			const elapsed = Date.now() - startTime;
			const newProgress = Math.min((elapsed / APP_CREATION_TOTAL_DURATION) * 100, 100);
			setProgress(newProgress);

			if (newProgress >= 100) {
				clearInterval(interval);
			}
		}, 50);

		return () => clearInterval(interval);
	}, []);

	return (
		<Card>
			<CardContent className="py-8">
				<div className="flex flex-col items-center justify-center gap-6">
					{/* Animated spinner */}
					<div className="relative">
						<div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
						<LoaderIcon className="size-12 text-primary animate-spin relative z-10" />
					</div>

					{/* Title */}
					<div className="text-center">
						<h3 className="text-xl font-semibold mb-2">Creating NextRows Apps</h3>
						<p className="text-sm text-muted-foreground">
							We're generating custom extraction apps for the website.
						</p>
					</div>

					{/* Progress bar */}
					<div className="w-full max-w-md">
						<div className="h-2 bg-muted rounded-full overflow-hidden">
							<div
								className="h-full bg-primary transition-all duration-100 ease-linear"
								style={{ width: `${progress}%` }}
							/>
						</div>
						<p className="text-xs text-muted-foreground text-center mt-2">
							{Math.round(progress)}% complete
						</p>
					</div>

					{/* Phase list with status indicators */}
					<div className="w-full max-w-md space-y-3 mt-2">
						{APP_CREATION_PHASES.map((phase, index) => {
							const isCompleted = completedPhases.includes(index);
							const isCurrent = currentPhase === index && !isCompleted;

							return (
								<div
									key={phase.message}
									className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
										isCurrent
											? "bg-primary/10 border border-primary/20"
											: isCompleted
												? "bg-muted/50"
												: "opacity-50"
									}`}
								>
									{/* Status icon */}
									<div className="flex-shrink-0">
										{isCompleted ? (
											<CheckCircleIcon className="size-5 text-green-500" />
										) : isCurrent ? (
											<LoaderIcon className="size-5 text-primary animate-spin" />
										) : (
											<div className="size-5 rounded-full border-2 border-muted-foreground/30" />
										)}
									</div>

									{/* Phase text */}
									<span
										className={`text-sm ${
											isCurrent
												? "text-foreground font-medium"
												: isCompleted
													? "text-muted-foreground"
													: "text-muted-foreground/50"
										}`}
									>
										{phase.message}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
