'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Course, Rating, RATINGS, YEARS } from '@/lib/types'

interface VoteRow {
  course_id: string
  rating: Rating
  year: number
}

interface CourseStat {
  course: Course
  count: number
}

/* ───── helpers ───── */
function maxCount(stats: CourseStat[]): number {
  return Math.max(...stats.map((s) => s.count), 1)
}

function pct(count: number, max: number) {
  return Math.round((count / max) * 100)
}

/* ───── sub-components ───── */
function StatBar({
  stat,
  max,
  hex,
}: {
  stat: CourseStat
  max: number
  hex: string
}) {
  const p = pct(stat.count, max)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm text-white font-medium truncate">{stat.course.name}</span>
          <span className="text-xs ml-2 flex-shrink-0" style={{ color: hex }}>
            {stat.count} โหวต
          </span>
        </div>
        {stat.course.code && (
          <span className="text-[10px] font-mono text-gray-500">{stat.course.code}</span>
        )}
        <div className="mt-1.5 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${p}%`, background: hex }}
          />
        </div>
      </div>
    </div>
  )
}

function CategorySection({
  rating,
  stats,
  filterYear,
}: {
  rating: typeof RATINGS[number]
  stats: CourseStat[]
  filterYear: number | null
}) {
  const top = stats.slice(0, 5)
  const max = maxCount(top)

  return (
    <div
      className="rounded-2xl p-4 border"
      style={{
        background: `${rating.hex}08`,
        borderColor: `${rating.hex}30`,
      }}
    >
      {/* header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{rating.emoji}</span>
        <div>
          <h3 className="text-white font-bold text-base leading-tight">{rating.label}</h3>
          <p className="text-xs" style={{ color: `${rating.hex}99` }}>
            {rating.desc}
          </p>
        </div>
        <div
          className="ml-auto text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ background: `${rating.hex}20`, color: rating.hex }}
        >
          {stats.reduce((a, s) => a + s.count, 0)} ทั้งหมด
        </div>
      </div>

      {/* bars */}
      {top.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-4">
          {filterYear ? `ยังไม่มีการโหวตจากปีที่ ${filterYear}` : 'ยังไม่มีการโหวต'}
        </p>
      ) : (
        <div className="space-y-3">
          {top.map((stat, i) => (
            <div key={stat.course.id} className="flex items-start gap-2">
              <span
                className="text-xs font-black w-5 flex-shrink-0 mt-0.5"
                style={{ color: i === 0 ? rating.hex : '#4b5563' }}
              >
                #{i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <StatBar stat={stat} max={max} hex={rating.hex} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ───── main page ───── */
export default function DashboardPage() {
  const [filterYear, setFilterYear] = useState<number | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [votes, setVotes] = useState<VoteRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [cRes, vRes] = await Promise.all([
      supabase.from('courses').select('*'),
      supabase.from('votes').select('course_id, rating, year'),
    ])
    if (cRes.data) setCourses(cRes.data)
    if (vRes.data) setVotes(vRes.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* build per-category top lists */
  const buildStats = (ratingLabel: Rating): CourseStat[] => {
    const filtered = filterYear ? votes.filter((v) => v.year === filterYear) : votes
    const countMap: Record<string, number> = {}

    filtered
      .filter((v) => v.rating === ratingLabel)
      .forEach((v) => {
        countMap[v.course_id] = (countMap[v.course_id] ?? 0) + 1
      })

    return Object.entries(countMap)
      .map(([courseId, count]) => ({
        course: courses.find((c) => c.id === courseId)!,
        count,
      }))
      .filter((s) => s.course)
      .sort((a, b) => b.count - a.count)
  }

  const totalVotes = filterYear
    ? votes.filter((v) => v.year === filterYear).length
    : votes.length

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
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-base">📊 Dashboard</h1>
            <p className="text-gray-500 text-xs mt-0.5">{totalVotes.toLocaleString()} โหวตทั้งหมด</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={fetchData}
              className="text-gray-500 hover:text-white text-xs transition-colors"
              title="Refresh"
            >
              🔄
            </button>
            <Link href="/" className="text-gray-400 hover:text-white text-xs transition-colors">
              โหวต
            </Link>
            <Link href="/admin" className="text-gray-400 hover:text-white text-xs transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* year filter */}
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-2">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterYear(null)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={
              filterYear === null
                ? { background: '#6366f1', color: '#fff' }
                : { background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }
            }
          >
            ภาพรวม
          </button>
          {YEARS.map((y) => {
            const cnt = votes.filter((v) => v.year === y).length
            return (
              <button
                key={y}
                onClick={() => setFilterYear(y)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5"
                style={
                  filterYear === y
                    ? { background: '#6366f1', color: '#fff' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }
                }
              >
                ปีที่ {y}
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: filterYear === y ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  {cnt}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* content */}
      <div className="max-w-3xl mx-auto px-4 mt-4">
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-sm">⏳ กำลังโหลด...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RATINGS.map((r) => (
              <CategorySection
                key={r.label}
                rating={r}
                stats={buildStats(r.label)}
                filterYear={filterYear}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
