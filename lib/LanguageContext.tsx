'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Language, getTranslation } from './i18n'

type LanguageContextValue = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'ko',
  setLanguage: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ko')

  useEffect(() => {
    const stored = localStorage.getItem('habit_tracker_language')
    if (stored === 'ko' || stored === 'en') {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('habit_tracker_language', lang)
  }

  const t = (key: string): string => getTranslation(language, key)

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
