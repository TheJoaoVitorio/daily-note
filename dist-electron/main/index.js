import { createRequire as e } from "node:module";
import { BrowserWindow as t, Menu as n, Notification as r, Tray as i, app as a, globalShortcut as o, ipcMain as s, nativeImage as c } from "electron";
import { join as l } from "path";
import { existsSync as u, mkdirSync as d, readFileSync as f, writeFileSync as p } from "fs";
//#region \0rolldown/runtime.js
var m = /* @__PURE__ */ e(import.meta.url), h = null;
function g() {
	let e = l(process.env.VITE_PUBLIC || l(import.meta.dirname, "../../public"), "favicon.svg"), t = c.createFromPath(e);
	h = new i(t);
	let r = n.buildFromTemplate([
		{
			label: "Daily Notch",
			enabled: !1
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
				a.quit();
			}
		}
	]);
	return h.setToolTip("Daily Notch"), h.setContextMenu(r), h;
}
//#endregion
//#region src/main/modules/store/index.ts
var _ = l(a.getPath("userData"), "store.json"), v = {
	tasks: [],
	focusMinutes: 25,
	streak: 0
};
function y() {
	u(_) || (d(a.getPath("userData"), { recursive: !0 }), p(_, JSON.stringify(v, null, 2))), s.handle("store:getData", () => b()), s.handle("store:addTask", (e, t) => S(t)), s.handle("store:toggleTask", (e, t) => C(t));
}
function b() {
	try {
		if (!u(_)) return v;
		let e = f(_, "utf-8");
		return JSON.parse(e);
	} catch {
		return v;
	}
}
function x(e) {
	p(_, JSON.stringify(e, null, 2));
}
function S(e) {
	let t = b(), n = {
		...e,
		id: Math.random().toString(36).substring(2, 9),
		createdAt: Date.now()
	};
	return t.tasks.push(n), x(t), n;
}
function C(e) {
	let t = b(), n = t.tasks.find((t) => t.id === e);
	return n ? (n.completed = !n.completed, x(t), n) : null;
}
//#endregion
//#region src/main/modules/timer/index.ts
var w = null, T = 0, E = !1;
function D() {
	s.handle("timer:start", (e, t) => O(t)), s.handle("timer:stop", () => k()), s.handle("timer:status", () => ({
		isRunning: E,
		timeRemaining: T
	}));
}
function O(e) {
	E || (T = e * 60, E = !0, w = setInterval(() => {
		T > 0 ? (--T, A()) : (k(), j("Focus Session Complete!", "Great job staying focused."));
	}, 1e3));
}
function k() {
	w && clearInterval(w), w = null, E = !1, T = 0, A();
}
function A() {
	t.getAllWindows().forEach((e) => {
		e.webContents.send("timer:tick", {
			isRunning: E,
			timeRemaining: T
		});
	});
}
function j(e, t) {
	r.isSupported() && new r({
		title: e,
		body: t
	}).show();
}
//#endregion
//#region src/main/modules/shortcuts/index.ts
var M = !1;
function N() {
	a.whenReady().then(() => {
		o.register("CommandOrControl+Shift+Space", () => {
			M ? (k(), M = !1) : (O(25), M = !0);
		});
	});
}
function P() {
	o.unregisterAll();
}
process.env.DIST_ELECTRON = l(import.meta.dirname, "../"), process.env.DIST = l(process.env.DIST_ELECTRON, "../dist"), process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? l(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
var F = null;
function I() {
	let { screen: e } = m("electron"), { width: n } = e.getPrimaryDisplay().workAreaSize;
	F = new t({
		width: 400,
		height: 400,
		x: Math.floor(n / 2 - 200),
		y: 0,
		frame: !1,
		transparent: !0,
		alwaysOnTop: !0,
		resizable: !1,
		skipTaskbar: !0,
		webPreferences: { preload: l(import.meta.dirname, "../preload/index.js") }
	});
	let r = process.env.VITE_DEV_SERVER_URL;
	r ? F.loadURL(r) : F.loadFile(l(process.env.DIST || "", "src/renderer/index.html"));
}
a.whenReady().then(() => {
	y(), D(), N(), I(), g();
}), a.on("window-all-closed", () => {
	P(), process.platform !== "darwin" && a.quit();
}), a.on("will-quit", () => {
	P();
}), a.on("activate", () => {
	t.getAllWindows().length === 0 && I();
});
//#endregion
export {};
