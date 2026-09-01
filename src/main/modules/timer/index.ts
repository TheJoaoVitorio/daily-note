import { ipcMain, BrowserWindow, Notification } from 'electron'

let interval: NodeJS.Timeout | null = null
let timeRemaining = 0
let isRunning = false

export function setupTimer() {
  ipcMain.handle('timer:start', (_, minutes: number) => startTimer(minutes))
  ipcMain.handle('timer:stop', () => stopTimer())
  ipcMain.handle('timer:status', () => ({ isRunning, timeRemaining }))
}

export function startTimer(minutes: number) {
  if (isRunning) return
  
  timeRemaining = minutes * 60
  isRunning = true

  interval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining -= 1
      broadcastTick()
    } else {
      stopTimer()
      showNotification('Focus Session Complete!', 'Great job staying focused.')
    }
  }, 1000)
}

export function stopTimer() {
  if (interval) clearInterval(interval)
  interval = null
  isRunning = false
  timeRemaining = 0
  broadcastTick()
}

function broadcastTick() {
  const windows = BrowserWindow.getAllWindows()
  windows.forEach(win => {
    win.webContents.send('timer:tick', { isRunning, timeRemaining })
  })
}

function showNotification(title: string, body: string) {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show()
  }
}
