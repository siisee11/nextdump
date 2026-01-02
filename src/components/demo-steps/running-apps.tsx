import { forwardRef, type ReactNode, useRef } from "react";
import {
	BriefcaseIcon,
	DatabaseIcon,
	GlobeIcon,
	NextDumpIcon,
	TrendingUpIcon,
} from "@/components/icons";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { cn } from "@/lib/utils";

interface DemoRunningAppsStepProps {
	apps: unknown[];
}

const Circle = forwardRef<HTMLDivElement, { className?: string; children?: ReactNode }>(
	({ className, children }, ref) => {
		return (
			<div
				ref={ref}
				className={cn(
					"z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
					className,
				)}
			>
				{children}
			</div>
		);
	},
);

Circle.displayName = "Circle";

/**
 * Step 5: Running Apps
 * Shows animated beams connecting app icons to NextDump to database icons
 */
export function DemoRunningAppsStep({ apps }: DemoRunningAppsStepProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const centerRef = useRef<HTMLDivElement>(null);

	// Left side refs (app icons)
	const leftRef1 = useRef<HTMLDivElement>(null);
	const leftRef2 = useRef<HTMLDivElement>(null);
	const leftRef3 = useRef<HTMLDivElement>(null);

	// Right side refs (database icons)
	const rightRef1 = useRef<HTMLDivElement>(null);
	const rightRef2 = useRef<HTMLDivElement>(null);
	const rightRef3 = useRef<HTMLDivElement>(null);

	return (
		<div className="h-full flex flex-col items-center justify-center p-8">
			<div className="w-full max-w-2xl">
				<div className="text-center mb-8">
					<h2 className="text-2xl font-bold">Running Apps...</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Executing {apps.length} apps and inserting data into your database
					</p>
				</div>

				<div
					ref={containerRef}
					className="relative flex h-[300px] w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-10"
				>
					<div className="flex size-full max-w-lg flex-row items-stretch justify-between gap-10">
						{/* Left column - App icons */}
						<div className="flex flex-col justify-center gap-4">
							<Circle ref={leftRef1}>
								<GlobeIcon className="size-6 text-muted-foreground" />
							</Circle>
							<Circle ref={leftRef2}>
								<BriefcaseIcon className="size-6 text-muted-foreground" />
							</Circle>
							<Circle ref={leftRef3}>
								<TrendingUpIcon className="size-6 text-muted-foreground" />
							</Circle>
						</div>

						{/* Center - NextDump icon */}
						<div className="flex flex-col justify-center">
							<Circle ref={centerRef} className="size-16">
								<NextDumpIcon className="size-10" />
							</Circle>
						</div>

						{/* Right column - Database icons */}
						<div className="flex flex-col justify-center gap-4">
							<Circle ref={rightRef1}>
								<DatabaseIcon className="size-6 text-muted-foreground" />
							</Circle>
							<Circle ref={rightRef2}>
								<DatabaseIcon className="size-6 text-muted-foreground" />
							</Circle>
							<Circle ref={rightRef3}>
								<DatabaseIcon className="size-6 text-muted-foreground" />
							</Circle>
						</div>
					</div>

					{/* Animated beams from left to center */}
					<AnimatedBeam
						containerRef={containerRef}
						fromRef={leftRef1}
						toRef={centerRef}
						curvature={-75}
						duration={4}
					/>
					<AnimatedBeam
						containerRef={containerRef}
						fromRef={leftRef2}
						toRef={centerRef}
						duration={4}
					/>
					<AnimatedBeam
						containerRef={containerRef}
						fromRef={leftRef3}
						toRef={centerRef}
						curvature={75}
						duration={4}
					/>

					{/* Animated beams from center to right */}
					<AnimatedBeam
						containerRef={containerRef}
						fromRef={centerRef}
						toRef={rightRef1}
						curvature={-75}
						duration={4}
					/>
					<AnimatedBeam
						containerRef={containerRef}
						fromRef={centerRef}
						toRef={rightRef2}
						duration={4}
					/>
					<AnimatedBeam
						containerRef={containerRef}
						fromRef={centerRef}
						toRef={rightRef3}
						curvature={75}
						duration={4}
					/>
				</div>
			</div>
		</div>
	);
}
