'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } else {
        router.push('/dashboard')
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.')
      } else {
        setMessage('이메일을 확인해주세요. 인증 링크가 발송되었습니다.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500 mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Habit Tracker</h1>
          <p className="text-gray-500 mt-1">매일 습관을 기록하고 성장하세요</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {/* Tab */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); setMessage('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setMessage('') }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                !isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="6자 이상"
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
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
              disabled={loading}
              className="w-full py-3 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-colors"
            >
              {loading ? '처리 중...' : isLogin ? '로그인' : '회원가입'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
