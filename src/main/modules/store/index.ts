import { app, ipcMain } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import type { StoreData, Task } from '../../../shared/types'

const STORE_PATH = join(app.getPath('userData'), 'store.json')

const DEFAULT_DATA: StoreData = {
  tasks: [],
  focusMinutes: 25,
  streak: 0
}

export function setupStore() {
  // Initialize file if not exists
  if (!existsSync(STORE_PATH)) {
    mkdirSync(app.getPath('userData'), { recursive: true })
    writeFileSync(STORE_PATH, JSON.stringify(DEFAULT_DATA, null, 2))
  }

  // Set up IPC handlers
  ipcMain.handle('store:getData', () => readData())
  ipcMain.handle('store:addTask', (_, task: Omit<Task, 'id' | 'createdAt'>) => addTask(task))
  ipcMain.handle('store:toggleTask', (_, id: string) => toggleTask(id))
}

export function readData(): StoreData {
  try {
    if (!existsSync(STORE_PATH)) return DEFAULT_DATA
    const data = readFileSync(STORE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return DEFAULT_DATA
  }
}

export function writeData(data: StoreData) {
  writeFileSync(STORE_PATH, JSON.stringify(data, null, 2))
}

export function addTask(taskData: Omit<Task, 'id' | 'createdAt'>): Task {
  const data = readData()
  const newTask: Task = {
    ...taskData,
    id: Math.random().toString(36).substring(2, 9),
    createdAt: Date.now()
  }
  data.tasks.push(newTask)
  writeData(data)
  return newTask
}

export function toggleTask(id: string): Task | null {
  const data = readData()
  const task = data.tasks.find(t => t.id === id)
  if (task) {
    task.completed = !task.completed
    writeData(data)
    return task
  }
  return null
}
