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
  const { x: displayX, y: displayY, width } = primaryDisplay.workArea

  const windowWidth = 320
  const windowHeight = 120

  win = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: Math.floor(displayX + width / 2 - windowWidth / 2),
    y: displayY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
    },
  })

  const devUrl = process.env.VITE_DEV_SERVER_URL
  if (devUrl) {
    win.loadURL(`${devUrl}src/renderer/index.html`)
  } else {
    win.loadFile(join(process.env.DIST || '', 'src/renderer/index.html'))
  }
}

import { setupTray } from './modules/tray'
import { setupStore } from './modules/store'
import { setupTimer } from './modules/timer'
import { setupShortcuts, cleanupShortcuts } from './modules/shortcuts'
import { ipcMain } from 'electron'

app.whenReady().then(() => {
  setupStore()
  setupTimer()
  setupShortcuts()
  createWindow()
  setupTray()

  ipcMain.on('window:resize', (event, state: 'collapsed' | 'hovered' | 'expanded') => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return
    const { screen } = require('electron')
    const currentDisplay = screen.getDisplayMatching(window.getBounds())
    const { x: displayX, y: displayY, width: displayWidth } = currentDisplay.workArea
    
    let targetWidth = 880
    let targetHeight = 640
    
    if (state === 'collapsed') {
      targetWidth = 320
      targetHeight = 120
    } else if (state === 'hovered') {
      targetWidth = 620
      targetHeight = 380
    } else if (state === 'expanded') {
      targetWidth = 880
      targetHeight = 640
    }

    window.setBounds({
      x: Math.floor(displayX + displayWidth / 2 - targetWidth / 2),
      y: displayY,
      width: targetWidth,
      height: targetHeight
    })
  })
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
