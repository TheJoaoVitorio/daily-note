//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let electron = require("electron");
let path = require("path");
let fs = require("fs");
let better_sqlite3 = require("better-sqlite3");
better_sqlite3 = __toESM(better_sqlite3);
//#region src/main/modules/tray/index.ts
var tray = null;
function setupTray() {
	const iconPath = (0, path.join)(process.env.VITE_PUBLIC || (0, path.join)(__dirname, "../../public"), "favicon.svg");
	const icon = electron.nativeImage.createFromPath(iconPath);
	tray = new electron.Tray(icon);
	const contextMenu = electron.Menu.buildFromTemplate([
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
				electron.app.quit();
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
	const userDataPath = electron.app.getPath("userData");
	if (!(0, fs.existsSync)(userDataPath)) (0, fs.mkdirSync)(userDataPath, { recursive: true });
	const dbPath = electron.app.isPackaged ? (0, path.join)(userDataPath, "daily-notch.sqlite") : (0, path.join)(process.cwd(), "daily-notch.sqlite");
	db = new better_sqlite3.default(dbPath);
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
	electron.ipcMain.handle("store:getData", (_, date) => readData(date));
	electron.ipcMain.handle("store:addTask", (_, task) => addTask(task));
	electron.ipcMain.handle("store:updateTask", (_, id, updates) => updateTask(id, updates));
	electron.ipcMain.handle("store:toggleTask", (_, id) => toggleTask(id));
	electron.ipcMain.handle("store:deleteTask", (_, id) => deleteTask(id));
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
function updateTask(id, updates) {
	if (!db.prepare("SELECT * FROM tasks WHERE id = ?").get(id)) return null;
	if (updates.estimatedMinutes !== void 0) db.prepare("UPDATE tasks SET estimatedMinutes = ? WHERE id = ?").run(updates.estimatedMinutes, id);
	if (updates.title !== void 0) db.prepare("UPDATE tasks SET title = ? WHERE id = ?").run(updates.title, id);
	const updatedRow = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
	return {
		...updatedRow,
		completed: updatedRow.completed === 1
	};
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
function completeTask(id) {
	const taskRow = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
	if (!taskRow || taskRow.completed === 1) return null;
	db.prepare("UPDATE tasks SET completed = 1, completedAt = ? WHERE id = ?").run(Date.now(), id);
	db.prepare(`
    INSERT INTO activity (date, completedCount) VALUES (?, 1)
    ON CONFLICT(date) DO UPDATE SET completedCount = completedCount + 1
  `).run(taskRow.date);
	return {
		...db.prepare("SELECT * FROM tasks WHERE id = ?").get(id),
		completed: true
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
var totalTime = 0;
var isRunning$1 = false;
var currentTaskId = null;
function setupTimer() {
	electron.ipcMain.handle("timer:start", (_, taskId, minutes) => startTimer(taskId, minutes));
	electron.ipcMain.handle("timer:stop", () => stopTimer());
	electron.ipcMain.handle("timer:status", () => ({
		isRunning: isRunning$1,
		timeRemaining,
		totalTime,
		taskId: currentTaskId
	}));
}
function startTimer(taskId, minutes) {
	if (isRunning$1) return;
	currentTaskId = taskId;
	timeRemaining = minutes * 60;
	totalTime = minutes * 60;
	isRunning$1 = true;
	interval = setInterval(() => {
		if (timeRemaining > 0) {
			timeRemaining -= 1;
			broadcastTick();
		} else {
			if (currentTaskId) {
				completeTask(currentTaskId);
				electron.BrowserWindow.getAllWindows().forEach((win) => {
					win.webContents.send("timer:finished", currentTaskId);
				});
			}
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
	totalTime = 0;
	currentTaskId = null;
	broadcastTick();
}
function broadcastTick() {
	electron.BrowserWindow.getAllWindows().forEach((win) => {
		win.webContents.send("timer:tick", {
			isRunning: isRunning$1,
			timeRemaining,
			totalTime,
			taskId: currentTaskId
		});
	});
}
function showNotification(title, body) {
	if (electron.Notification.isSupported()) new electron.Notification({
		title,
		body
	}).show();
}
//#endregion
//#region src/main/modules/shortcuts/index.ts
var isRunning = false;
function setupShortcuts() {
	electron.app.whenReady().then(() => {
		electron.globalShortcut.register("CommandOrControl+Shift+Space", () => {
			if (isRunning) {
				stopTimer();
				isRunning = false;
			} else {
				startTimer("", 25);
				isRunning = true;
			}
		});
	});
}
function cleanupShortcuts() {
	electron.globalShortcut.unregisterAll();
}
//#endregion
//#region src/main/index.ts
process.env.DIST_ELECTRON = (0, path.join)(__dirname, "../");
process.env.DIST = (0, path.join)(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? (0, path.join)(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
var win = null;
function createWindow() {
	const { screen } = require("electron");
	const { width } = screen.getPrimaryDisplay().workAreaSize;
	const windowWidth = 320;
	win = new electron.BrowserWindow({
		width: windowWidth,
		height: 120,
		x: Math.floor(width / 2 - windowWidth / 2),
		y: 0,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		skipTaskbar: true,
		webPreferences: { preload: (0, path.join)(__dirname, "../preload/index.cjs") }
	});
	const devUrl = process.env.VITE_DEV_SERVER_URL;
	if (devUrl) win.loadURL(`${devUrl}src/renderer/index.html`);
	else win.loadFile((0, path.join)(process.env.DIST || "", "src/renderer/index.html"));
}
electron.app.whenReady().then(() => {
	setupStore();
	setupTimer();
	setupShortcuts();
	createWindow();
	setupTray();
	electron.ipcMain.on("window:resize", (event, state) => {
		const window = electron.BrowserWindow.fromWebContents(event.sender);
		if (!window) return;
		const { screen } = require("electron");
		const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
		let targetWidth = 800;
		let targetHeight = 600;
		if (state === "collapsed") {
			targetWidth = 320;
			targetHeight = 120;
		} else if (state === "hovered") {
			targetWidth = 600;
			targetHeight = 360;
		} else if (state === "expanded") {
			targetWidth = 800;
			targetHeight = 600;
		}
		window.setBounds({
			x: Math.floor(screenWidth / 2 - targetWidth / 2),
			y: 0,
			width: targetWidth,
			height: targetHeight
		});
	});
});
electron.app.on("window-all-closed", () => {
	cleanupShortcuts();
	if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("will-quit", () => {
	cleanupShortcuts();
});
electron.app.on("activate", () => {
	if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
//#endregion
