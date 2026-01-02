import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { normalizeTargetUrl } from "@/lib/normalize-target-url";

function GlobeIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
			<path d="M2 12h20" />
		</svg>
	);
}

function DatabaseIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<ellipse cx="12" cy="5" rx="9" ry="3" />
			<path d="M3 5V19a9 3 0 0 0 18 0V5" />
			<path d="M3 12a9 3 0 0 0 18 0" />
		</svg>
	);
}

function ZapIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
		</svg>
	);
}

function ShieldIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
			<path d="m9 12 2 2 4-4" />
		</svg>
	);
}

function ArrowRightIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M5 12h14" />
			<path d="m12 5 7 7-7 7" />
		</svg>
	);
}

function CheckIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M20 6 9 17l-5-5" />
		</svg>
	);
}

function SpiderIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="m8 6-2-4" />
			<path d="m16 6 2-4" />
			<path d="M12 6V2" />
			<path d="M4.5 14 3 21" />
			<path d="m19.5 14 1.5 7" />
			<path d="M12 6a6 6 0 0 0-6 6c0 5 6 6 6 12 0-6 6-7 6-12a6 6 0 0 0-6-6z" />
			<path d="m4 9 2 3.5" />
			<path d="m20 9-2 3.5" />
		</svg>
	);
}

export function LandingPage() {
	const [url, setUrl] = useState("");
	const [, setLocation] = useLocation();

	const handleGetStarted = () => {
		const normalizedUrl = normalizeTargetUrl(url);
		if (!normalizedUrl) return;

		const projectId = btoa(normalizedUrl);
		setLocation(`/p/${projectId}`);
	};

	const handleTryDemo = () => {
		// Use Dataroma as the demo target (superinvestor portfolios)
		const demoUrl = "https://www.dataroma.com/m/home.php";
		const projectId = btoa(demoUrl);
		setLocation(`/demo/${projectId}`);
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b border-border">
				<div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<img src="/icon.svg" alt="NextDump" className="h-6 w-6" />
						<span className="text-lg font-semibold">NextDump</span>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="py-20 md:py-32">
				<div className="mx-auto max-w-4xl px-4 text-center">
					<img
						src="/icon.svg"
						alt="NextDump"
						className="mx-auto mb-6 h-14 w-14"
					/>
					<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
						<ZapIcon className="size-4 text-primary" />
						Powered by NextRows API
					</div>

					<h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
						Crawl any website,
						<br />
						<span className="text-primary">dump to your database</span>
					</h1>

					<p className="mb-10 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
						Extract and store website content directly into your PostgreSQL database. No complex
						infrastructure. Full control over your data.
					</p>

					{/* URL Input */}
					<div className="mx-auto max-w-xl">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleGetStarted();
							}}
							className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
						>
							<Input
								type="url"
								placeholder="https://example.com"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								className="h-12 text-base"
								aria-label="Target URL"
							/>
							<Button type="submit" size="lg" className="h-12 px-6 gap-2">
								Get Started
								<ArrowRightIcon className="size-4" />
							</Button>
							<Button
								type="button"
								variant="outline"
								size="lg"
								className="h-12 px-6 gap-2"
								onClick={handleTryDemo}
							>
								<ZapIcon className="size-4" />
								Try Demo
							</Button>
						</form>
						<div className="mt-3 text-sm text-muted-foreground">
							<p>Free to use. No credit card required.</p>
							<p>We never store your credentials.</p>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="border-t border-border bg-muted/30 py-20">
				<div className="mx-auto max-w-6xl px-4">
					<div className="mb-12 text-center">
						<h2 className="mb-4 text-3xl font-bold">How it works</h2>
						<p className="text-muted-foreground">Three simple steps to get your website data</p>
					</div>

					<div className="grid gap-8 md:grid-cols-3">
						<div className="relative text-center">
							<div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
								<GlobeIcon className="size-8" />
							</div>
							<div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
								1
							</div>
							<h3 className="mb-2 text-lg font-semibold">Enter URL</h3>
							<p className="text-sm text-muted-foreground">
								Provide the target website URL you want to crawl. We'll automatically discover all
								linked pages.
							</p>
						</div>

						<div className="relative text-center">
							<div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
								<DatabaseIcon className="size-8" />
							</div>
							<div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
								2
							</div>
							<h3 className="mb-2 text-lg font-semibold">Connect Database</h3>
							<p className="text-sm text-muted-foreground">
								Add your PostgreSQL connection string. We'll create the necessary tables
								automatically.
							</p>
						</div>

						<div className="relative text-center">
							<div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
								<ZapIcon className="size-8" />
							</div>
							<div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
								3
							</div>
							<h3 className="mb-2 text-lg font-semibold">Start Crawling</h3>
							<p className="text-sm text-muted-foreground">
								Hit start and watch real-time progress. Data flows directly to your database.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="py-20">
				<div className="mx-auto max-w-6xl px-4">
					<div className="mb-12 text-center">
						<h2 className="mb-4 text-3xl font-bold">Everything you need to extract web data</h2>
						<p className="text-muted-foreground max-w-2xl mx-auto">
							Built for developers who want control over their data without the complexity of
							managing crawling infrastructure.
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<DatabaseIcon className="size-5 text-primary" />
									Your Database, Your Data
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Data goes directly to your PostgreSQL database. No intermediaries. Full ownership
									and control.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ZapIcon className="size-5 text-primary" />
									Real-time Progress
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Watch pages being crawled in real-time. See discovered pages, crawl progress, and
									any errors.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ShieldIcon className="size-5 text-primary" />
									Secure by Design
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									We never store your credentials. Connection strings are used only for the active
									session.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<GlobeIcon className="size-5 text-primary" />
									Smart Link Discovery
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Automatically discovers and follows internal links. Configurable crawl depth and
									page limits.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CheckIcon className="size-5 text-primary" />
									Robots.txt Respect
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Optionally respect robots.txt rules. Toggle on or off depending on your use case.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<SpiderIcon className="size-5 text-primary" />
									Auto Schema Creation
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									We automatically create the crawled_pages table in your database. Just connect and
									go.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-border py-8">
				<div className="mx-auto max-w-6xl px-4">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">NextDump — Web Crawler Service</span>
						</div>
						<p className="text-sm text-muted-foreground">Built with NextRows API</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
