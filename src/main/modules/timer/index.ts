import { ipcMain, BrowserWindow, Notification } from 'electron'
import { completeTask } from '../store'

let interval: NodeJS.Timeout | null = null
let timeRemaining = 0
let totalTime = 0
let isRunning = false
let currentTaskId: string | null = null

export function setupTimer() {
  ipcMain.handle('timer:start', (_, taskId: string, minutes: number) => startTimer(taskId, minutes))
  ipcMain.handle('timer:stop', () => stopTimer())
  ipcMain.handle('timer:status', () => ({ isRunning, timeRemaining, totalTime, taskId: currentTaskId }))
}

export function startTimer(taskId: string, minutes: number) {
  if (isRunning) return
  
  currentTaskId = taskId
  timeRemaining = minutes * 60
  totalTime = minutes * 60
  isRunning = true

  interval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining -= 1
      broadcastTick()
    } else {
      if (currentTaskId) {
        completeTask(currentTaskId)
        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.send('timer:finished', currentTaskId)
        })
      }
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
  totalTime = 0
  currentTaskId = null
  broadcastTick()
}

function broadcastTick() {
  const windows = BrowserWindow.getAllWindows()
  windows.forEach(win => {
    win.webContents.send('timer:tick', { isRunning, timeRemaining, totalTime, taskId: currentTaskId })
  })
}

function showNotification(title: string, body: string) {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show()
  }
}
