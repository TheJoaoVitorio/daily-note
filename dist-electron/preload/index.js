import { contextBridge, ipcRenderer } from "electron";
//#region src/preload/index.ts
contextBridge.exposeInMainWorld("electron", { ipcRenderer: {
	send: (channel, ...args) => ipcRenderer.send(channel, ...args),
	invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
	on: (channel, listener) => {
		ipcRenderer.on(channel, (_event, ...args) => listener(...args));
	}
} });
//#endregion
export {};
