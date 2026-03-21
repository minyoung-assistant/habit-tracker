'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Habit, HabitLog } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import PushNotificationSetup from '@/components/PushNotificationSetup'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function DashboardPage() {
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/auth')
        return
      }
      setUserEmail(session.user.email ?? '')

      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('date', today)

      const h = habitsData ?? []
      setHabits(h)
      setLogs(logsData ?? [])
      setLoading(false)

      // Store notify times for local notification scheduling
      localStorage.setItem('habit_notify_times', JSON.stringify(
        h.filter((x) => x.is_active).map((x) => ({ name: x.name, time: x.notify_time }))
      ))
    })
  }, [router, today])

  const toggleHabit = async (habitId: string) => {
    const supabase = createClient()
    const existing = logs.find((l) => l.habit_id === habitId && l.date === today)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    if (existing) {
      const newCompleted = !existing.completed
      await supabase
        .from('habit_logs')
        .update({ completed: newCompleted })
        .eq('id', existing.id)
      setLogs(logs.map((l) => l.id === existing.id ? { ...l, completed: newCompleted } : l))
    } else {
      const { data } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: session.user.id, date: today, completed: true })
        .select()
        .single()
      if (data) setLogs([...logs, data])
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const completedCount = habits.filter((h) =>
    logs.find((l) => l.habit_id === h.id && l.completed)
  ).length

  const todayLabel = format(new Date(), 'M월 d일 EEEE', { locale: ko })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-indigo-500 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <PushNotificationSetup />
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{todayLabel}</p>
            <h1 className="text-xl font-bold text-gray-900">오늘의 습관</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Progress */}
        {habits.length > 0 && (
          <div className="bg-indigo-500 rounded-2xl p-5 mb-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">오늘 진행률</span>
              <span className="text-indigo-200 text-sm">{completedCount} / {habits.length}</span>
            </div>
            <div className="bg-indigo-400 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${habits.length > 0 ? (completedCount / habits.length) * 100 : 0}%` }}
              />
            </div>
            {completedCount === habits.length && habits.length > 0 && (
              <p className="mt-3 text-sm font-medium text-indigo-100">🎉 오늘 모든 습관 완료!</p>
            )}
          </div>
        )}

        {/* Habits list */}
        {habits.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🌱</p>
            <p className="text-gray-600 font-medium mb-2">아직 등록된 습관이 없어요</p>
            <p className="text-gray-400 text-sm mb-6">습관 탭에서 첫 번째 습관을 추가해보세요</p>
            <button
              onClick={() => router.push('/habits')}
              className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
            >
              습관 추가하기
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {habits.map((habit) => {
              const log = logs.find((l) => l.habit_id === habit.id)
              const completed = log?.completed ?? false
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    completed
                      ? 'bg-white border-indigo-200'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      completed ? 'opacity-100' : 'opacity-40'
                    }`}
                    style={{ backgroundColor: habit.color + '30', border: `2px solid ${habit.color}` }}
                  >
                    {completed ? (
                      <span className="text-lg">✓</span>
                    ) : (
                      <span className="text-lg" style={{ color: habit.color }}>○</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {habit.name}
                    </p>
                    {habit.description && (
                      <p className="text-sm text-gray-400 truncate">{habit.description}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-300">{habit.notify_time}</div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
