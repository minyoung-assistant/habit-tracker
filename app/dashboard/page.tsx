'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Habit, HabitLog } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import { format } from 'date-fns'
import { ko, enUS } from 'date-fns/locale'
import { useLanguage } from '@/lib/LanguageContext'

export default function DashboardPage() {
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const today = format(new Date(), 'yyyy-MM-dd')
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/auth')
        return
      }

      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      const { data: logsData } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('date', today)

      setHabits(habitsData ?? [])
      setLogs(logsData ?? [])
      setLoading(false)
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

  const dateLocale = language === 'ko' ? ko : enUS
  const dateFormat = language === 'ko' ? 'M월 d일 EEEE' : 'EEEE, MMMM d'
  const todayLabel = format(new Date(), dateFormat, { locale: dateLocale })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-indigo-500 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{todayLabel}</p>
            <h1 className="text-xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-200 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setLanguage('ko')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  language === 'ko'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                한국어
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ENG
              </button>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              {t('dashboard.logout')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Progress */}
        {habits.length > 0 && (
          <div className="bg-indigo-500 rounded-2xl p-5 mb-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">{t('dashboard.progress')}</span>
              <span className="text-indigo-200 text-sm">{completedCount} / {habits.length}</span>
            </div>
            <div className="bg-indigo-400 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${habits.length > 0 ? (completedCount / habits.length) * 100 : 0}%` }}
              />
            </div>
            {completedCount === habits.length && habits.length > 0 && (
              <p className="mt-3 text-sm font-medium text-indigo-100">{t('dashboard.allDone')}</p>
            )}
          </div>
        )}

        {/* Habits list */}
        {habits.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🌱</p>
            <p className="text-gray-600 font-medium mb-2">{t('dashboard.empty_title')}</p>
            <p className="text-gray-400 text-sm mb-6">{t('dashboard.empty_desc')}</p>
            <button
              onClick={() => router.push('/habits')}
              className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
            >
              {t('dashboard.add_habit')}
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
                    completed ? 'bg-white border-indigo-200' : 'bg-white border-gray-100'
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
