import { NullValue, DateValue, type BasesEntry, type BasesPropertyId, type Value } from 'obsidian';
import type { FrappeTask } from 'frappe-gantt';
import { parseObsidianDate, formatDateForGantt } from './date-utils';

/** Extended task type carrying the original file path for click-to-open. */
export interface GanttTask extends FrappeTask {
	filePath: string;
	isMilestone?: boolean;
}

/** Configuration for mapping entries to tasks, derived from view options. */
export interface TaskMapperConfig {
	startProperty: BasesPropertyId | null;
	endProperty: BasesPropertyId | null;
	labelProperty: BasesPropertyId | null;
	dependenciesProperty: BasesPropertyId | null;
	colorByProperty: BasesPropertyId | null;
	progressProperty: BasesPropertyId | null;
	showProgress: boolean;
}

/** Color class palette — maps to CSS classes gantt-color-0 through gantt-color-7. */
const COLOR_CLASS_COUNT = 8;

/**
 * Extract a string representation from an Obsidian Value object.
 * Returns null for NullValue or null/undefined inputs.
 * DateValue gets special handling: dateOnly() strips time for clean date strings.
 */
function extractRawValue(val: Value | null): string | null {
	if (val == null || val instanceof NullValue) return null;
	if (val instanceof DateValue) {
		return val.dateOnly().toString();
	}
	return val.toString();
}

/**
 * Make a stable task ID from a file path.
 * Frappe Gantt replaces spaces with underscores internally, so we do the same.
 */
function makeTaskId(filePath: string): string {
	return filePath.replace(/ /g, '_');
}

/** Prefix used to identify group header phantom tasks. */
export const GROUP_HEADER_PREFIX = '__group__';

/**
 * Create a phantom task that acts as a visual group header row.
 * It spans the full date range of the group's real tasks.
 */
export function createGroupHeaderTask(
	groupLabel: string,
	groupIndex: number,
	groupTasks: GanttTask[],
): GanttTask | null {
	if (groupTasks.length === 0) return null;

	// Find the min start and max end across all tasks in the group
	let minStart = groupTasks[0].start;
	let maxEnd = groupTasks[0].end;
	for (const t of groupTasks) {
		if (t.start < minStart) minStart = t.start;
		if (t.end > maxEnd) maxEnd = t.end;
	}

	return {
		id: `${GROUP_HEADER_PREFIX}${groupIndex}`,
		name: groupLabel,
		start: minStart,
		end: maxEnd,
		progress: 0,
		dependencies: '',
		custom_class: 'gantt-group-header',
		filePath: '',
	};
}

/**
 * Map an array of BasesEntry objects to GanttTask objects for Frappe Gantt.
 */
