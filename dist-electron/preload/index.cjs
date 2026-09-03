let electron = require("electron");
//#region src/preload/index.ts
electron.contextBridge.exposeInMainWorld("electron", { ipcRenderer: {
	send: (channel, ...args) => electron.ipcRenderer.send(channel, ...args),
	invoke: (channel, ...args) => electron.ipcRenderer.invoke(channel, ...args),
	on: (channel, listener) => {
		electron.ipcRenderer.on(channel, (_event, ...args) => listener(...args));
	}
} });
//#endregion
