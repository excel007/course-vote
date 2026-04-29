'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Course, Rating, RATINGS, YEARS } from '@/lib/types'

type VoteCounts = Record<string, Record<Rating, number>>

/* ─────────────── helpers ─────────────── */
const YEAR_COLORS = [
  { from: '#6366f1', to: '#8b5cf6' }, // ปี 1 indigo-violet
  { from: '#0ea5e9', to: '#6366f1' }, // ปี 2 sky-indigo
  { from: '#f97316', to: '#ef4444' }, // ปี 3 orange-red
  { from: '#22c55e', to: '#0ea5e9' }, // ปี 4 green-sky
]

/* ─────────────── sub-components ─────────────── */
function YearSelect({ onSelect }: { onSelect: (y: number) => void }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #0a0a14 60%)' }}>
      <div className="text-center mb-10 slide-up">
        <div className="text-5xl mb-3">📚</div>
        <h1 className="text-4xl font-black text-white tracking-tight">วิชาโปรด</h1>
        <p className="text-indigo-300 mt-2 text-base">โหวตบอกว่าวิชาไหน เป็นแบบไหน</p>
      </div>

      <p className="text-gray-400 text-sm mb-5">กรุณาเลือกชั้นปีของคุณก่อน</p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs slide-up">
        {YEARS.map((y, i) => (
          <button
            key={y}
            onClick={() => onSelect(y)}
            className="aspect-square rounded-2xl flex flex-col items-center justify-center
              shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${YEAR_COLORS[i].from}, ${YEAR_COLORS[i].to})`,
              boxShadow: `0 8px 32px ${YEAR_COLORS[i].from}40`,
            }}
          >
            <span className="text-4xl font-black text-white">{y}</span>
            <span className="text-white/70 text-xs mt-1">ปีที่ {y}</span>
          </button>
        ))}
      </div>

      <div className="mt-12 flex gap-6">
        <Link href="/dashboard"
          className="text-gray-500 hover:text-gray-300 transition-colors text-sm flex items-center gap-1.5">
          📊 ดู Dashboard
        </Link>
        <Link href="/admin"
          className="text-gray-500 hover:text-gray-300 transition-colors text-sm flex items-center gap-1.5">
          ⚙️ Admin
        </Link>
      </div>
    </main>
  )
}

function RatingButton({
  rating,
  isRecent,
  count,
  onClick,
}: {
  rating: typeof RATINGS[number]
  isRecent: boolean
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`rating-btn ${isRecent ? 'voted pulse-badge' : ''}`}
      style={isRecent ? { borderColor: rating.hex, color: rating.hex } : { color: rating.hex }}
      title={rating.desc}
    >
      <span className="text-xl leading-none">{rating.emoji}</span>
      <span className="text-[10px] font-semibold leading-tight text-center" style={{ color: rating.hex }}>
        {rating.label}
      </span>
      <span className="text-[10px] text-gray-500 leading-none">
        {count > 0 ? count : ''}
      </span>
    </button>
  )
}

function CourseCard({
  course,
  recentVoteRating,
  voteCounts,
  onVote,
}: {
  course: Course
  recentVoteRating: Rating | null
  voteCounts: Record<Rating, number>
  onVote: (rating: Rating) => void
}) {
  return (
    <div className="course-card slide-up">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          {course.code && (
            <span className="text-xs font-mono text-gray-500">{course.code}</span>
          )}
          <h3 className="text-white font-semibold text-sm leading-snug">{course.name}</h3>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {course.allowed_years.map(y => (
            <span key={y}
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
              ปี{y}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-1.5">
        {RATINGS.map(r => (
          <RatingButton
            key={r.label}
            rating={r}
            isRecent={recentVoteRating === r.label}
            count={voteCounts[r.label] ?? 0}
            onClick={() => onVote(r.label)}
          />
        ))}
      </div>
    </div>
  )
}

/* ─────────────── main page ─────────────── */
export default function VotePage() {
  const [step, setStep] = useState<'year' | 'vote'>('year')
  const [year, setYear] = useState<number | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({})
  const [recentVotes, setRecentVotes] = useState<Record<string, Rating>>({})
  const [toast, setToast] = useState<{ msg: string; hex: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    const [cRes, vRes] = await Promise.all([
      supabase.from('courses').select('*').order('name'),
      supabase.from('votes').select('course_id, rating'),
    ])

    if (cRes.data) setCourses(cRes.data)

    if (vRes.data) {
      const counts: VoteCounts = {}
      vRes.data.forEach((v) => {
        if (!counts[v.course_id]) {
          counts[v.course_id] = {} as Record<Rating, number>
          RATINGS.forEach((r) => (counts[v.course_id][r.label] = 0))
        }
        counts[v.course_id][v.rating as Rating] =
          (counts[v.course_id][v.rating as Rating] ?? 0) + 1
      })
      setVoteCounts(counts)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const selectYear = (y: number) => {
    setYear(y)
    setStep('vote')
  }

  const handleVote = async (course: Course, rating: Rating) => {
    if (!year || submitting) return
    setSubmitting(true)

    const { error } = await supabase.from('votes').insert({
      course_id: course.id,
      rating,
      year,
    })

    if (!error) {
      setRecentVotes((p) => ({ ...p, [course.id]: rating }))
      setVoteCounts((p) => ({
        ...p,
        [course.id]: {
          ...(p[course.id] ?? {}),
          [rating]: (p[course.id]?.[rating] ?? 0) + 1,
        },
      }))

      const r = RATINGS.find((x) => x.label === rating)!
      setToast({ msg: `${r.emoji} "${course.name}" → ${rating}`, hex: r.hex })

      setTimeout(() => {
        setToast(null)
        setRecentVotes((p) => {
          const n = { ...p }
          delete n[course.id]
          return n
        })
      }, 2000)
    }

    setSubmitting(false)
  }

  /* filter courses by selected year */
  const visibleCourses = year
    ? courses.filter((c) => c.allowed_years?.includes(year))
    : []

  if (step === 'year') return <YearSelect onSelect={selectYear} />

  return (
    <main className="min-h-screen pb-24">
      {/* sticky header */}
      <div
        className="sticky top-0 z-20 border-b"
        style={{ background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-base leading-tight">📚 วิชาโปรด</p>
            <p className="text-indigo-400 text-xs mt-0.5">กำลังโหวตในฐานะ นักศึกษาปีที่ {year}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep('year')}
              className="text-xs text-gray-400 hover:text-white transition-colors">
              เปลี่ยนปี
            </button>
            <Link href="/dashboard"
              className="text-xs text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* rating legend */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {RATINGS.map((r) => (
            <div
              key={r.label}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
              style={{ border: `1px solid ${r.hex}55`, color: r.hex, background: `${r.hex}12` }}>
              {r.emoji} {r.label}
              <span style={{ color: `${r.hex}88` }} className="text-[10px]">— {r.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* course list */}
      <div className="max-w-2xl mx-auto px-4 mt-3 space-y-3">
        {visibleCourses.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm">
            <div className="text-3xl mb-3">🤔</div>
            ไม่มีรายวิชาสำหรับปีที่ {year}<br />
            ให้ Admin เพิ่มวิชาและตั้งค่าชั้นปีก่อนนะ
          </div>
        ) : (
          visibleCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              recentVoteRating={recentVotes[course.id] ?? null}
              voteCounts={voteCounts[course.id] ?? ({} as Record<Rating, number>)}
              onVote={(rating) => handleVote(course, rating)}
            />
          ))
        )}
      </div>

      {/* toast */}
      {toast && (
        <div
          className="fixed bottom-8 left-1/2 toast-anim px-5 py-2.5 rounded-full text-sm font-semibold shadow-2xl"
          style={{
            transform: 'translateX(-50%)',
            background: toast.hex,
            color: '#fff',
            boxShadow: `0 8px 32px ${toast.hex}80`,
          }}>
          {toast.msg}
        </div>
      )}
    </main>
  )
}
