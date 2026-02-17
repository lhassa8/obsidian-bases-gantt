# Bases Gantt

A Gantt chart / timeline view for [Obsidian Bases](https://obsidian.md/). Visualize your notes as an interactive project timeline with dependencies, progress tracking, and drag-to-edit.

Requires **Obsidian 1.10.0+** (Bases API).

## Features

- **Interactive Gantt chart** powered by [Frappe Gantt](https://github.com/nicedoc/frappe-gantt) — drag bars to change dates, resize to adjust duration
- **Auto-detection** — automatically maps your frontmatter properties (dates, progress, dependencies, status) without manual configuration
- **Dependency arrows** — link tasks via wiki-links in a frontmatter property (e.g., `depends-on: "[[Other Task]]"`)
- **Progress tracking** — visualize and edit task completion percentages by dragging the progress handle
- **Color coding** — color bars by any property (status, priority, category) using 8 distinct colors
- **Grouped rows** — when Bases groups are configured, tasks are organized under visual group headers
- **Rich hover popups** — hover over a bar to see date range, duration, progress, dependencies, and a markdown preview of the note
- **Right-click context menus** — open notes, set progress, create tasks, scroll to today
- **Click-to-create** — click an empty date column or use the command palette to create a new task
- **Milestones** — tasks where start equals end date render as compact milestone markers
- **Keyboard shortcuts** — command palette commands for scrolling, creating tasks, and switching view modes
- **Obsidian-native theming** — automatically adapts to light/dark mode and your accent color

## Installation

### From source

1. Clone this repository into your vault's plugins folder:
   ```
   cd /path/to/vault/.obsidian/plugins
   git clone https://github.com/lhassa8/obsidian-bases-gantt bases-gantt
   ```
2. Install dependencies and build:
   ```
   cd bases-gantt
   npm install
   npm run build
   ```
3. In Obsidian, go to **Settings > Community plugins** and enable **Bases Gantt**.

### Manual install

1. Download `main.js`, `styles.css`, and `manifest.json` from the latest release.
2. Create a folder `bases-gantt` in your vault's `.obsidian/plugins/` directory.
3. Copy the three files into it.
4. Enable the plugin in Obsidian settings.

## Usage

1. Create a **Base** in Obsidian (right-click a folder, or use the command palette).
2. Switch the view type to **Gantt** using the view selector dropdown.
3. The plugin automatically detects date properties in your notes. If auto-detection doesn't find the right properties, use the gear icon to manually configure:
   - **Start date** — the property containing each task's start date
   - **End date** — the property containing each task's end date (optional; defaults to +1 day)
   - **Dependencies** — a property containing wiki-links to predecessor tasks
   - **Color by** — a property whose values determine bar colors
   - **Progress** — a numeric property (0-100) for completion tracking
   - **Label** — override the displayed name (defaults to file name)

### Frontmatter example

```yaml
---
start-date: 2026-03-01
end-date: 2026-03-05
status: In Progress
progress: 40
depends-on: "[[Research]], [[Design]]"
---
```

### View options

| Option | Description |
|--------|-------------|
| View mode | Quarter Day, Half Day, Day, Week, Month, or Year |
| Bar height | Height of task bars in pixels (16-60) |
| Show progress | Display and allow editing of progress bars |
| Show expected progress | Show a dashed line for where progress should be based on elapsed time |

### Command palette

| Command | Description |
|---------|-------------|
| Gantt: Scroll to today | Jump the chart to today's date |
| Gantt: Create new task | Create a new note with today's date pre-filled |
| Gantt: Day view | Switch to day-level zoom |
| Gantt: Week view | Switch to week-level zoom |
| Gantt: Month view | Switch to month-level zoom |
| Gantt: Year view | Switch to year-level zoom |

## Development

```bash
npm install
npm run dev    # watch mode
npm run build  # production build
```

The build produces `main.js` and `styles.css` in the project root.

## License

[MIT](LICENSE)
