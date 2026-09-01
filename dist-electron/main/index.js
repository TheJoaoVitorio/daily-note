import { createRequire } from "node:module";
import { BrowserWindow, Menu, Notification, Tray, app, globalShortcut, ipcMain, nativeImage } from "electron";
import { join } from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
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
var STORE_PATH = join(app.getPath("userData"), "store.json");
var DEFAULT_DATA = {
	tasks: [],
	focusMinutes: 25,
	streak: 0
};
function setupStore() {
	if (!existsSync(STORE_PATH)) {
		mkdirSync(app.getPath("userData"), { recursive: true });
		writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
	}
	ipcMain.handle("store:getData", () => readData());
	ipcMain.handle("store:addTask", (_, task) => addTask(task));
	ipcMain.handle("store:toggleTask", (_, id) => toggleTask(id));
}
function readData() {
	try {
		if (!existsSync(STORE_PATH)) return DEFAULT_DATA;
		const data = readFileSync(STORE_PATH, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		return DEFAULT_DATA;
	}
}
function writeData(data) {
	writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}
function addTask(taskData) {
	const data = readData();
	const newTask = {
		...taskData,
		id: Math.random().toString(36).substring(2, 9),
		createdAt: Date.now()
	};
	data.tasks.push(newTask);
	writeData(data);
	return newTask;
}
function toggleTask(id) {
	const data = readData();
	const task = data.tasks.find((t) => t.id === id);
	if (task) {
		task.completed = !task.completed;
		writeData(data);
		return task;
	}
	return null;
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
	const windowWidth = 400;
	win = new BrowserWindow({
		width: windowWidth,
		height: 400,
		x: Math.floor(width / 2 - windowWidth / 2),
		y: 0,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		resizable: false,
		skipTaskbar: true,
		webPreferences: { preload: join(import.meta.dirname, "../preload/index.js") }
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
