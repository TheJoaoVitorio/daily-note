import { describe, it, expect, vi } from 'vitest'
import { setupTray } from './index'

// Mock Electron modules
vi.mock('electron', () => {
  return {
    app: {
      quit: vi.fn(),
    },
    nativeImage: {
      createFromPath: vi.fn().mockReturnValue({
        resize: vi.fn().mockReturnThis(),
        isEmpty: vi.fn().mockReturnValue(false)
      }),
    },
    Menu: {
      buildFromTemplate: vi.fn().mockReturnValue({}),
    },
    Tray: vi.fn().mockImplementation(function() {
      return {
        setToolTip: vi.fn(),
        setContextMenu: vi.fn(),
      }
    }),
  }
})

describe('System Tray Module', () => {
  it('initializes the tray successfully', () => {
    const tray = setupTray()
    expect(tray).toBeDefined()
    expect(tray.setToolTip).toHaveBeenCalledWith('Daily Note')
    expect(tray.setContextMenu).toHaveBeenCalled()
  })
})
