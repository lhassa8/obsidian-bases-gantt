/**
 * Utility functions for parsing Obsidian date values and converting
 * them to/from the formats Frappe Gantt expects.
 */

/**
 * Parse a date value from Obsidian's frontmatter into a JavaScript Date.
 * Handles ISO dates, datetimes, and numeric timestamps.
 * Appends T00:00:00 to date-only strings to prevent timezone shift.
 */
export function parseObsidianDate(value: unknown): Date | null {
	if (value == null) return null;

	if (value instanceof Date) {
		return isNaN(value.getTime()) ? null : value;
	}

	if (typeof value === 'number') {
		const d = new Date(value);
		return isNaN(d.getTime()) ? null : d;
	}

	if (typeof value !== 'string') return null;

	const trimmed = value.trim();
	if (!trimmed) return null;

	// Date-only: YYYY-MM-DD → append T00:00:00 to avoid timezone shift
	if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
		const d = new Date(trimmed + 'T00:00:00');
		return isNaN(d.getTime()) ? null : d;
	}

	// Datetime with space separator: YYYY-MM-DD HH:MM → convert to T separator
	if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
		const d = new Date(trimmed.replace(' ', 'T'));
		return isNaN(d.getTime()) ? null : d;
	}

	// ISO datetime or anything else Date can parse
	const d = new Date(trimmed);
	return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a Date as YYYY-MM-DD for Frappe Gantt.
 */
export function formatDateForGantt(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

/**
 * Format a Date for writing back to frontmatter.
 * Returns YYYY-MM-DD by default, or YYYY-MM-DDTHH:MM:SS if includeTime is true.
 */
export function formatDateForFrontmatter(date: Date, includeTime = false): string {
	if (!includeTime) {
		return formatDateForGantt(date);
	}
	const y = date.getFullYear();
	const mo = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	const h = String(date.getHours()).padStart(2, '0');
	const mi = String(date.getMinutes()).padStart(2, '0');
	const s = String(date.getSeconds()).padStart(2, '0');
	return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}
