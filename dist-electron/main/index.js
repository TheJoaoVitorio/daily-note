import { createRequire } from "node:module";
import { BrowserWindow, Menu, Notification, Tray, app, globalShortcut, ipcMain, nativeImage } from "electron";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import Database from "better-sqlite3";
//#region \0rolldown/runtime.js
var __require = /* #__PURE__ */ (() => createRequire(import.meta.url))();
//#endregion
//#region src/main/modules/tray/index.ts
var tray = null;
function setupTray() {
	const iconPath = join(process.env.VITE_PUBLIC || join(import.meta.dirname, "../../public"), "favicon.svg");
	const icon = nativeImage.createFromPath(iconPath);
	tray = new Tray(icon);
	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Daily Notch",
			enabled: false
		},
		{ type: "separator" },
		{
			label: "Toggle Focus",
			click: () => {}
		},
		{
			label: "Settings",
			click: () => {}
		},
		{ type: "separator" },
		{
			label: "Quit",
			click: () => {
				app.quit();
			}
		}
	]);
	tray.setToolTip("Daily Notch");
	tray.setContextMenu(contextMenu);
	return tray;
}
//#endregion
//#region src/main/modules/store/index.ts
var db;
function setupStore() {
	const userDataPath = app.getPath("userData");
	if (!existsSync(userDataPath)) mkdirSync(userDataPath, { recursive: true });
	const dbPath = app.isPackaged ? join(userDataPath, "daily-notch.sqlite") : join(process.cwd(), "daily-notch.sqlite");
	db = new Database(dbPath);
	db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      estimatedMinutes INTEGER DEFAULT 25,
      date TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      completedAt INTEGER
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activity (
      date TEXT PRIMARY KEY,
      completedCount INTEGER DEFAULT 0
    );
  `);
	if (!db.prepare("SELECT value FROM settings WHERE key = ?").get("streak")) {
		db.prepare("INSERT INTO settings (key, value) VALUES ('streak', '0')").run();
		db.prepare("INSERT INTO settings (key, value) VALUES ('focusMinutes', '25')").run();
	}
	ipcMain.handle("store:getData", (_, date) => readData(date));
	ipcMain.handle("store:addTask", (_, task) => addTask(task));
	ipcMain.handle("store:toggleTask", (_, id) => toggleTask(id));
	ipcMain.handle("store:deleteTask", (_, id) => deleteTask(id));
}
function readData(targetDate) {
	if (!db) return {
		tasks: [],
		activity: [],
		focusMinutes: 25,
		streak: 0
	};
	const mappedTasks = db.prepare("SELECT * FROM tasks WHERE date = ? ORDER BY createdAt ASC").all(targetDate).map((t) => ({
		...t,
		completed: t.completed === 1
	}));
	const activity = db.prepare("SELECT date, completedCount FROM activity ORDER BY date DESC LIMIT 60").all();
	const streakRow = db.prepare("SELECT value FROM settings WHERE key = 'streak'").get();
	const focusRow = db.prepare("SELECT value FROM settings WHERE key = 'focusMinutes'").get();
	return {
		tasks: mappedTasks,
		activity,
		streak: streakRow ? parseInt(streakRow.value) : 0,
		focusMinutes: focusRow ? parseInt(focusRow.value) : 25
	};
}
function addTask(taskData) {
	const newTask = {
		...taskData,
		id: Math.random().toString(36).substring(2, 9),
		createdAt: Date.now()
	};
	db.prepare(`
    INSERT INTO tasks (id, title, completed, estimatedMinutes, date, createdAt)
    VALUES (@id, @title, @completed, @estimatedMinutes, @date, @createdAt)
  `).run({
		...newTask,
		completed: newTask.completed ? 1 : 0
	});
	return newTask;
}
function toggleTask(id) {
	const taskRow = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
	if (!taskRow) return null;
	const isCompleted = !(taskRow.completed === 1);
	db.prepare("UPDATE tasks SET completed = ?, completedAt = ? WHERE id = ?").run(isCompleted ? 1 : 0, isCompleted ? Date.now() : null, id);
	const date = taskRow.date;
	if (isCompleted) db.prepare(`
      INSERT INTO activity (date, completedCount) VALUES (?, 1)
      ON CONFLICT(date) DO UPDATE SET completedCount = completedCount + 1
    `).run(date);
	else db.prepare(`
      UPDATE activity SET completedCount = MAX(0, completedCount - 1) WHERE date = ?
    `).run(date);
	const updatedRow = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
	return {
		...updatedRow,
		completed: updatedRow.completed === 1
	};
}
function deleteTask(id) {
	const taskRow = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
	if (!taskRow) return false;
	if (taskRow.completed === 1) db.prepare("UPDATE activity SET completedCount = MAX(0, completedCount - 1) WHERE date = ?").run(taskRow.date);
	db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
	return true;
}
//#endregion
//#region src/main/modules/timer/index.ts
var interval = null;
var timeRemaining = 0;
var isRunning$1 = false;
function setupTimer() {
	ipcMain.handle("timer:start", (_, minutes) => startTimer(minutes));
	ipcMain.handle("timer:stop", () => stopTimer());
	ipcMain.handle("timer:status", () => ({
		isRunning: isRunning$1,
		timeRemaining
	}));
}
function startTimer(minutes) {
	if (isRunning$1) return;
	timeRemaining = minutes * 60;
	isRunning$1 = true;
	interval = setInterval(() => {
		if (timeRemaining > 0) {
			timeRemaining -= 1;
			broadcastTick();
		} else {
			stopTimer();
			showNotification("Focus Session Complete!", "Great job staying focused.");
		}
	}, 1e3);
}
function stopTimer() {
	if (interval) clearInterval(interval);
	interval = null;
	isRunning$1 = false;
	timeRemaining = 0;
	broadcastTick();
}
function broadcastTick() {
	BrowserWindow.getAllWindows().forEach((win) => {
		win.webContents.send("timer:tick", {
			isRunning: isRunning$1,
			timeRemaining
		});
	});
}
function showNotification(title, body) {
	if (Notification.isSupported()) new Notification({
		title,
		body
	}).show();
}
//#endregion
//#region src/main/modules/shortcuts/index.ts
var isRunning = false;
function setupShortcuts() {
	app.whenReady().then(() => {
		globalShortcut.register("CommandOrControl+Shift+Space", () => {
			if (isRunning) {
				stopTimer();
				isRunning = false;
			} else {
				startTimer(25);
				isRunning = true;
			}
		});
	});
}
function cleanupShortcuts() {
	globalShortcut.unregisterAll();
}
//#endregion
//#region src/main/index.ts
process.env.DIST_ELECTRON = join(import.meta.dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? join(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
var win = null;
function createWindow() {
	const { screen } = __require("electron");
	const { width } = screen.getPrimaryDisplay().workAreaSize;
	const windowWidth = 800;
	win = new BrowserWindow({
		width: windowWidth,
		height: 600,
		x: Math.floor(width / 2 - windowWidth / 2),
		y: 0,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		resizable: false,
		skipTaskbar: true,
		webPreferences: { preload: join(import.meta.dirname, "../preload/index.cjs") }
	});
	const devUrl = process.env.VITE_DEV_SERVER_URL;
	if (devUrl) win.loadURL(`${devUrl}src/renderer/index.html`);
	else win.loadFile(join(process.env.DIST || "", "src/renderer/index.html"));
}
app.whenReady().then(() => {
	setupStore();
	setupTimer();
	setupShortcuts();
	createWindow();
	setupTray();
});
app.on("window-all-closed", () => {
	cleanupShortcuts();
	if (process.platform !== "darwin") app.quit();
});
app.on("will-quit", () => {
	cleanupShortcuts();
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
//#endregion
export {};
