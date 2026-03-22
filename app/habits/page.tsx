'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Habit } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import { useLanguage } from '@/lib/LanguageContext'

const COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316',
]

type FormMode = 'create' | 'edit' | null

export default function HabitsPage() {
  const router = useRouter()
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [notifyTime, setNotifyTime] = useState('09:00')
  const [saving, setSaving] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      const { data } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true })
      setHabits(data ?? [])
      setLoading(false)
    })
  }, [router])

  const openCreate = () => {
    setName(''); setDescription(''); setColor(COLORS[0]); setNotifyTime('09:00')
    setEditingHabit(null)
    setFormMode('create')
  }

  const openEdit = (habit: Habit) => {
    setName(habit.name)
    setDescription(habit.description ?? '')
    setColor(habit.color)
    setNotifyTime(habit.notify_time)
    setEditingHabit(habit)
    setFormMode('edit')
  }

  const closeForm = () => { setFormMode(null); setEditingHabit(null) }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    if (formMode === 'create') {
      const { data } = await supabase
        .from('habits')
        .insert({ user_id: session.user.id, name: name.trim(), description: description.trim() || null, color, notify_time: notifyTime })
        .select()
        .single()
      if (data) setHabits([...habits, data])
    } else if (formMode === 'edit' && editingHabit) {
      await supabase
        .from('habits')
        .update({ name: name.trim(), description: description.trim() || null, color, notify_time: notifyTime })
        .eq('id', editingHabit.id)
      setHabits(habits.map((h) => h.id === editingHabit.id ? { ...h, name: name.trim(), description: description.trim() || null, color, notify_time: notifyTime } : h))
    }

    setSaving(false)
    closeForm()
  }

  const toggleActive = async (habit: Habit) => {
    const supabase = createClient()
    await supabase.from('habits').update({ is_active: !habit.is_active }).eq('id', habit.id)
    setHabits(habits.map((h) => h.id === habit.id ? { ...h, is_active: !h.is_active } : h))
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('habits.delete_confirm'))) return
    const supabase = createClient()
    await supabase.from('habits').delete().eq('id', id)
    setHabits(habits.filter((h) => h.id !== id))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full bg-indigo-500 animate-pulse" /></div>

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{t('habits.title')}</h1>
          <button
            onClick={openCreate}
            className="w-9 h-9 rounded-full bg-indigo-500 text-white text-xl flex items-center justify-center hover:bg-indigo-600 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        {habits.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-600 font-medium mb-2">{t('habits.empty_title')}</p>
            <p className="text-gray-400 text-sm mb-6">{t('habits.empty_desc')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`bg-white rounded-2xl border border-gray-100 p-4 ${!habit.is_active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: habit.color + '30', border: `2px solid ${habit.color}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{habit.name}</p>
                    {habit.description && <p className="text-sm text-gray-400 truncate">{habit.description}</p>}
                    <p className="text-xs text-gray-300 mt-0.5">{t('habits.notify_prefix')}{habit.notify_time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(habit)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${habit.is_active ? 'bg-indigo-500' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${habit.is_active ? 'left-7' : 'left-1'}`} />
                    </button>
                    <button onClick={() => openEdit(habit)} className="text-gray-300 hover:text-gray-600 p-1">✏️</button>
                    <button onClick={() => handleDelete(habit.id)} className="text-gray-300 hover:text-red-500 p-1">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Sheet Form */}
      {formMode && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={closeForm}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full bg-white rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              {formMode === 'create' ? t('habits.new_habit') : t('habits.edit_habit')}
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('habits.name_label')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('habits.name_placeholder')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('habits.desc_label')}</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('habits.desc_placeholder')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('habits.notify_label')}</label>
                <input
                  type="time"
                  value={notifyTime}
                  onChange={(e) => setNotifyTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('habits.color_label')}</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-9 h-9 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={closeForm}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50"
                >
                  {t('habits.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="flex-1 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50"
                >
                  {saving ? t('habits.saving') : t('habits.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
