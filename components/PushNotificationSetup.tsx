'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'

export default function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [swReady, setSwReady] = useState(false)
  const [swReg, setSwReg] = useState<ServiceWorkerRegistration | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      setPermission(Notification.permission)

      navigator.serviceWorker.register('/sw.js').then((reg) => {
        setSwReady(true)
        setSwReg(reg)
      }).catch((err) => {
        console.error('SW registration failed', err)
      })
    }
  }, [])

  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  useEffect(() => {
    if (!swReady || permission !== 'granted') return

    // Track which habits were already notified today to avoid duplicates
    const notifiedKey = () => `notified_${new Date().toISOString().slice(0, 10)}`

    const checkAndNotify = () => {
      const now = new Date()
      const HH = String(now.getHours()).padStart(2, '0')
      const MM = String(now.getMinutes()).padStart(2, '0')
      const currentTime = `${HH}:${MM}`

      const stored = localStorage.getItem('habit_notify_times')
      if (!stored) return

      const notifiedToday: string[] = JSON.parse(localStorage.getItem(notifiedKey()) || '[]')

      const times: { name: string; time: string }[] = JSON.parse(stored)
      times.forEach(({ name, time }) => {
        const notifId = `${name}_${time}`
        if (time === currentTime && !notifiedToday.includes(notifId)) {
          // Use Service Worker showNotification for better Safari compatibility
          if (swReg) {
            swReg.showNotification('Habit Tracker', {
              body: `${name} ✓`,
              icon: '/icons/icon-192.png',
            })
          } else {
            new Notification('Habit Tracker', {
              body: `${name} ✓`,
              icon: '/icons/icon-192.png',
            })
          }
          // Mark as notified today
          notifiedToday.push(notifId)
          localStorage.setItem(notifiedKey(), JSON.stringify(notifiedToday))
        }
      })
    }

    // Check every 10 seconds to avoid missing the exact minute
    const interval = setInterval(checkAndNotify, 10000)
    // Also check immediately on mount
    checkAndNotify()
    return () => clearInterval(interval)
  }, [swReady, swReg, permission])

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
