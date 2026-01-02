export interface VisitedPage {
	url: string;
	title: string;
	content: string;
	links: string[];
}

export interface ExtractionPrompt {
	pageUrl: string;
	extractPrompt: string;
}

const DEFAULT_FIELDS = ["title", "summary", "content", "imageUrl"];

const PAGE_TYPE_FIELDS: Array<{
	keywords: string[];
	fields: string[];
}> = [
	{
		keywords: ["manager", "managers", "team", "staff", "people", "leadership", "member"],
		fields: ["personName", "role", "bio", "profileUrl", "imageUrl"],
	},
	{
		keywords: ["product", "products", "shop", "store", "item", "catalog"],
		fields: [
			"productId",
			"productName",
			"price",
			"currency",
			"availability",
			"description",
			"imageUrl",
			"productUrl",
		],
	},
	{
		keywords: ["blog", "article", "news", "post"],
		fields: [
			"title",
			"summary",
			"authorName",
			"publishedDate",
			"content",
			"tags",
			"imageUrl",
			"articleUrl",
		],
	},
	{
		keywords: ["event", "events", "webinar", "conference"],
		fields: ["eventName", "startDate", "endDate", "location", "description", "registrationUrl"],
	},
	{
		keywords: ["job", "jobs", "career", "careers", "opening", "openings"],
		fields: [
			"jobTitle",
			"location",
			"department",
			"employmentType",
			"postedDate",
			"description",
			"applyUrl",
		],
	},
	{
		keywords: ["pricing", "plan", "plans"],
		fields: ["planName", "price", "currency", "billingPeriod", "planFeatures"],
	},
	{
		keywords: ["category", "categories", "collection", "collections"],
		fields: ["categoryName", "categorySlug", "description", "itemCount", "itemUrls"],
	},
	{
		keywords: ["directory", "listing", "listings"],
		fields: ["itemName", "itemUrl", "summary", "thumbnailUrl"],
	},
];

const MAX_FIELDS = 12;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX_PATTERN = /^[0-9a-f]{16,}$/i;
const NUMERIC_PATTERN = /^\d+$/;

export function normalizeUrlPattern(url: string): string {
	try {
		const parsed = new URL(url);
		const segments = parsed.pathname
			.split("/")
			.filter(Boolean)
			.map((segment) => {
				if (
					NUMERIC_PATTERN.test(segment) ||
					UUID_PATTERN.test(segment) ||
					HEX_PATTERN.test(segment)
				) {
					return "[id]";
				}
				return segment;
			});
		const path = segments.length > 0 ? `/${segments.join("/")}` : "/";
		return `${parsed.origin}${path}`;
	} catch {
		return url;
	}
}

function pushUnique(fields: string[], field: string) {
	if (!fields.includes(field)) {
		fields.push(field);
	}
}

function inferFields(page: VisitedPage): string[] {
	const haystack = `${page.url} ${page.title}`.toLowerCase();
	let fields = DEFAULT_FIELDS;

	for (const pageType of PAGE_TYPE_FIELDS) {
		if (pageType.keywords.some((keyword) => haystack.includes(keyword))) {
			fields = pageType.fields;
			break;
		}
	}

	const finalFields = [...fields];
	const content = page.content;

	if (/(usd|eur|gbp|\$|€|£)/i.test(content)) {
		pushUnique(finalFields, "price");
		pushUnique(finalFields, "currency");
	}
	if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(content)) {
		pushUnique(finalFields, "email");
	}
	if (/(phone|tel)/i.test(content)) {
		pushUnique(finalFields, "phone");
	}
	if (/\b\d{4}-\d{2}-\d{2}\b/.test(content)) {
		pushUnique(finalFields, "publishedDate");
	}

	return finalFields.slice(0, MAX_FIELDS);
}

export function buildExtractionPrompts(pages: VisitedPage[]): ExtractionPrompt[] {
	const promptsByUrl = new Map<string, ExtractionPrompt>();

	for (const page of pages) {
		const pageUrl = normalizeUrlPattern(page.url);
		if (promptsByUrl.has(pageUrl)) {
			continue;
		}

		const fields = inferFields(page);
		const extractPrompt = `Extract ${fields.join(", ")} from ${pageUrl}`;
		promptsByUrl.set(pageUrl, { pageUrl, extractPrompt });
	}

	return Array.from(promptsByUrl.values());
}
