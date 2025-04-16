export function computeCursorOffset(
	originalLine: string,
	originalCh: number,
	lookup: Record<string, string>
): number {
	let offset = 0;
	let i = 0;

	while (i < originalCh) {
		for (const token in lookup) {
			if (originalLine.startsWith(token, i)) {
				const replacement = lookup[token];
				offset += replacement.length - token.length;
				i += token.length;
				break;
			}
		}
		i++;
	}

	return originalCh + offset;
}
