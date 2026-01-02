export function normalizeTargetUrl(input: string): string | null {
	const trimmed = input.trim();
	if (!trimmed) return null;

	try {
		new URL(trimmed);
		return trimmed;
	} catch {
		// If missing protocol, try https://
		try {
			const withHttps = `https://${trimmed}`;
			new URL(withHttps);
			return withHttps;
		} catch {
			return null;
		}
	}
}
