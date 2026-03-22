'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const { t, language } = useLanguage()

  useEffect(() => {
    if (!('Notification' in window)) return
    setPermission(Notification.permission)

    // Register service worker (for PWA, not required for notifications)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  // Check every 10 seconds and fire notification if time matches
  useEffect(() => {
    if (permission !== 'granted') return

    const notifiedKey = () => `notified_${new Date().toISOString().slice(0, 10)}`

    const checkAndNotify = () => {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      const stored = localStorage.getItem('habit_notify_times')
      if (!stored) return

      const notifiedToday: string[] = JSON.parse(localStorage.getItem(notifiedKey()) || '[]')
      const times: { name: string; time: string }[] = JSON.parse(stored)

      console.log('[HabitTracker] 알림 체크:', currentTime, '| 등록된 습관:', times)

      times.forEach(({ name, time }) => {
        const notifId = `${name}_${time}`
        if (time === currentTime && !notifiedToday.includes(notifId)) {
          console.log('[HabitTracker] 알림 발송:', name)
          try {
            new Notification('Habit Tracker', {
              body: language === 'ko' ? `${name} 할 시간이에요! ✓` : `Time for: ${name} ✓`,
              icon: '/icons/icon-192.png',
            })
            notifiedToday.push(notifId)
            localStorage.setItem(notifiedKey(), JSON.stringify(notifiedToday))
          } catch (e) {
            console.error('[HabitTracker] 알림 오류:', e)
          }
        }
      })
    }

    const interval = setInterval(checkAndNotify, 10000)
    checkAndNotify() // 즉시 한 번 체크
    return () => clearInterval(interval)
  }, [permission, language])

  if (permission === 'granted' || !('Notification' in window)) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto">
      <div className="bg-indigo-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
        <span className="text-2xl">🔔</span>
        <div className="flex-1">
          <p className="font-semibold text-sm">{t('push.title')}</p>
          <p className="text-indigo-200 text-xs">{t('push.desc')}</p>
        </div>
        <button
          onClick={requestPermission}
          className="bg-white text-indigo-500 text-sm font-semibold px-3 py-1.5 rounded-lg"
        >
          {t('push.allow')}
        </button>
      </div>
    </div>
  )
}
