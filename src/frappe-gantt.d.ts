declare module 'frappe-gantt' {
	export interface FrappeTask {
		id: string;
		name: string;
		start: string;
		end: string;
		progress?: number;
		dependencies?: string;
		custom_class?: string;
		// Internal fields set by Gantt
		_start?: Date;
		_end?: Date;
		_index?: number;
		actual_duration?: number;
		ignored_duration?: number;
	}

	export interface PopupContext {
		task: FrappeTask;
		chart: Gantt;
		set_title(title: string): void;
		set_subtitle(subtitle: string): void;
		set_details(details: string): void;
	}

	export interface GanttOptions {
		arrow_curve?: number;
		auto_move_label?: boolean;
		bar_corner_radius?: number;
		bar_height?: number;
		container_height?: number | 'auto';
		column_width?: number | null;
		date_format?: string;
		upper_header_height?: number;
		lower_header_height?: number;
		snap_at?: string | null;
		infinite_padding?: boolean;
		holidays?: Record<string, string | unknown[]>;
		ignore?: string[] | ((d: Date) => boolean);
		language?: string;
		lines?: 'both' | 'vertical' | 'horizontal' | 'none';
		move_dependencies?: boolean;
		padding?: number;
		popup?: ((ctx: PopupContext) => void) | false;
		popup_on?: 'click' | 'hover';
		readonly_progress?: boolean;
		readonly_dates?: boolean;
		readonly?: boolean;
		hover_on_date?: boolean;
		fixed_duration?: boolean;
		scroll_to?: string | Date | null;
		show_expected_progress?: boolean;
		today_button?: boolean;
		view_mode?: string;
		view_mode_select?: boolean;
		view_modes?: unknown[];
		is_weekend?: (d: Date) => boolean;

		on_click?: (task: FrappeTask) => void;
		on_date_change?: (task: FrappeTask, start: Date, end: Date) => void;
		on_progress_change?: (task: FrappeTask, progress: number) => void;
		on_view_change?: (mode: unknown) => void;
		on_date_click?: (date: string) => void;
	}

	export default class Gantt {
		constructor(
			wrapper: string | HTMLElement | SVGElement,
			tasks: FrappeTask[],
			options?: GanttOptions,
		);

		$svg: SVGElement;
		$container: HTMLElement;
		tasks: FrappeTask[];

		refresh(tasks: FrappeTask[]): void;
		change_view_mode(mode?: string, maintain_pos?: boolean): void;
		update_options(options: GanttOptions): void;
		update_task(id: string, new_details: Partial<FrappeTask>): void;
		scroll_current(): void;
		clear(): void;

		static VIEW_MODE: {
			HOUR: unknown;
			QUARTER_DAY: unknown;
			HALF_DAY: unknown;
			DAY: unknown;
			WEEK: unknown;
			MONTH: unknown;
			YEAR: unknown;
		};
	}
}
