# Daily Notch (Windows Edition) - Product Specification

## 1. Product Overview

An open-source Windows application that brings a "Dynamic Island" or "Notch-like" productivity tracker to the top-center of the Windows screen. It acts as a focus and task tracker that lives seamlessly at the top edge of your monitor. Hovering over or clicking the floating pill reveals your to-do list and activity streak. Starting a task runs a focus timer that stays visible in the collapsed pill.

**Target OS:** Windows 10 / Windows 11
**Tech Stack:** Flutter or Electron

## 2. Core Features

### 2.1. Top-Center "Pill" (The Notch Equivalent)
Since most Windows devices lack a physical screen notch, the app will render a floating, borderless "pill" at the top-center edge of the primary display.
*   **Collapsed State:** When a focus session is active, the pill displays a live countdown, the active task name, and a progress bar along the bottom edge.
*   **Idle State:** When nothing is active, it can show a minimal subtle indicator or a small clock/icon to indicate the app is running.

### 2.2. Hover Dashboard (Expanded State)
Hovering the mouse over the top-center pill smoothly expands it into a dashboard overlay containing two main panels:
*   **To-Do List:** 
    *   Today's tasks.
    *   One-tap Start/Pause buttons.
    *   Drag-to-reorder functionality.
    *   Quick "Add Task" inline input field.
*   **Activity Heatmap:** 
    *   A GitHub-style contribution heatmap showing your focus days.
    *   Running streak counter.

### 2.3. Main Tasks Window
A standard desktop window (accessible via the system tray or a button on the dashboard) for deeper management:
*   **Calendar View:** Monthly overview of tasks.
*   **Day / Unscheduled Toggle:** Easily move tasks with drag-and-drop.
*   **Task Details:** Time estimates, due dates/chips.
*   **Focus Time Picker:** A popover with preset chips (e.g., 15m, 25m, 60m) and +/- adjustments.

### 2.4. Focus Engine & Timer
*   Per-task estimates drive the countdown timer.
*   Custom focus and break lengths (Pomodoro style).
*   Completed blocks feed into the streak and heatmap data.

### 2.5. Settings & System Integration
*   **Settings Window:** Configure focus/break durations, notification toggles, sound alerts, and "Launch at Startup".
*   **System Tray (Taskbar Notification Area):** 
    *   App icon resides here (no mandatory Taskbar icon to keep the workspace clean).
    *   Right-click menu: Open Tasks, Toggle Focus, Settings, Quit.
*   **Global Hotkey:** `Win + Shift + Space` (or `Ctrl + Shift + Space`) to instantly toggle the active focus session from anywhere in Windows.
*   **Windows Notifications:** Native Windows toast notifications triggered when a focus block ends.

### 2.6. Local-First Storage
*   All data (tasks, settings, streaks) is persisted locally in JSON format in the `%APPDATA%` directory. No mandatory cloud sync, ensuring speed and privacy.

---

## 3. UI/UX & Design Guidelines

*   **Windows 11 Aesthetics:** Utilize rounded corners, subtle shadows, and native-feeling translucency (Mica/Acrylic effects where applicable).
*   **Animations:** Smooth, elastic expansion when hovering the pill, similar to the macOS Dynamic Island or Windows 11 flyouts.
*   **Always on Top:** The floating pill and dashboard must be drawn above other standard windows but should not interfere with full-screen games or videos.

---

## 4. Technical Stack Evaluation: Flutter vs. Electron

Both frameworks are capable of building this app. Here is a comparison for this specific use case:

### Option A: Electron (Recommended for deeper OS integration)
*   **Pros:** 
    *   Excellent ecosystem for desktop-specific APIs (Global Hotkeys via `globalShortcut`, System Tray via `Tray`).
    *   Very mature handling of borderless, transparent, "always-on-top" windows.
    *   Web technologies (React/Vue/Tailwind) make building complex UI like drag-and-drop and heatmaps very fast.
*   **Cons:** 
    *   Higher memory usage (runs Chromium).
    *   Larger bundle size.

### Option B: Flutter (Recommended for performance and footprint)
*   **Pros:** 
    *   Compiles to native Windows code (C++ under the hood).
    *   Very low memory footprint and fast startup times.
    *   Smooth, 60fps animations for the "Pill" expansion using Flutter's animation engine.
*   **Cons:** 
    *   Requires third-party plugins for System Tray (`system_tray`), Window positioning/transparency (`bitsdojo_window` or `window_manager`), and Global Hotkeys (`hotkey_manager`).
    *   Getting a true click-through, transparent, always-on-top overlay window on Windows can sometimes be finicky depending on the specific Flutter plugins used.

---

## 5. Architecture & Modules

1.  **Overlay Manager:** Handles the floating pill window (size, transparency, hover events, always-on-top state).
2.  **State Manager:** Central store for Tasks, Settings, and Timer state.
3.  **Timer Engine:** Runs the actual countdown logic, triggers system notifications when zero is reached.
4.  **Storage Service:** Reads and writes state to `%APPDATA%/DailyNotchTracker/store.json`.
5.  **Hotkey Manager:** Registers and listens for OS-level keyboard shortcuts.

---

## 6. Development Milestones

*   **Phase 1: Core Shell.** Setup the transparent, always-on-top pill window and system tray icon.
*   **Phase 2: UI Expansion.** Implement the hover-to-expand animation and build the Dashboard UI (To-Do & Activity panels).
*   **Phase 3: State & Timer.** Wire up the task creation logic and the focus countdown engine.
*   **Phase 4: Main Window.** Build the calendar and full task management window.
*   **Phase 5: Polish & OS Integration.** Add global hotkeys, toast notifications, auto-start, and package for distribution.
