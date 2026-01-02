import { CheckIcon } from "@phosphor-icons/react";
import { type DemoStep, DEMO_STEPS, getStepIndex } from "@/lib/demo-config";
import { cn } from "@/lib/utils";

interface DemoStepIndicatorProps {
	currentStep: DemoStep;
	completedSteps: DemoStep[];
}

/**
 * DemoStepIndicator - Bottom step indicator with dots and labels.
 *
 * Shows:
 * - Completed steps: Solid filled circle with checkmark
 * - Current step: Larger filled circle with pulse animation
 * - Upcoming steps: Hollow circle (muted)
 */
export function DemoStepIndicator({ currentStep, completedSteps }: DemoStepIndicatorProps) {
	const currentIndex = getStepIndex(currentStep);

	return (
		<div className="h-20 flex flex-col items-center justify-center gap-2 px-4">
			{/* Step dots */}
			<div className="flex items-center gap-1">
				{DEMO_STEPS.map((step, index) => {
					const isCompleted = completedSteps.includes(step.id);
					const isCurrent = step.id === currentStep;
					const isUpcoming = !isCompleted && !isCurrent;

					return (
						<div key={step.id} className="flex items-center">
							{/* Connector line (except for first step) */}
							{index > 0 && (
								<div
									className={cn(
										"w-6 sm:w-8 md:w-12 h-0.5 transition-colors duration-300",
										isCompleted || isCurrent ? "bg-primary" : "bg-muted"
									)}
								/>
							)}

							{/* Step dot */}
							<div className="relative">
								{isCurrent && (
									<span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
								)}
								<div
									className={cn(
										"relative flex items-center justify-center rounded-full transition-all duration-300",
										isCompleted && "size-6 bg-primary text-primary-foreground",
										isCurrent && "size-7 bg-primary text-primary-foreground",
										isUpcoming && "size-5 border-2 border-muted-foreground/30 bg-transparent"
									)}
								>
									{isCompleted && <CheckIcon weight="bold" className="size-3.5" />}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Current step label */}
			<div className="text-sm text-muted-foreground">
				<span className="font-medium text-foreground">Step {currentIndex + 1} of {DEMO_STEPS.length}:</span>{" "}
				<span className="hidden sm:inline">{DEMO_STEPS[currentIndex].fullLabel}</span>
				<span className="sm:hidden">{DEMO_STEPS[currentIndex].shortLabel}</span>
			</div>
		</div>
	);
}
