export interface Habit {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  notify_time: string // HH:MM format
  is_active: boolean
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  date: string // YYYY-MM-DD format
  completed: boolean
  created_at: string
}

export interface HabitWithLogs extends Habit {
  habit_logs: HabitLog[]
}
