'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Course, YEARS } from '@/lib/types'

/* ───── types ───── */
interface FormState {
  name: string
  code: string
  allowed_years: number[]
}

const EMPTY_FORM: FormState = { name: '', code: '', allowed_years: [1, 2, 3, 4] }

/* ───── modal ───── */
function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 border"
        style={{ background: '#13131f', borderColor: 'rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white font-bold text-lg mb-5">{title}</h2>
        {children}
      </div>
    </div>
  )
}

/* ───── course form ───── */
function CourseForm({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial: FormState
  saving: boolean
  onSave: (data: FormState) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>(initial)

  const toggleYear = (y: number) => {
    setForm((prev) => ({
      ...prev,
      allowed_years: prev.allowed_years.includes(y)
        ? prev.allowed_years.filter((x) => x !== y)
        : [...prev.allowed_years, y].sort(),
    }))
  }

  const canSave = form.name.trim() !== '' && form.allowed_years.length > 0

  return (
    <div className="space-y-4">
      {/* name */}
      <div>
        <label className="text-xs text-gray-400 block mb-1.5">ชื่อวิชา *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="เช่น Introduction to Programming"
          className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />
      </div>

      {/* code */}
      <div>
        <label className="text-xs text-gray-400 block mb-1.5">รหัสวิชา (ไม่บังคับ)</label>
        <input
          type="text"
          value={form.code}
          onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
          placeholder="เช่น CS101"
          className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:ring-2 font-mono"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />
      </div>

      {/* allowed years */}
      <div>
        <label className="text-xs text-gray-400 block mb-2">
          ชั้นปีที่โหวตได้ * <span className="text-gray-600">(เลือกได้หลายปี)</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {YEARS.map((y) => {
            const checked = form.allowed_years.includes(y)
            return (
              <button
                key={y}
                type="button"
                onClick={() => toggleYear(y)}
                className="py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={
                  checked
                    ? { background: '#6366f1', color: '#fff', border: '2px solid #6366f1' }
                    : {
                        background: 'rgba(255,255,255,0.04)',
                        color: '#6b7280',
                        border: '2px solid rgba(255,255,255,0.08)',
                      }
                }
              >
                ปี {y}
              </button>
            )
          })}
        </div>
        {form.allowed_years.length === 0 && (
          <p className="text-red-400 text-xs mt-1">⚠️ ต้องเลือกอย่างน้อย 1 ชั้นปี</p>
        )}
      </div>

      {/* actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          ยกเลิก
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={!canSave || saving}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: '#6366f1' }}
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </div>
  )
}

/* ───── course row ───── */
function CourseRow({
  course,
  onEdit,
  onDelete,
}: {
  course: Course
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border"
      style={{ background: '#13131f', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div className="flex-1 min-w-0">
        {course.code && (
          <span className="text-[10px] font-mono text-gray-500 block">{course.code}</span>
        )}
        <p className="text-white text-sm font-medium leading-snug truncate">{course.name}</p>
        <div className="flex gap-1 mt-1">
          {YEARS.map((y) => (
            <span
              key={y}
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={
                course.allowed_years?.includes(y)
                  ? { background: 'rgba(99,102,241,0.2)', color: '#818cf8' }
                  : { background: 'rgba(255,255,255,0.03)', color: '#374151' }
              }
            >
              ปี{y}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          แก้ไข
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 transition-all"
          style={{ background: 'rgba(239,68,68,0.08)' }}
        >
          ลบ
        </button>
      </div>
    </div>
  )
}

/* ───── main page ───── */
export default function AdminPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null)
  const [selected, setSelected] = useState<Course | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('courses').select('*').order('name')
    if (data) setCourses(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const closeModal = () => {
    setModal(null)
    setSelected(null)
  }

  /* CREATE */
  const handleCreate = async (form: FormState) => {
    setSaving(true)
    const { error } = await supabase.from('courses').insert({
      name: form.name.trim(),
      code: form.code.trim() || null,
      allowed_years: form.allowed_years,
    })
    if (!error) {
      await fetchCourses()
      closeModal()
      showToast('✅ เพิ่มวิชาแล้ว')
    }
    setSaving(false)
  }

  /* UPDATE */
  const handleUpdate = async (form: FormState) => {
    if (!selected) return
    setSaving(true)
    const { error } = await supabase
      .from('courses')
      .update({
        name: form.name.trim(),
        code: form.code.trim() || null,
        allowed_years: form.allowed_years,
      })
      .eq('id', selected.id)
    if (!error) {
      await fetchCourses()
      closeModal()
      showToast('✅ อัพเดตวิชาแล้ว')
    }
    setSaving(false)
  }

  /* DELETE */
  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    await supabase.from('votes').delete().eq('course_id', selected.id)
    const { error } = await supabase.from('courses').delete().eq('id', selected.id)
    if (!error) {
      await fetchCourses()
      closeModal()
      showToast('🗑️ ลบวิชาแล้ว')
    }
    setSaving(false)
  }

  const filtered = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.code ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <main className="min-h-screen pb-16">
      {/* header */}
      <div
        className="sticky top-0 z-20 border-b"
        style={{
          background: 'rgba(10,10,20,0.92)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-base">⚙️ Admin</h1>
            <p className="text-gray-500 text-xs mt-0.5">{courses.length} รายวิชา</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/" className="text-gray-400 hover:text-white text-xs transition-colors">
              โหวต
            </Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-white text-xs transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-3">
        {/* search + add */}
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 ค้นหาวิชา..."
            className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
          <button
            onClick={() => setModal('add')}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all active:scale-95"
            style={{ background: '#6366f1' }}
          >
            + เพิ่มวิชา
          </button>
        </div>

        {/* notice */}
        <div
          className="text-xs px-3 py-2 rounded-lg"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
        >
          💡 กำหนดชั้นปีที่โหวตได้ต่อวิชาได้เลย — นักศึกษาจะเห็นเฉพาะวิชาที่ปีของตนเองโหวตได้
        </div>

        {/* list */}
        {loading ? (
          <div className="text-center py-16 text-gray-500 text-sm">⏳ กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            {search ? 'ไม่พบวิชาที่ค้นหา' : 'ยังไม่มีรายวิชา กด "+ เพิ่มวิชา" ได้เลย'}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((course) => (
              <CourseRow
                key={course.id}
                course={course}
                onEdit={() => {
                  setSelected(course)
                  setModal('edit')
                }}
                onDelete={() => {
                  setSelected(course)
                  setModal('delete')
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* modals */}
      {modal === 'add' && (
        <Modal title="➕ เพิ่มรายวิชา" onClose={closeModal}>
          <CourseForm
            initial={EMPTY_FORM}
            saving={saving}
            onSave={handleCreate}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {modal === 'edit' && selected && (
        <Modal title="✏️ แก้ไขรายวิชา" onClose={closeModal}>
          <CourseForm
            initial={{
              name: selected.name,
              code: selected.code ?? '',
              allowed_years: selected.allowed_years ?? [1, 2, 3, 4],
            }}
            saving={saving}
            onSave={handleUpdate}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="🗑️ ยืนยันการลบ" onClose={closeModal}>
          <p className="text-gray-300 text-sm mb-1">
            คุณต้องการลบวิชา <span className="text-white font-semibold">"{selected.name}"</span> ใช่ไหม?
          </p>
          <p className="text-red-400 text-xs mb-6">⚠️ โหวตทั้งหมดของวิชานี้จะถูกลบด้วย</p>
          <div className="flex gap-2">
            <button
              onClick={closeModal}
              className="flex-1 py-2.5 rounded-xl text-sm text-gray-400"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: '#ef4444' }}
            >
              {saving ? 'กำลังลบ...' : 'ลบเลย'}
            </button>
          </div>
        </Modal>
      )}

      {/* toast */}
      {toast && (
        <div
          className="fixed bottom-8 left-1/2 toast-anim px-5 py-2.5 rounded-full text-sm font-semibold shadow-2xl text-white"
          style={{ transform: 'translateX(-50%)', background: '#1e1b4b', border: '1px solid #6366f1' }}
        >
          {toast}
        </div>
      )}
    </main>
  )
}
