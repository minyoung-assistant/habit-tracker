'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'

export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { href: '/dashboard', label: t('nav.today'), icon: '☀️' },
    { href: '/habits', label: t('nav.habits'), icon: '📋' },
    { href: '/calendar', label: t('nav.calendar'), icon: '📅' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="max-w-lg mx-auto flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                isActive ? 'text-indigo-600' : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
