export interface Category {
  id: string
  name: string
  color: string
  createdAt: number
}

export interface CategoryStat {
  categoryId: string
  name: string
  color: string
  completedCount: number
}

export interface Task {
  id: string
  title: string
  completed: boolean
  estimatedMinutes: number
  date: string // YYYY-MM-DD
  createdAt: number
  completedAt?: number
  categoryId?: string | null
}

export interface ActivityDay {
  date: string
  completedCount: number
}

export interface StoreData {
  tasks: Task[]
  activity: ActivityDay[]
  streak: number
  focusMinutes: number
  unscheduledCount: number
  language: string
  categories: Category[]
  categoryStats: CategoryStat[]
}
