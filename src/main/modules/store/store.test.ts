import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupStore, readData, addTask, toggleTask, deleteTask, addCategory, deleteCategory } from './index'

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue(':memory:') // memory db or we can mock better-sqlite3
  },
  ipcMain: {
    handle: vi.fn()
  }
}))

vi.mock('fs', () => ({
  default: { existsSync: vi.fn().mockReturnValue(true), mkdirSync: vi.fn() },
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn()
}))

// We can just use the real better-sqlite3 with an in-memory database!
// By overriding app.getPath('userData') to return '', join('', 'daily-notch.sqlite') might be an issue.
// Let's explicitly mock 'better-sqlite3' or intercept the path.
vi.mock('path', () => ({
  default: { join: () => ':memory:' },
  join: () => ':memory:'
}))

describe('Store Module (SQLite)', () => {
  beforeEach(() => {
    setupStore()
  })

  it('initializes with default data and default categories', () => {
    const data = readData('2026-08-31')
    expect(data.tasks).toEqual([])
    expect(data.streak).toBe(0)
    expect(data.activity).toEqual([])
    expect(data.categories.length).toBeGreaterThanOrEqual(4)
    expect(data.categories.map(c => c.name)).toContain('Work')
  })

  it('adds and toggles a task', () => {
    const task = addTask({ title: 'Test Task', completed: false, estimatedMinutes: 25, date: '2026-08-31' })
    expect(task.title).toBe('Test Task')
    expect(task.completed).toBe(false)
    
    let data = readData('2026-08-31')
    expect(data.tasks.length).toBe(1)
    expect(data.tasks[0].title).toBe('Test Task')

    // Toggle
    const toggled = toggleTask(task.id)
    expect(toggled?.completed).toBe(true)

    data = readData('2026-08-31')
    expect(data.tasks[0].completed).toBe(true)
    
    // Check activity
    expect(data.activity.find(a => a.date === '2026-08-31')?.completedCount).toBe(1)

    // Delete
    deleteTask(task.id)
    data = readData('2026-08-31')
    expect(data.tasks.length).toBe(0)
    expect(data.activity.find(a => a.date === '2026-08-31')?.completedCount).toBe(0)
  })

  it('adds categories and computes category completion stats', () => {
    const cat = addCategory({ name: 'Deep Work', color: '#6366F1' })
    expect(cat.name).toBe('Deep Work')
    expect(cat.color).toBe('#6366F1')

    const task = addTask({
      title: 'Finish report',
      completed: false,
      estimatedMinutes: 30,
      date: '2026-08-31',
      categoryId: cat.id
    })
    expect(task.categoryId).toBe(cat.id)

    // Initially completedCount for this category is 0
    let data = readData('2026-08-31')
    let stat = data.categoryStats.find(s => s.categoryId === cat.id)
    expect(stat?.completedCount).toBe(0)

    // Toggle complete
    toggleTask(task.id)

    data = readData('2026-08-31')
    stat = data.categoryStats.find(s => s.categoryId === cat.id)
    expect(stat?.completedCount).toBe(1)

    // Delete category
    deleteCategory(cat.id)
    data = readData('2026-08-31')
    expect(data.categories.find(c => c.id === cat.id)).toBeUndefined()
    // Task should now have null categoryId
    expect(data.tasks[0].categoryId).toBeNull()
  })
})
