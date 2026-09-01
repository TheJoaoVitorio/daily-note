export interface Task {
  id: string
  title: string
  completed: boolean
  estimatedMinutes?: number
  createdAt: number
}

export interface StoreData {
  tasks: Task[]
  focusMinutes: number
  streak: number
}
