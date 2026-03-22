'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/lib/LanguageContext'

const checkPassword = (pw: string) => ({
  length:    pw.length >= 8,
  uppercase: /[A-Z]/.test(pw),
  lowercase: /[a-z]/.test(pw),
  number:    /[0-9]/.test(pw),
  special:   /[^A-Za-z0-9]/.test(pw),
})

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showPwChecks, setShowPwChecks] = useState(false)
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()

  const pwChecks = useMemo(() => checkPassword(password), [password])
  const pwValid = Object.values(pwChecks).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!isLogin && !pwValid) {
      setError(t('auth.error_pw_weak'))
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(t('auth.error_login'))
      } else {
        router.push('/dashboard')
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(t('auth.error_signup'))
      } else {
        setMessage(t('auth.success_signup'))
      }
    }

    setLoading(false)
  }

  const checks = [
    { key: 'length',    label: t('auth.pw_length') },
    { key: 'uppercase', label: t('auth.pw_uppercase') },
    { key: 'lowercase', label: t('auth.pw_lowercase') },
    { key: 'number',    label: t('auth.pw_number') },
    { key: 'special',   label: t('auth.pw_special') },
  ] as const

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
            className="text-sm text-gray-400 hover:text-gray-600 font-medium px-2 py-1 rounded-lg border border-gray-200 bg-white"
          >
            {language === 'ko' ? 'EN' : '한국어'}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500 mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.title')}</h1>
          <p className="text-gray-500 mt-1">{t('auth.subtitle')}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* Tab */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); setMessage(''); setShowPwChecks(false) }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setMessage('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                !isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              {t('auth.signup')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => !isLogin && setShowPwChecks(true)}
                required
                placeholder={isLogin ? '비밀번호 입력' : t('auth.pw_length')}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm transition-colors ${
                  !isLogin && showPwChecks && password
                    ? pwValid
                      ? 'border-green-400 focus:ring-green-400'
                      : 'border-orange-300 focus:ring-orange-300'
                    : 'border-gray-200 focus:ring-indigo-500'
                }`}
              />

              {/* Password checklist - only on signup */}
              {!isLogin && showPwChecks && (
                <div className="mt-2 flex flex-col gap-1">
                  {checks.map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${pwChecks[key] ? 'text-green-500' : 'text-gray-300'}`}>
                        {pwChecks[key] ? '✓' : '○'}
                      </span>
                      <span className={`text-xs ${pwChecks[key] ? 'text-green-600' : 'text-gray-400'}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!isLogin && showPwChecks && !pwValid)}
              className="w-full py-3 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {loading ? t('auth.loading') : isLogin ? t('auth.submit_login') : t('auth.submit_signup')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
