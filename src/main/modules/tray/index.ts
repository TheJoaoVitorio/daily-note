import { app, Menu, Tray, nativeImage } from 'electron'
import { join } from 'path'

let tray: Tray | null = null

export function setupTray() {
  const iconPath = join(process.env.VITE_PUBLIC || join(__dirname, '../../public'), 'favicon.svg')
  const icon = nativeImage.createFromPath(iconPath)
  
  tray = new Tray(icon)
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Daily Notch', enabled: false },
    { type: 'separator' },
    { label: 'Toggle Focus', click: () => {
        // Broadcast toggle event (will implement later)
    }},
    { label: 'Settings', click: () => {
        // Open Settings window
    }},
    { type: 'separator' },
    { label: 'Quit', click: () => {
        app.quit()
    }}
  ])
  
  tray.setToolTip('Daily Notch')
  tray.setContextMenu(contextMenu)

  return tray
}
