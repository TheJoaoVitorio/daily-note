import { app, globalShortcut } from 'electron'
import { startTimer, stopTimer } from '../timer'

// Since timer internal state isn't exported as easily, we can just track local state or query it.
// For simplicity, we can add a toggle function in timer module or handle it here.
// Let's assume we can query status if we want, or just expose a toggle.
// I'll update the timer module to export a toggle method or just keep track.

let isRunning = false

export function setupShortcuts() {
  app.whenReady().then(() => {
    globalShortcut.register('CommandOrControl+Shift+Space', () => {
      // Toggle logic
      if (isRunning) {
        stopTimer()
        isRunning = false
      } else {
        startTimer(25) // Default 25 min
        isRunning = true
      }
    })
  })
}

export function cleanupShortcuts() {
  globalShortcut.unregisterAll()
}
