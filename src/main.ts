import { Plugin } from 'obsidian';
import { GanttChartView, getGanttViewOptions } from './gantt-view';

export default class BasesGanttPlugin extends Plugin {
	async onload() {
		this.registerBasesView('gantt', {
			name: 'Gantt',
			icon: 'calendar-range',
			factory: (controller, containerEl) => {
				return new GanttChartView(controller, containerEl);
			},
			options: (config) => getGanttViewOptions(config),
		});

		// ── Command palette shortcuts ─────────────────────────────────

		this.addCommand({
			id: 'gantt-scroll-today',
			name: 'Gantt: Scroll to today',
			icon: 'calendar',
			checkCallback: (checking) => {
				const view = this.getActiveGanttView();
				if (checking) return !!view;
				view?.scrollToToday();
			},
		});

		this.addCommand({
			id: 'gantt-create-task',
			name: 'Gantt: Create new task',
			icon: 'plus',
			checkCallback: (checking) => {
				const view = this.getActiveGanttView();
				if (checking) return !!view;
				view?.createTaskAtToday();
			},
		});

		this.addCommand({
			id: 'gantt-view-day',
			name: 'Gantt: Day view',
			checkCallback: (checking) => {
				const view = this.getActiveGanttView();
				if (checking) return !!view;
				view?.setViewMode('Day');
			},
		});

		this.addCommand({
			id: 'gantt-view-week',
			name: 'Gantt: Week view',
			checkCallback: (checking) => {
				const view = this.getActiveGanttView();
				if (checking) return !!view;
				view?.setViewMode('Week');
			},
		});

		this.addCommand({
			id: 'gantt-view-month',
			name: 'Gantt: Month view',
			checkCallback: (checking) => {
				const view = this.getActiveGanttView();
				if (checking) return !!view;
				view?.setViewMode('Month');
			},
		});

		this.addCommand({
			id: 'gantt-view-year',
			name: 'Gantt: Year view',
			checkCallback: (checking) => {
				const view = this.getActiveGanttView();
				if (checking) return !!view;
				view?.setViewMode('Year');
			},
		});
	}

	private getActiveGanttView(): GanttChartView | null {
		// Prefer the instance inside the currently active workspace leaf
		for (const instance of GanttChartView.instances) {
			if (instance.isInActiveLeaf()) return instance;
		}
		// Fallback: return any instance
		for (const instance of GanttChartView.instances) {
			return instance;
		}
		return null;
	}
}
