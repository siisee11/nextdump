import { openai } from "@ai-sdk/openai";
import { zValidator } from "@hono/zod-validator";
import { generateText, stepCountIs, tool } from "ai";
import { Hono } from "hono";
import type { Browser } from "puppeteer-core";
import { getBrowserBySessionId } from "server/utils/browserbase";
import { z } from "zod";
import { fetchPageContent, fetchPageContentWithPuppeteer } from "../../utils/fetch-utils";
import { BROWSING_SYSTEM_PROMPT, browsingRequestSchema } from "./constants";
import { buildExtractionPrompts } from "./extraction-prompts";

// Analyze routes - AI agent that analyzes websites and generates crawling reports
const analyzeRoutes = new Hono().post(
	"/",
	//,
	zValidator("json", browsingRequestSchema),
	async (c) => {
		const { url, sessionId } = c.req.valid("json");
		let browser: Browser | null = null;

		try {
			browser = await getBrowserBySessionId(sessionId);
			if (!browser) {
				console.warn(`No stored session found for ${sessionId}, using direct fetch`);
			}

			// Store visited pages for the report
			const visitedPages: Array<{
				url: string;
				title: string;
				content: string;
				links: string[];
			}> = [];

			// Define tools for the browsing agent
			const browsingTools = {
				fetchPage: tool({
					description:
						"Fetch a web page and extract its content, title, and links. Use this to explore the website structure.",
					inputSchema: z.object({
						pageUrl: z.url().describe("The URL of the page to fetch and analyze"),
					}),
					execute: async ({ pageUrl }: { pageUrl: string }) => {
						console.log(`[fetchPage] Fetching page: ${pageUrl}`);
						const result = browser
							? await fetchPageContentWithPuppeteer(pageUrl, browser)
							: await fetchPageContent(pageUrl);
						if (result.success) {
							visitedPages.push({
								url: result.url,
								title: result.title,
								content: result.content,
								links: result.links,
							});
						}
						return result;
					},
				}),
				analyzeStructure: tool({
					description:
						"Analyze collected pages and return extraction prompts for each discovered page type.",
					inputSchema: z.object({}),
					execute: async () => {
						if (browser) {
							await browser.close();
						}
						buildExtractionPrompts(visitedPages);
					},
				}),
			};

			// Run the AI agent
			const result = await generateText({
				model: openai("gpt-5.1"),
				system: BROWSING_SYSTEM_PROMPT,
				prompt: `Analyze this website and create a comprehensive crawling report: ${url}`,
				tools: browsingTools,
				providerOptions: {
					openai: {
						parallelToolCalls: false,
					},
				},
				stopWhen: stepCountIs(15), // Allow up to 15 steps for thorough analysis
			});

			const extractionPrompts = buildExtractionPrompts(visitedPages);

			// Extract step information for transparency
			const toolCalls = result.steps
				.filter((step) => step.toolCalls && step.toolCalls.length > 0)
				.map((step) => ({
					tools: step.toolCalls.map((tc) => ({
						name: tc.toolName,
						input: tc.input,
					})),
				}));

			return c.json({
				success: true,
				url,
				report: result.text,
				metadata: {
					pagesVisited: visitedPages.length,
					visitedUrls: visitedPages.map((p) => p.url),
					stepsExecuted: result.steps.length,
					extractionPrompts,
					toolCalls,
					browserbaseUsed: Boolean(browser),
				},
			});
		} catch (error) {
			console.error("Browsing agent error:", error);
			return c.json(
				{
					success: false,
					url,
					error: error instanceof Error ? error.message : "Unknown error occurred",
				},
				500,
			);
		} finally {
			if (browser) {
				await browser.close();
			}
		}
	},
);

export { analyzeRoutes };
