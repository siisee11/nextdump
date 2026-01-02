import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { DemoStepIndicator } from "@/components/demo-step-indicator";
import {
	DemoAnalyzingStep,
	DemoCompleteStep,
	DemoCreatingAppsStep,
	DemoDbConnectStep,
	DemoLiveViewStep,
	DemoRunningAppsStep,
	DemoTableViewStep,
} from "@/components/demo-steps";
import { ArrowLeftIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useAnalyzeBrowsing } from "@/hooks/useAnalyzeBrowsing";
import { useBrowsingSession } from "@/hooks/useBrowsingSession";
import type { RunAppsResponse } from "@/hooks/useRunApps";
import { useRunApps } from "@/hooks/useRunApps";
import { DEMO_APPS, type DemoStep, getStepIndex } from "@/lib/demo-config";
import { cn } from "@/lib/utils";

type SessionState = {
	sessionId: string | null;
	liveViewUrl: string | null;
};

/**
 * DemoCarousel - Main carousel container with step management.
 *
 * Manages the entire demo flow with 7 steps in a single viewport.
 * Steps auto-advance when conditions are met, with smooth transitions.
 */
export function DemoCarousel() {
	const params = useParams<{ projectId: string }>();
	const projectId = params.projectId || "";
	const hasStartedSession = useRef(false);
	const hasStartedAnalysis = useRef(false);
	const analysisStartTime = useRef<number | null>(null);

	// Current step state
	const [currentStep, setCurrentStep] = useState<DemoStep>("LIVE_VIEW");
	const [completedSteps, setCompletedSteps] = useState<DemoStep[]>([]);

	// Session state
	const [session, setSession] = useState<SessionState | null>(null);

	// Analysis result state (hidden from user in demo mode)
	const [analysisComplete, setAnalysisComplete] = useState(false);

	// Database connection state
	const [connectionString, setConnectionString] = useState("");
	const [isConnectionValid, setIsConnectionValid] = useState(false);

	// App execution state
	const [runResult, setRunResult] = useState<RunAppsResponse | null>(null);

	// Decode the URL from projectId (base64 encoded)
	const targetUrl = (() => {
		try {
			return atob(projectId);
		} catch {
			return "";
		}
	})();

	// Navigation helpers
	const goToStep = useCallback((step: DemoStep) => {
		setCurrentStep((prevStep) => {
			// Mark current step as completed when advancing
			const prevIndex = getStepIndex(prevStep);
			const newIndex = getStepIndex(step);
			if (newIndex > prevIndex) {
				setCompletedSteps((prev) => {
					const newCompleted = [...prev];
					if (!newCompleted.includes(prevStep)) {
						newCompleted.push(prevStep);
					}
					return newCompleted;
				});
			}
			return step;
		});
	}, []);

	const handleGoBack = () => {
		window.location.href = "/";
	};

	// Session creation mutation
	const { mutate: createSession, isPending: isCreatingSession } = useBrowsingSession({
		onSuccess: (data) => {
			setSession({
				sessionId: data.sessionId,
				liveViewUrl: data.liveViewUrl,
			});
			// Auto-advance to ANALYZING when session is created
			goToStep("ANALYZING");
		},
		onError: () => {
			// If session creation fails, we can still proceed without live preview
			setSession({ sessionId: null, liveViewUrl: null });
			goToStep("ANALYZING");
		},
	});

	// Analysis mutation (runs in background, result hidden from user)
	const { mutate: analyze } = useAnalyzeBrowsing({
		onSuccess: () => {
			setAnalysisComplete(true);
		},
		onError: () => {
			// Even on error, proceed (demo continues)
			setAnalysisComplete(true);
		},
	});

	// App execution mutation
	const { mutate: runApps, isPending: isRunningApps } = useRunApps({
		onSuccess: (data) => {
			setRunResult(data);
			goToStep("COMPLETE");
		},
		onError: (error) => {
			// On error, still show results (partial success possible)
			setRunResult({
				success: false,
				results: DEMO_APPS.map((app) => ({
					appId: app.appId,
					tableName: app.tableName,
					status: "error" as const,
					error: error.message,
				})),
				summary: {
					total: DEMO_APPS.length,
					succeeded: 0,
					failed: DEMO_APPS.length,
					totalRowsInserted: 0,
				},
			});
			goToStep("COMPLETE");
		},
	});

	// Step 1: Create session when page loads
	useEffect(() => {
		if (targetUrl && !hasStartedSession.current) {
			hasStartedSession.current = true;
			createSession();
		}
	}, [targetUrl, createSession]);

	// Step 2: Start analysis once we have the session (or failed to create one)
	useEffect(() => {
		if (session !== null && targetUrl && !hasStartedAnalysis.current) {
			hasStartedAnalysis.current = true;
			analysisStartTime.current = Date.now();
			analyze({
				url: targetUrl,
				...(session.sessionId && { sessionId: session.sessionId }),
			});
		}
	}, [session, targetUrl, analyze]);

	// Auto-advance from ANALYZING to CREATING_APPS (min 3 seconds)
	useEffect(() => {
		if (currentStep === "ANALYZING" && analysisComplete && analysisStartTime.current) {
			const elapsed = Date.now() - analysisStartTime.current;
			const minDuration = 3000; // 3 seconds minimum
			const remainingTime = Math.max(0, minDuration - elapsed);

			const timer = setTimeout(() => {
				goToStep("CREATING_APPS");
			}, remainingTime);

			return () => clearTimeout(timer);
		}
	}, [currentStep, analysisComplete, goToStep]);

	// Handle "Run Demo" button click
	const handleRunDemo = () => {
		if (!isConnectionValid || !connectionString) return;

		goToStep("RUNNING_APPS");
		runApps({
			apps: DEMO_APPS.map((app) => ({
				appId: app.appId,
				tableName: app.tableName,
			})),
			connectionString,
		});
	};

	// Handle step transitions
	const handleCreatingAppsComplete = useCallback(() => {
		goToStep("DB_CONNECT");
	}, [goToStep]);

	const handleViewData = useCallback(() => {
		goToStep("TABLE_VIEW");
	}, [goToStep]);

	const handleRunAgain = useCallback(() => {
		setRunResult(null);
		goToStep("DB_CONNECT");
	}, [goToStep]);

	// Render current step content
	const renderStepContent = () => {
		switch (currentStep) {
			case "LIVE_VIEW":
				return (
					<DemoLiveViewStep
						targetUrl={targetUrl}
						liveViewUrl={session?.liveViewUrl || null}
						isLoading={isCreatingSession || session === null}
					/>
				);
			case "ANALYZING":
				return (
					<DemoAnalyzingStep
						liveViewUrl={session?.liveViewUrl || null}
						targetUrl={targetUrl}
					/>
				);
			case "CREATING_APPS":
				return <DemoCreatingAppsStep onComplete={handleCreatingAppsComplete} />;
			case "DB_CONNECT":
				return (
					<DemoDbConnectStep
						apps={DEMO_APPS}
						connectionString={connectionString}
						onConnectionStringChange={setConnectionString}
						isConnectionValid={isConnectionValid}
						onConnectionValidated={setIsConnectionValid}
						onRunDemo={handleRunDemo}
					/>
				);
			case "RUNNING_APPS":
				return (
					<DemoRunningAppsStep apps={DEMO_APPS} response={runResult} isRunning={isRunningApps} />
				);
			case "COMPLETE":
				return <DemoCompleteStep response={runResult} onViewData={handleViewData} />;
			case "TABLE_VIEW":
				return (
					<DemoTableViewStep
						connectionString={connectionString}
						tableNames={DEMO_APPS.map((app) => app.tableName)}
						onRunAgain={handleRunAgain}
						onBackToHome={handleGoBack}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="h-screen flex flex-col overflow-hidden bg-background">
			{/* Header (fixed 64px) */}
			<header className="h-16 shrink-0 border-b border-border">
				<div className="h-full mx-auto max-w-6xl px-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="sm" onClick={handleGoBack}>
							<ArrowLeftIcon className="size-4 mr-1" />
							Back
						</Button>
						<div className="flex items-center gap-2">
							<img src="/icon.svg" alt="NextDump" className="size-6" />
							<span className="text-lg font-semibold">NextDump</span>
							<span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
								Demo
							</span>
						</div>
					</div>
				</div>
			</header>

			{/* Carousel Content (flexible height: 100vh - 64px header - 80px indicator) */}
			<main className="flex-1 min-h-0 overflow-hidden">
				<div className="h-full mx-auto max-w-4xl px-4 py-4">
					<div
						className={cn(
							"h-full transition-all duration-300 ease-out",
							// Add subtle animation on step change
							"animate-in fade-in slide-in-from-right-4",
						)}
						key={currentStep}
					>
						{renderStepContent()}
					</div>
				</div>
			</main>

			{/* Step Indicator (fixed 80px) */}
			<footer className="shrink-0 border-t border-border">
				<DemoStepIndicator currentStep={currentStep} completedSteps={completedSteps} />
			</footer>
		</div>
	);
}
