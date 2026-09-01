/// <reference types="vite/client" />

interface Window {
  electron: {
    ipcRenderer: {
      send: (channel: string, ...args: any[]) => void
      invoke: (channel: string, ...args: any[]) => Promise<any>
      on: (channel: string, listener: (...args: any[]) => void) => void
    }
  }
}
