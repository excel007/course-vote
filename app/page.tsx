'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Course, Rating, RATINGS, YEARS } from '@/lib/types'
import { getVoterId } from '@/lib/voter'

type VoteCounts = Record<string, Record<Rating, number>>

const YEAR_COLORS = [
  { from: '#ff385c', to: '#e00b41' },
  { from: '#ff385c', to: '#ff385c' },
  { from: '#e00b41', to: '#c13515' },
  { from: '#ff385c', to: '#92174d' },
]

const THROTTLE_MS = 3000

function YearSelect({ onSelect }: { onSelect: (y: number) => void }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-canvas">
      <div className="text-center mb-10 slide-up">
        <div className="text-5xl mb-3">📚</div>
        <h1 className="text-4xl font-bold text-ink tracking-tight">วิชาโปรด</h1>
        <p className="text-muted mt-2 text-base">โหวตบอกว่าวิชาไหน เป็นแบบไหน</p>
      </div>

      <p className="text-muted text-sm mb-5">กรุณาเลือกชั้นปีของคุณก่อน</p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs slide-up">
        {YEARS.map((y, i) => (
          <button
            key={y}
            onClick={() => onSelect(y)}
            className="aspect-square rounded-md flex flex-col items-center justify-center
              transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${YEAR_COLORS[i].from}, ${YEAR_COLORS[i].to})`,
              color: '#ffffff',
            }}
          >
            <span className="text-4xl font-bold text-white">{y}</span>
            <span className="text-white/70 text-xs mt-1">ปีที่ {y}</span>
          </button>
        ))}
      </div>

      <div className="mt-12 flex gap-6">
        <Link href="/dashboard"
          className="text-muted hover:text-ink transition-colors text-sm flex items-center gap-1.5">
          📊 ดู Dashboard
        </Link>
        <Link href="/admin"
          className="text-muted hover:text-ink transition-colors text-sm flex items-center gap-1.5">
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
  disabled,
  onClick,
}: {
  rating: typeof RATINGS[number]
  isRecent: boolean
  count: number
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rating-btn ${isRecent ? 'voted pulse-badge' : ''} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      style={isRecent ? { borderColor: rating.hex, color: rating.hex } : { color: rating.hex }}
      title={rating.desc}
    >
      <span className="text-xl leading-none">{rating.emoji}</span>
      <span className="text-[10px] font-semibold leading-tight text-center" style={{ color: rating.hex }}>
        {rating.label}
      </span>
      <span className="text-[10px] text-muted leading-none">
        {count > 0 ? count : ''}
      </span>
    </button>
  )
}

function CourseCard({
  course,
  recentVoteRating,
  voteCounts,
  throttled,
  onVote,
}: {
  course: Course
  recentVoteRating: Rating | null
  voteCounts: Record<Rating, number>
  throttled: boolean
  onVote: (rating: Rating) => void
}) {
  return (
    <div className="course-card slide-up">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          {course.code && (
            <span className="text-xs font-mono text-muted">{course.code}</span>
          )}
          <h3 className="text-ink font-semibold text-sm leading-snug">{course.name}</h3>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {course.allowed_years.map(y => (
            <span key={y}
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: '#fff1f3', color: '#ff385c' }}>
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
            disabled={throttled}
            onClick={() => onVote(r.label)}
          />
        ))}
      </div>
    </div>
  )
}

export default function VotePage() {
  const [step, setStep] = useState<'year' | 'vote'>('year')
  const [year, setYear] = useState<number | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({})
  const [recentVotes, setRecentVotes] = useState<Record<string, Rating>>({})
  const [toast, setToast] = useState<{ msg: string; hex: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [lastVoteTime, setLastVoteTime] = useState(0)

  const fetchData = useCallback(async () => {
    const voterId = getVoterId()
    const [cRes, vRes] = await Promise.all([
      supabase.from('courses').select('*').order('name'),
      supabase.from('votes').select('course_id, rating, voter_id'),
    ])

    if (cRes.data) setCourses(cRes.data)

    if (vRes.data) {
      const counts: VoteCounts = {}
      const myVotes: Record<string, Rating> = {}

      vRes.data.forEach((v) => {
        if (!counts[v.course_id]) {
          counts[v.course_id] = {} as Record<Rating, number>
          RATINGS.forEach((r) => (counts[v.course_id][r.label] = 0))
        }
        counts[v.course_id][v.rating as Rating] =
          (counts[v.course_id][v.rating as Rating] ?? 0) + 1

        if (voterId && v.voter_id === voterId) {
          myVotes[v.course_id] = v.rating as Rating
        }
      })

      setVoteCounts(counts)
      setRecentVotes(myVotes)
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

    const now = Date.now()
    if (now - lastVoteTime < THROTTLE_MS) return

    setSubmitting(true)

    const voterId = getVoterId()
    const prevRating = recentVotes[course.id]

    const { error } = await supabase.from('votes').upsert(
      {
        course_id: course.id,
        rating,
        year,
        voter_id: voterId,
      },
      { onConflict: 'voter_id,course_id' },
    )

    if (!error) {
      setRecentVotes((p) => ({ ...p, [course.id]: rating }))
      setVoteCounts((p) => {
        const updated = { ...p }
        const courseCounts = { ...(updated[course.id] ?? {}) }

        if (prevRating && prevRating !== rating) {
          courseCounts[prevRating] = Math.max(0, (courseCounts[prevRating] ?? 0) - 1)
        }
        if (prevRating !== rating) {
          courseCounts[rating] = (courseCounts[rating] ?? 0) + 1
        }

        updated[course.id] = courseCounts
        return updated
      })

      const r = RATINGS.find((x) => x.label === rating)!
      setToast({ msg: `${r.emoji} "${course.name}" → ${rating}`, hex: r.hex })
      setLastVoteTime(now)

      setTimeout(() => {
        setToast(null)
      }, 2000)
    }

    setSubmitting(false)
  }

  const throttled = submitting || (Date.now() - lastVoteTime < THROTTLE_MS)

  const visibleCourses = year
    ? courses.filter((c) => c.allowed_years?.includes(year))
    : []

  if (step === 'year') return <YearSelect onSelect={selectYear} />

  return (
    <main className="min-h-screen pb-24 bg-canvas">
      <div
        className="sticky top-0 z-20 border-b border-hairline bg-canvas"
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-ink font-bold text-base leading-tight">📚 วิชาโปรด</p>
            <p className="text-primary text-xs mt-0.5">กำลังโหวตในฐานะ นักศึกษาปีที่ {year}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep('year')}
              className="text-xs text-muted hover:text-ink transition-colors">
              เปลี่ยนปี
            </button>
            <Link href="/dashboard"
              className="text-xs text-muted hover:text-ink transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {RATINGS.map((r) => (
            <div
              key={r.label}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0"
              style={{ border: `1px solid ${r.hex}55`, color: r.hex, background: `${r.hex}08` }}>
              {r.emoji} {r.label}
              <span style={{ color: `${r.hex}88` }} className="text-[10px]">— {r.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-3 space-y-3">
        {visibleCourses.length === 0 ? (
          <div className="text-center py-20 text-muted text-sm">
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
              throttled={throttled}
              onVote={(rating) => handleVote(course, rating)}
            />
          ))
        )}
      </div>

      {toast && (
        <div
          className="fixed bottom-8 left-1/2 toast-anim px-5 py-2.5 rounded-full text-sm font-semibold shadow-2xl"
          style={{
            transform: 'translateX(-50%)',
            background: toast.hex,
            color: '#ffffff',
          }}>
          {toast.msg}
        </div>
      )}
    </main>
  )
}
