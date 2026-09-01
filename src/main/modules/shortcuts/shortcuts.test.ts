import { describe, it, expect, vi } from 'vitest'
import { setupShortcuts, cleanupShortcuts } from './index'

vi.mock('electron', () => ({
  app: {
    whenReady: vi.fn().mockResolvedValue(true)
  },
  globalShortcut: {
    register: vi.fn(),
    unregisterAll: vi.fn()
  }
}))

vi.mock('../timer', () => ({
  startTimer: vi.fn(),
  stopTimer: vi.fn()
}))

describe('Shortcuts Module', () => {
  it('registers global shortcuts', async () => {
    setupShortcuts()
    const { globalShortcut, app } = await import('electron')
    // Wait for promise tick
    await app.whenReady()
    expect(globalShortcut.register).toHaveBeenCalledWith('CommandOrControl+Shift+Space', expect.any(Function))
  })

  it('cleans up shortcuts', async () => {
    cleanupShortcuts()
    const { globalShortcut } = await import('electron')
    expect(globalShortcut.unregisterAll).toHaveBeenCalled()
  })
})
