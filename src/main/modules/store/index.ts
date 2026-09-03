import { app, ipcMain } from 'electron'
import { join } from 'path'
import { mkdirSync, existsSync } from 'fs'
import Database from 'better-sqlite3'
import type { StoreData, Task, ActivityDay } from '../../../shared/types'

let db: ReturnType<typeof Database>

export function setupStore() {
  const userDataPath = app.getPath('userData')
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true })
  }

  // Create DB in project folder during dev, or AppData in production
  const dbPath = app.isPackaged 
    ? join(userDataPath, 'daily-notch.sqlite')
    : join(process.cwd(), 'daily-notch.sqlite')
    
  db = new Database(dbPath)

  // Init tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      estimatedMinutes INTEGER DEFAULT 25,
      date TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      completedAt INTEGER
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activity (
      date TEXT PRIMARY KEY,
      completedCount INTEGER DEFAULT 0
    );
  `)

  // Initialize settings if empty
  const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?')
  if (!getSetting.get('streak')) {
    db.prepare("INSERT INTO settings (key, value) VALUES ('streak', '0')").run()
    db.prepare("INSERT INTO settings (key, value) VALUES ('focusMinutes', '25')").run()
  }

  // Set up IPC handlers
  ipcMain.handle('store:getData', (_, date: string) => readData(date))
  ipcMain.handle('store:addTask', (_, task: Omit<Task, 'id' | 'createdAt'>) => addTask(task))
  ipcMain.handle('store:toggleTask', (_, id: string) => toggleTask(id))
  ipcMain.handle('store:deleteTask', (_, id: string) => deleteTask(id))
}

export function readData(targetDate: string): StoreData {
  if (!db) return { tasks: [], activity: [], focusMinutes: 25, streak: 0 }

  const tasks = db.prepare('SELECT * FROM tasks WHERE date = ? ORDER BY createdAt ASC').all(targetDate) as any[]
  const mappedTasks: Task[] = tasks.map(t => ({
    ...t,
    completed: t.completed === 1
  }))

  const activity = db.prepare('SELECT date, completedCount FROM activity ORDER BY date DESC LIMIT 60').all() as ActivityDay[]

  const streakRow = db.prepare("SELECT value FROM settings WHERE key = 'streak'").get() as any
  const focusRow = db.prepare("SELECT value FROM settings WHERE key = 'focusMinutes'").get() as any

  return {
    tasks: mappedTasks,
    activity,
    streak: streakRow ? parseInt(streakRow.value) : 0,
    focusMinutes: focusRow ? parseInt(focusRow.value) : 25
  }
}

export function addTask(taskData: Omit<Task, 'id' | 'createdAt'>): Task {
  const newTask: Task = {
    ...taskData,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: Date.now()
  }

  db.prepare(`
    INSERT INTO tasks (id, title, completed, estimatedMinutes, date, createdAt)
    VALUES (@id, @title, @completed, @estimatedMinutes, @date, @createdAt)
  `).run({
    ...newTask,
    completed: newTask.completed ? 1 : 0
  })

  return newTask
}

export function toggleTask(id: string): Task | null {
  const taskRow = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any
  if (!taskRow) return null

  const wasCompleted = taskRow.completed === 1
  const isCompleted = !wasCompleted

  db.prepare('UPDATE tasks SET completed = ?, completedAt = ? WHERE id = ?').run(
    isCompleted ? 1 : 0,
    isCompleted ? Date.now() : null,
    id
  )

  // Update activity count
  const date = taskRow.date
  if (isCompleted) {
    db.prepare(`
      INSERT INTO activity (date, completedCount) VALUES (?, 1)
      ON CONFLICT(date) DO UPDATE SET completedCount = completedCount + 1
    `).run(date)
  } else {
    db.prepare(`
      UPDATE activity SET completedCount = MAX(0, completedCount - 1) WHERE date = ?
    `).run(date)
  }

  const updatedRow = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any
  return {
    ...updatedRow,
    completed: updatedRow.completed === 1
  }
}

export function deleteTask(id: string) {
  const taskRow = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as any
  if (!taskRow) return false

  if (taskRow.completed === 1) {
    db.prepare('UPDATE activity SET completedCount = MAX(0, completedCount - 1) WHERE date = ?').run(taskRow.date)
  }
  
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
  return true
}
