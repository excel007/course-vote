export type Rating = 'สู่ขิด' | 'เกือบตาย' | 'พอไหว' | 'ต้องลอง' | 'รักแรกพบ'

export const RATINGS: {
  label: Rating
  emoji: string
  hex: string
  desc: string
}[] = [
  { label: 'สู่ขิด',    emoji: '🚩', hex: '#EF4444', desc: 'ทรมานมาก' },
  { label: 'เกือบตาย',  emoji: '💀', hex: '#F97316', desc: 'หนักมาก'  },
  { label: 'พอไหว',     emoji: '😐', hex: '#EAB308', desc: 'ก็โอเค'   },
  { label: 'ต้องลอง',   emoji: '✨', hex: '#84CC16', desc: 'น่าสนใจ'  },
  { label: 'รักแรกพบ',  emoji: '💚', hex: '#22C55E', desc: 'ชอบมาก'  },
]

export const YEARS = [1, 2, 3, 4]

export interface Course {
  id: string
  name: string
  code: string | null
  allowed_years: number[]   // e.g. [1,2,3,4] or [3,4]
  created_at: string
}

export interface Vote {
  id: string
  course_id: string
  rating: Rating
  year: number
  created_at: string
}
