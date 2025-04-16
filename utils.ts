export function computeCursorOffset(
	originalLine: string,
	originalCh: number,
	lookup: Record<string, string>
): number {
	let offset = 0;
	const regex = /:([\w.]+);/g;
	let match;

	while ((match = regex.exec(originalLine)) !== null) {
		const start = match.index;
		const end = regex.lastIndex;

		if (end <= originalCh) {
			const token = match[1];
			const replacement = lookup[token];
			if (replacement) {
				offset += replacement.length - (end - start);
			}
		} else if (start < originalCh) {
			const token = match[1];
			const replacement = lookup[token];
			if (replacement) {
				offset += replacement.length - (originalCh - start);
				break;
			}
		} else {
			break;
		}
	}

	return originalCh + offset;
}
