import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupStore, readData, addTask, toggleTask } from './index'

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('mock-path')
  },
  ipcMain: {
    handle: vi.fn()
  }
}))

// Mock fs to avoid writing to real disk during tests
let mockFileSystem: Record<string, string> = {}
vi.mock('fs', () => {
  return {
    default: {
      existsSync: (path: string) => !!mockFileSystem[path],
      readFileSync: (path: string) => mockFileSystem[path] || '',
      writeFileSync: (path: string, data: string) => {
        mockFileSystem[path] = data
      },
      mkdirSync: vi.fn()
    },
    existsSync: (path: string) => !!mockFileSystem[path],
    readFileSync: (path: string) => mockFileSystem[path] || '',
    writeFileSync: (path: string, data: string) => {
      mockFileSystem[path] = data
    },
    mkdirSync: vi.fn()
  }
})

describe('Store Module', () => {
  beforeEach(() => {
    mockFileSystem = {}
    setupStore()
  })

  it('initializes with default data', () => {
    const data = readData()
    expect(data.tasks).toEqual([])
    expect(data.streak).toBe(0)
  })

  it('adds a task', () => {
    const task = addTask({ title: 'Test Task', completed: false })
    expect(task.title).toBe('Test Task')
    expect(task.id).toBeDefined()
    
    const data = readData()
    expect(data.tasks.length).toBe(1)
    expect(data.tasks[0].title).toBe('Test Task')
  })

  it('toggles a task', () => {
    const task = addTask({ title: 'Toggle Me', completed: false })
    expect(task.completed).toBe(false)

    const toggled = toggleTask(task.id)
    expect(toggled?.completed).toBe(true)

    const data = readData()
    expect(data.tasks[0].completed).toBe(true)
  })
})
