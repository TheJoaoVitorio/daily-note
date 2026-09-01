import { app, BrowserWindow } from 'electron'
import { join } from 'path'

process.env.DIST_ELECTRON = join(__dirname, '../')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

let win: BrowserWindow | null = null

function createWindow() {
  const { screen } = require('electron')
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width } = primaryDisplay.workAreaSize

  const windowWidth = 400
  const windowHeight = 400

  win = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.floor(width / 2 - windowWidth / 2),
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
    },
  })

  const devUrl = process.env.VITE_DEV_SERVER_URL
  if (devUrl) {
    win.loadURL(devUrl)
  } else {
    win.loadFile(join(process.env.DIST || '', 'src/renderer/index.html'))
  }
}

import { setupTray } from './modules/tray'
import { setupStore } from './modules/store'
import { setupTimer } from './modules/timer'
import { setupShortcuts, cleanupShortcuts } from './modules/shortcuts'

app.whenReady().then(() => {
  setupStore()
  setupTimer()
  setupShortcuts()
  createWindow()
  setupTray()
})

app.on('window-all-closed', () => {
  cleanupShortcuts()
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  cleanupShortcuts()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
