export interface Task {
  id: string
  title: string
  completed: boolean
  estimatedMinutes: number
  date: string // YYYY-MM-DD
  createdAt: number
  completedAt?: number
}

export interface ActivityDay {
  date: string
  completedCount: number
}

export interface StoreData {
  tasks: Task[]
  activity: ActivityDay[]
  focusMinutes: number
  streak: number
  unscheduledCount: number
}