export function mapEntriesToTasks(
	entries: BasesEntry[],
	config: TaskMapperConfig,
): GanttTask[] {
	if (!config.startProperty) return [];

	// First pass: build maps for dependency resolution.
	// We map both basename and path-without-extension → task ID so that
	// [[Note]] and [[folder/Note]] wiki-links both resolve correctly.
	// When basenames collide, the basename key maps to the LAST entry,
	// but the full-path key is always unambiguous.
	const nameToId = new Map<string, string>();
	for (const entry of entries) {
		const id = makeTaskId(entry.file.path);
		nameToId.set(entry.file.basename, id);
		// Path without extension, e.g. "projects/Task A"
		const pathNoExt = entry.file.path.replace(/\.[^.]+$/, '');
		nameToId.set(pathNoExt, id);
	}

	// Collect unique values for color mapping
	const colorValues = new Map<string, number>();
	if (config.colorByProperty) {
		for (const entry of entries) {
			const val = entry.getValue(config.colorByProperty);
			const raw = extractRawValue(val);
			if (raw != null && !colorValues.has(String(raw))) {
				colorValues.set(String(raw), colorValues.size % COLOR_CLASS_COUNT);
			}
		}
	}

	const tasks: GanttTask[] = [];

	for (const entry of entries) {
		const startVal = entry.getValue(config.startProperty);
		const rawStart = extractRawValue(startVal);
		const startDate = parseObsidianDate(rawStart);
		if (!startDate) continue;

		let endDate: Date | null = null;
		if (config.endProperty) {
			const endVal = entry.getValue(config.endProperty);
			endDate = parseObsidianDate(extractRawValue(endVal));
		}
		// Default: if no end date, task spans 1 day
		if (!endDate) {
			endDate = new Date(startDate);
			endDate.setDate(endDate.getDate() + 1);
		}

		// Ensure end >= start
		if (endDate < startDate) {
			endDate = new Date(startDate);
			endDate.setDate(endDate.getDate() + 1);
		}

		// Label
		let name = entry.file.basename;
		if (config.labelProperty) {
			const labelVal = entry.getValue(config.labelProperty);
			const raw = extractRawValue(labelVal);
			if (raw != null && String(raw).trim()) {
				name = String(raw);
			}
		}

		// Progress
		let progress = 0;
		if (config.showProgress && config.progressProperty) {
			const progVal = entry.getValue(config.progressProperty);
			const raw = extractRawValue(progVal);
			if (raw != null) {
				const num = parseFloat(String(raw));
				if (!isNaN(num)) {
					progress = Math.max(0, Math.min(100, num));
				}
			}
		}

		// Dependencies: parse wiki-links from the property value
		let dependencies = '';
		if (config.dependenciesProperty) {
			const depVal = entry.getValue(config.dependenciesProperty);
			const raw = extractRawValue(depVal);
			if (raw != null) {
				const depStr = String(raw);
				// Extract [[link]] targets
				const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
				const depIds: string[] = [];
				let match;
				while ((match = wikiLinkRegex.exec(depStr)) !== null) {
					const linkTarget = match[1].trim();
					// Look up by basename
					const targetId = nameToId.get(linkTarget);
					if (targetId) {
						depIds.push(targetId);
					}
				}
				// Also handle comma-separated plain text names (no wiki-link syntax)
				if (depIds.length === 0 && !depStr.includes('[[')) {
					const plainDeps = depStr.split(',').map(s => s.trim()).filter(Boolean);
					for (const dep of plainDeps) {
						const targetId = nameToId.get(dep);
						if (targetId) {
							depIds.push(targetId);
						}
					}
				}
				dependencies = depIds.join(', ');
			}
		}

		// Color class
		let custom_class = '';
		if (config.colorByProperty) {
			const colorVal = entry.getValue(config.colorByProperty);
			const raw = extractRawValue(colorVal);
			if (raw != null) {
				const idx = colorValues.get(String(raw));
				if (idx !== undefined) {
					custom_class = `gantt-color-${idx}`;
				}
			}
		}

		// Milestone: start === end → render as a very short bar (Frappe handles this)
		const isMilestone = startDate.getTime() === endDate.getTime();
		if (isMilestone) {
			// Give milestones a minimal duration so Frappe can render them
			endDate = new Date(startDate);
			endDate.setDate(endDate.getDate() + 1);
			// Note: custom_class must NOT contain spaces — classList.add() in
			// Frappe Gantt's bar.refresh() throws DOMException on spaces.
			// Use only a single class; milestone styling is secondary to color.
			if (!custom_class) {
				custom_class = 'gantt-milestone';
			}
		}

		tasks.push({
			id: makeTaskId(entry.file.path),
			name,
			start: formatDateForGantt(startDate),
			end: formatDateForGantt(endDate),
			progress,
			dependencies,
			custom_class,
			filePath: entry.file.path,
			isMilestone,
		});
	}

	return sortByDependencies(tasks);
}

/**
 * Topological sort: tasks with no dependencies first, then tasks whose
 * dependencies are already placed. Ties broken by start date.
 * This ensures dependency arrows always point downward in the chart.
 */
function sortByDependencies(tasks: GanttTask[]): GanttTask[] {
	if (tasks.length <= 1) return tasks;

	const taskMap = new Map<string, GanttTask>();
	for (const t of tasks) taskMap.set(t.id, t);

	// Parse each task's dependency IDs into a Set
	const depsOf = new Map<string, Set<string>>();
	for (const t of tasks) {
		const deps = new Set<string>();
		if (t.dependencies) {
			for (const d of t.dependencies.split(',')) {
				const id = d.trim();
				if (id && taskMap.has(id)) deps.add(id);
			}
		}
		depsOf.set(t.id, deps);
	}

	const sorted: GanttTask[] = [];
	const placed = new Set<string>();
	const remaining = new Set(tasks.map(t => t.id));

	// Repeatedly pick tasks whose dependencies are all placed
	while (remaining.size > 0) {
		const ready: GanttTask[] = [];
		for (const id of remaining) {
			const deps = depsOf.get(id)!;
			const allMet = [...deps].every(d => placed.has(d));
			if (allMet) ready.push(taskMap.get(id)!);
		}

		if (ready.length === 0) {
			// Circular dependency — just append the rest by start date
			const rest = [...remaining].map(id => taskMap.get(id)!);
			rest.sort((a, b) => a.start.localeCompare(b.start));
			sorted.push(...rest);
			break;
		}

		// Sort ready tasks by start date
		ready.sort((a, b) => a.start.localeCompare(b.start));
		for (const t of ready) {
			sorted.push(t);
			placed.add(t.id);
			remaining.delete(t.id);
		}
	}

	return sorted;
}
