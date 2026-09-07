import { app, Menu, Tray, nativeImage } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'

let tray: Tray | null = null

export function getAppIconPath(): string {
  const candidates = [
    join(process.env.VITE_PUBLIC || '', 'Icon.png'),
    join(__dirname, '../../public/Icon.png'),
    join(__dirname, '../public/Icon.png'),
    join(process.cwd(), 'public/Icon.png'),
    join(process.cwd(), 'assets/Icon.png'),
    join(process.env.VITE_PUBLIC || '', 'DailyNoteIcon.png'),
    join(__dirname, '../../public/DailyNoteIcon.png'),
    join(__dirname, '../public/DailyNoteIcon.png'),
    join(process.cwd(), 'public/DailyNoteIcon.png'),
    join(process.cwd(), 'assets/DailyNoteIcon.png'),
  ]
  for (const p of candidates) {
    if (p && existsSync(p)) return p
  }
  return join(process.env.VITE_PUBLIC || join(__dirname, '../../public'), 'favicon.svg')
}

export function setupTray() {
  const iconPath = getAppIconPath()
  let icon = nativeImage.createFromPath(iconPath)
  if (typeof icon.resize === 'function' && typeof icon.isEmpty === 'function' && !icon.isEmpty()) {
    icon = icon.resize({ width: 32, height: 32, quality: 'best' })
  }
  
  tray = new Tray(icon)
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Daily Note', enabled: false },
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
  
  tray.setToolTip('Daily Note')
  tray.setContextMenu(contextMenu)

  return tray
}
