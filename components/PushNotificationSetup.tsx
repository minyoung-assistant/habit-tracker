'use client'

import { useEffect, useState } from 'react'

export default function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [swReady, setSwReady] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      setPermission(Notification.permission)

      navigator.serviceWorker.register('/sw.js').then((reg) => {
        setSwReady(true)
        console.log('Service Worker registered', reg)
      }).catch((err) => {
        console.error('SW registration failed', err)
      })
    }
  }, [])

  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  // Schedule local notifications based on habit notify_time
  useEffect(() => {
    if (!swReady || permission !== 'granted') return

    // This is a client-side scheduler that fires notifications at the right time
    const checkAndNotify = () => {
      const now = new Date()
      const HH = String(now.getHours()).padStart(2, '0')
      const MM = String(now.getMinutes()).padStart(2, '0')
      const currentTime = `${HH}:${MM}`

      const stored = localStorage.getItem('habit_notify_times')
      if (!stored) return

      const times: { name: string; time: string }[] = JSON.parse(stored)
      times.forEach(({ name, time }) => {
        if (time === currentTime) {
          new Notification('Habit Tracker', {
            body: `${name} 할 시간이에요! ✓`,
            icon: '/icons/icon-192.png',
          })
        }
      })
    }

    const interval = setInterval(checkAndNotify, 60000)
    return () => clearInterval(interval)
  }, [swReady, permission])

  if (permission === 'granted' || !('Notification' in window)) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto">
      <div className="bg-indigo-500 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
        <span className="text-2xl">🔔</span>
        <div className="flex-1">
          <p className="font-semibold text-sm">알림 허용하기</p>
          <p className="text-indigo-200 text-xs">습관 시간에 맞춰 알림을 받으세요</p>
        </div>
        <button
          onClick={requestPermission}
          className="bg-white text-indigo-500 text-sm font-semibold px-3 py-1.5 rounded-lg"
        >
          허용
        </button>
      </div>
    </div>
  )
}
