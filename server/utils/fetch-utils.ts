import type { Browser } from "puppeteer-core";

/**
 * Helper function to fetch and extract content from a URL
 */
export async function fetchPageContent(url: string): Promise<{
	success: boolean;
	url: string;
	title: string;
	content: string;
	links: string[];
	error?: string;
}> {
	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent": "Mozilla/5.0 (compatible; WebCrawlerBot/1.0; +https://example.com/bot)",
				Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			},
		});

		if (!response.ok) {
			return {
				success: false,
				url,
				title: "",
				content: "",
				links: [],
				error: `HTTP ${response.status}: ${response.statusText}`,
			};
		}

		const html = await response.text();

		// Extract title
		const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
		const title = titleMatch ? titleMatch[1].trim() : "No title found";

		// Extract text content (simplified - removes HTML tags)
		const textContent = html
			.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
			.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
			.replace(/<[^>]+>/g, " ")
			.replace(/\s+/g, " ")
			.trim()
			.slice(0, 8000); // Limit content size

		// Extract links
		const linkRegex = /href=["']([^"']+)["']/gi;
		const links: string[] = [];
		const allMatches = html.matchAll(linkRegex);
		for (const match of allMatches) {
			if (links.length >= 50) break;
			const href = match[1];
			// Filter to only include http/https links and same-domain relative links
			if (href.startsWith("http://") || href.startsWith("https://")) {
				links.push(href);
			} else if (href.startsWith("/") && !href.startsWith("//")) {
				try {
					const baseUrl = new URL(url);
					links.push(`${baseUrl.origin}${href}`);
				} catch {
					// Skip invalid URLs
				}
			}
		}

		// Remove duplicates
		const uniqueLinks = [...new Set(links)];

		return {
			success: true,
			url,
			title,
			content: textContent,
			links: uniqueLinks,
		};
	} catch (error) {
		return {
			success: false,
			url,
			title: "",
			content: "",
			links: [],
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export async function fetchPageContentWithPuppeteer(
	url: string,
	browser: Browser,
): Promise<{
	success: boolean;
	url: string;
	title: string;
	content: string;
	links: string[];
	error?: string;
}> {
	// Getting the default context to ensure the sessions are recorded.
	const defaultContext = browser.browserContexts()[0] ?? (await browser.createBrowserContext());
	const pages = await defaultContext.pages();
	const page = pages[0] ?? (await defaultContext.newPage());
	console.log(`[fetchPageContentWithPuppeteer] Starting fetch for URL: ${url}`);

	try {
		console.log(`[fetchPageContentWithPuppeteer] Navigating to: ${url}`);
		await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
		const finalUrl = page.url();
		console.log(`[fetchPageContentWithPuppeteer] Navigation complete, final URL: ${finalUrl}`);

		const title = (await page.title()) || "No title found";
		console.log(`[fetchPageContentWithPuppeteer] Page title: ${title}`);

		const { text, links } = await page.evaluate(() => {
			const textContent = document.body?.innerText ?? "";
			const anchorLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
				.map((anchor) => anchor.href)
				.filter((href) => href.startsWith("http://") || href.startsWith("https://"));
			return { text: textContent, links: anchorLinks };
		});

		const content = text.replace(/\s+/g, " ").trim().slice(0, 8000);
		const uniqueLinks = [...new Set(links)].slice(0, 50);

		console.log(
			`[fetchPageContentWithPuppeteer] Extracted content length: ${content.length}, links count: ${uniqueLinks.length}`,
		);

		return {
			success: true,
			url: finalUrl || url,
			title,
			content,
			links: uniqueLinks,
		};
	} catch (error) {
		console.error(`[fetchPageContentWithPuppeteer] Error fetching ${url}:`, error);
		return {
			success: false,
			url,
			title: "",
			content: "",
			links: [],
			error: error instanceof Error ? error.message : "Unknown error",
		};
	} finally {
		// console.log("[fetchPageContentWithPuppeteer] Closing page");
		// await page.close().catch(() => undefined);
	}
}
