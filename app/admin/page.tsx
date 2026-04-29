'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Course, YEARS } from '@/lib/types'

interface FormState {
  name: string
  code: string
  allowed_years: number[]
}

const EMPTY_FORM: FormState = { name: '', code: '', allowed_years: [1, 2, 3, 4] }

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
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-md p-6 border border-hairline bg-canvas"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-ink font-bold text-lg mb-5">{title}</h2>
        {children}
      </div>
    </div>
  )
}

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
      <div>
        <label className="text-xs text-muted block mb-1.5">ชื่อวิชา *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="เช่น Introduction to Programming"
          className="w-full px-3 py-2.5 rounded-sm text-sm text-ink placeholder-muted-soft outline-none focus:ring-2 focus:ring-ink"
          style={{
            background: '#ffffff',
            border: '1px solid #dddddd',
          }}
        />
      </div>

      <div>
        <label className="text-xs text-muted block mb-1.5">รหัสวิชา (ไม่บังคับ)</label>
        <input
          type="text"
          value={form.code}
          onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
          placeholder="เช่น CS101"
          className="w-full px-3 py-2.5 rounded-sm text-sm text-ink placeholder-muted-soft outline-none focus:ring-2 focus:ring-ink font-mono"
          style={{
            background: '#ffffff',
            border: '1px solid #dddddd',
          }}
        />
      </div>

      <div>
        <label className="text-xs text-muted block mb-2">
          ชั้นปีที่โหวตได้ * <span className="text-muted-soft">(เลือกได้หลายปี)</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {YEARS.map((y) => {
            const checked = form.allowed_years.includes(y)
            return (
              <button
                key={y}
                type="button"
                onClick={() => toggleYear(y)}
                className="py-2.5 rounded-sm text-sm font-semibold transition-all active:scale-95"
                style={
                  checked
                    ? { background: '#ff385c', color: '#ffffff', border: '2px solid #ff385c' }
                    : {
                        background: '#f7f7f7',
                        color: '#6a6a6a',
                        border: '2px solid #ebebeb',
                      }
                }
              >
                ปี {y}
              </button>
            )
          })}
        </div>
        {form.allowed_years.length === 0 && (
          <p className="text-primary-error-text text-xs mt-1">⚠️ ต้องเลือกอย่างน้อย 1 ชั้นปี</p>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-sm text-sm text-muted transition-all"
          style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}
        >
          ยกเลิก
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={!canSave || saving}
          className="flex-1 py-2.5 rounded-sm text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: '#ff385c' }}
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </div>
  )
}

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
      className="flex items-center gap-3 px-4 py-3 rounded-md border border-hairline bg-canvas"
    >
      <div className="flex-1 min-w-0">
        {course.code && (
          <span className="text-[10px] font-mono text-muted block">{course.code}</span>
        )}
        <p className="text-ink text-sm font-medium leading-snug truncate">{course.name}</p>
        <div className="flex gap-1 mt-1">
          {YEARS.map((y) => (
            <span
              key={y}
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={
                course.allowed_years?.includes(y)
                  ? { background: '#fff1f3', color: '#ff385c' }
                  : { background: '#f7f7f7', color: '#c1c1c1' }
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
          className="px-3 py-1.5 rounded-sm text-xs text-muted hover:text-ink transition-all"
          style={{ background: '#f7f7f7' }}
        >
          แก้ไข
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1.5 rounded-sm text-xs text-primary-error-text hover:text-primary-error-text-hover transition-all"
          style={{ background: '#fff5f5' }}
        >
          ลบ
        </button>
      </div>
    </div>
  )
}

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
    <main className="min-h-screen pb-16 bg-canvas">
      <div
        className="sticky top-0 z-20 border-b border-hairline bg-canvas"
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-ink font-bold text-base">⚙️ Admin</h1>
            <p className="text-muted text-xs mt-0.5">{courses.length} รายวิชา</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/" className="text-muted hover:text-ink text-xs transition-colors">
              โหวต
            </Link>
            <Link href="/dashboard" className="text-muted hover:text-ink text-xs transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 ค้นหาวิชา..."
            className="flex-1 px-3 py-2.5 rounded-sm text-sm text-ink placeholder-muted-soft outline-none"
            style={{
              background: '#ffffff',
              border: '1px solid #dddddd',
            }}
          />
          <button
            onClick={() => setModal('add')}
            className="px-4 py-2.5 rounded-sm text-sm font-semibold text-white flex-shrink-0 transition-all active:scale-95"
            style={{ background: '#ff385c' }}
          >
            + เพิ่มวิชา
          </button>
        </div>

        <div
          className="text-xs px-3 py-2 rounded-sm"
          style={{ background: '#fff1f3', color: '#ff385c' }}
        >
          💡 กำหนดชั้นปีที่โหวตได้ต่อวิชาได้เลย — นักศึกษาจะเห็นเฉพาะวิชาที่ปีของตนเองโหวตได้
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted text-sm">⏳ กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">
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
          <p className="text-body text-sm mb-1">
            คุณต้องการลบวิชา <span className="text-ink font-semibold">"{selected.name}"</span> ใช่ไหม?
          </p>
          <p className="text-primary-error-text text-xs mb-6">⚠️ โหวตทั้งหมดของวิชานี้จะถูกลบด้วย</p>
          <div className="flex gap-2">
            <button
              onClick={closeModal}
              className="flex-1 py-2.5 rounded-sm text-sm text-muted"
              style={{ background: '#f7f7f7', border: '1px solid #ebebeb' }}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 py-2.5 rounded-sm text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: '#ff385c' }}
            >
              {saving ? 'กำลังลบ...' : 'ลบเลย'}
            </button>
          </div>
        </Modal>
      )}

      {toast && (
        <div
          className="fixed bottom-8 left-1/2 toast-anim px-5 py-2.5 rounded-full text-sm font-semibold shadow-2xl text-white"
          style={{ transform: 'translateX(-50%)', background: '#ff385c' }}
        >
          {toast}
        </div>
      )}
    </main>
  )
}
