import { contextBridge as e, ipcRenderer as t } from "electron";
//#region src/preload/index.ts
e.exposeInMainWorld("electron", { ipcRenderer: {
	send: (e, ...n) => t.send(e, ...n),
	invoke: (e, ...n) => t.invoke(e, ...n),
	on: (e, n) => {
		t.on(e, (e, ...t) => n(...t));
	}
} });
//#endregion
export {};
