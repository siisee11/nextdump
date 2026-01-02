import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { AnalysisSuccess } from "@/components/analysis-success";
import { AlertCircleIcon, ArrowLeftIcon, GlobeIcon, LoaderIcon } from "@/components/icons";
import { LivePreview } from "@/components/live-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type BrowsingResponse, useAnalyzeBrowsing } from "@/hooks/useAnalyzeBrowsing";
import { useBrowsingSession } from "@/hooks/useBrowsingSession";

type SessionState = {
	sessionId: string | null;
	liveViewUrl: string | null;
};

export function ProjectPage() {
	const params = useParams<{ projectId: string }>();
	const projectId = params.projectId || "";
	const hasStartedSession = useRef(false);
	const hasStartedAnalysis = useRef(false);

	// Session state
	const [session, setSession] = useState<SessionState | null>(null);

	// Analysis result state
	const [result, setResult] = useState<{ data?: BrowsingResponse; error?: Error } | null>(null);

	// Decode the URL from projectId (base64 encoded)
	const targetUrl = (() => {
		try {
			return atob(projectId);
		} catch {
			return "";
		}
	})();

	// Session creation mutation
	const { mutate: createSession, isPending: isCreatingSession } = useBrowsingSession({
		onSuccess: (data) => {
			setSession({
				sessionId: data.sessionId,
				liveViewUrl: data.liveViewUrl,
			});
		},
		onError: () => {
			// If session creation fails, we can still proceed without live preview
			setSession({ sessionId: null, liveViewUrl: null });
		},
	});

	// Analysis mutation
	const { mutate: analyze, isPending: isAnalyzing } = useAnalyzeBrowsing({
		onSuccess: (data) => {
			setResult({ data });
		},
		onError: (error) => {
			setResult({ error });
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
			analyze({
				url: targetUrl,
				...(session.sessionId && { sessionId: session.sessionId }),
			});
		}
	}, [session, targetUrl, analyze]);

	// Derive state
	const isSuccess = !!result?.data;
	const isError = !!result?.error;
	const data = result?.data;
	const error = result?.error;
	const isPending = (isCreatingSession || isAnalyzing || session === null) && !result;
	const showLivePreview = session?.liveViewUrl && !isSuccess && !isError;

	const handleGoBack = () => {
		window.location.href = "/";
	};

	const handleRetry = () => {
		setResult(null);
		hasStartedSession.current = false;
		hasStartedAnalysis.current = false;
		setSession(null);
		createSession();
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b border-border">
				<div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="sm" onClick={handleGoBack}>
							<ArrowLeftIcon className="size-4 mr-1" />
							Back
						</Button>
						<div className="flex items-center gap-2">
							<img src="/icon.svg" alt="NextDump" className="size-6" />
							<span className="text-lg font-semibold">NextDump</span>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="mx-auto max-w-4xl px-4 py-8">
				{/* Target URL Card */}
				<Card className="mb-6">
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 text-base">
							<GlobeIcon className="size-5 text-primary" />
							Target URL
						</CardTitle>
					</CardHeader>
					<CardContent>
						<code className="block break-all rounded bg-muted px-3 py-2 text-sm">
							{targetUrl || "Invalid URL"}
						</code>
					</CardContent>
				</Card>

				{/* Live Preview */}
				{showLivePreview && session?.liveViewUrl && (
					<div className="mb-6">
						<LivePreview liveViewUrl={session.liveViewUrl} />
					</div>
				)}

				{/* Loading State */}
				{isPending && (
					<Card>
						<CardContent className="py-8">
							<div className="flex flex-col items-center justify-center gap-4">
								<LoaderIcon className="size-8 text-primary animate-spin" />
								<div className="text-center">
									<h3 className="text-lg font-semibold mb-1">Analyzing Website</h3>
									<p className="text-sm text-muted-foreground">
										{showLivePreview
											? "Watch the AI agent explore the website above"
											: "Our AI agent is exploring the website and generating a comprehensive report..."}
									</p>
									<p className="text-xs text-muted-foreground mt-2">
										This may take a minute or two.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Error State */}
				{isError && (
					<Card className="border-destructive">
						<CardContent className="py-8">
							<div className="flex flex-col items-center justify-center gap-4">
								<AlertCircleIcon className="size-12 text-destructive" />
								<div className="text-center">
									<h3 className="text-lg font-semibold mb-1">Analysis Failed</h3>
									<p className="text-sm text-muted-foreground mb-4">
										{error instanceof Error ? error.message : "An unexpected error occurred"}
									</p>
									<Button onClick={handleRetry}>Try Again</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Success State */}
				{isSuccess &&
					data &&
					(data.success ? (
						<AnalysisSuccess data={data} />
					) : (
						<Card className="border-destructive">
							<CardContent className="py-8">
								<div className="flex flex-col items-center justify-center gap-4">
									<AlertCircleIcon className="size-12 text-destructive" />
									<div className="text-center">
										<h3 className="text-lg font-semibold mb-1">Analysis Failed</h3>
										<p className="text-sm text-muted-foreground mb-4">{data?.error}</p>
										<Button onClick={handleRetry}>Try Again</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
			</main>
		</div>
	);
}
