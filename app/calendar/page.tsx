'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Habit, HabitLog } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, parseISO } from 'date-fns'
import { ko, enUS } from 'date-fns/locale'
import { useLanguage } from '@/lib/LanguageContext'

export default function CalendarPage() {
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { language, t } = useLanguage()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }

      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

      const [{ data: habitsData }, { data: logsData }] = await Promise.all([
        supabase.from('habits').select('*').eq('is_active', true),
        supabase.from('habit_logs').select('*').gte('date', start).lte('date', end),
      ])

      setHabits(habitsData ?? [])
      setLogs(logsData ?? [])
      setLoading(false)
    })
  }, [router, currentMonth])

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const startDayOfWeek = getDay(startOfMonth(currentMonth))

  const weekDaysKo = ['일', '월', '화', '수', '목', '금', '토']
  const weekDaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekDays = language === 'ko' ? weekDaysKo : weekDaysEn

  const dateLocale = language === 'ko' ? ko : enUS
  const monthFormat = language === 'ko' ? 'yyyy년 M월' : 'MMMM yyyy'
  const dayDetailFormat = language === 'ko' ? 'M월 d일 EEEE' : 'EEEE, MMMM d'

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayLogs = logs.filter((l) => l.date === dateStr)
    if (habits.length === 0 || dayLogs.length === 0) return 'none'
    const completed = dayLogs.filter((l) => l.completed).length
    if (completed === habits.length) return 'full'
    if (completed > 0) return 'partial'
    return 'none'
  }

  const selectedDayLogs = selectedDate
    ? logs.filter((l) => l.date === selectedDate)
    : []

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-indigo-500 animate-pulse" /></div>

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{t('calendar.title')}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
            ‹
          </button>
          <h2 className="text-base font-semibold text-gray-900">
            {format(currentMonth, monthFormat, { locale: dateLocale })}
          </h2>
          <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50">
            ›
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((d, i) => (
              <div key={d} className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-1">
            {/* Empty cells before month start */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const status = getDayStatus(day)
              const isSelected = selectedDate === dateStr
              const today = isToday(day)
              const dayNum = day.getDate()
              const dayOfWeek = getDay(day)

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all text-xs font-medium relative ${
                    isSelected ? 'bg-indigo-500 text-white' :
                    today ? 'ring-2 ring-indigo-400' :
                    'hover:bg-gray-50'
                  } ${dayOfWeek === 0 && !isSelected ? 'text-red-400' : dayOfWeek === 6 && !isSelected ? 'text-blue-400' : isSelected ? 'text-white' : 'text-gray-700'}`}
                >
                  <span>{dayNum}</span>
                  {status !== 'none' && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      status === 'full' ? (isSelected ? 'bg-white' : 'bg-indigo-500') :
                      (isSelected ? 'bg-indigo-200' : 'bg-yellow-400')
                    }`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>{t('calendar.legend_full')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span>{t('calendar.legend_partial')}</span>
          </div>
        </div>

        {/* Selected day detail */}
        {selectedDate && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              {format(parseISO(selectedDate), dayDetailFormat, { locale: dateLocale })}
            </h3>
            {habits.length === 0 ? (
              <p className="text-gray-400 text-sm">{t('calendar.no_habits')}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {habits.map((habit) => {
                  const log = selectedDayLogs.find((l) => l.habit_id === habit.id)
                  const completed = log?.completed ?? false
                  return (
                    <div key={habit.id} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: completed ? habit.color : '#e5e7eb' }}
                      />
                      <span className={`text-sm ${completed ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                        {habit.name}
                      </span>
                      <span className="ml-auto text-xs">{completed ? '✓' : '✗'}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
