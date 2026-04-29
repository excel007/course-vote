<<<<<<< HEAD
# course-vote
=======
# 📚 วิชาโปรด — Course Vote App

โหวตรายวิชาตามความโปรดปราน ใน 5 ระดับ

| หมวด | ความหมาย |
|------|----------|
| 🚩 สู่ขิด | ทรมานมาก |
| 💀 เกือบตาย | หนักมาก |
| 😐 พอไหว | ก็โอเค |
| ✨ ต้องลอง | น่าสนใจ |
| 💚 รักแรกพบ | ชอบมาก |

## Stack

- **Next.js 16.2.2** (App Router, Turbopack)
- **Supabase** (PostgreSQL, free tier)
- **Tailwind CSS 3**
- **Vercel** (deploy)

---

## 🚀 ขั้นตอน Deploy

### 1. สร้าง Supabase Project

1. ไปที่ [supabase.com](https://supabase.com) → New Project
2. เปิด **SQL Editor** → วาง `supabase/schema.sql` แล้ว Run
3. Copy `SUPABASE_URL` และ `ANON_KEY` จาก Project Settings → API

### 2. Push ขึ้น GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-username/course-vote.git
git push -u origin main
```

### 3. Deploy บน Vercel

1. ไปที่ [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. ตั้ง Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
3. กด Deploy ✅

---

## 🖥️ รันบน Local

```bash
cp .env.local.example .env.local
# แก้ค่า Supabase ใน .env.local

npm install
npm run dev
```

---

## 📄 หน้าต่างๆ

| Path | คำอธิบาย |
|------|----------|
| `/` | หน้าโหวต — เลือกปี แล้วโหวตวิชา |
| `/dashboard` | Dashboard สรุปผลโหวต กรอง filter ตามชั้นปี |
| `/admin` | Admin CRUD วิชา + ตั้งชั้นปีที่โหวตได้ |

---

## ⚙️ Admin — จัดการรายวิชา

- **เพิ่มวิชา**: กรอกชื่อ, รหัส, เลือกชั้นปีที่โหวตได้ (checkbox)
- **แก้ไข**: กดปุ่ม "แก้ไข" ในแถวนั้น
- **ลบ**: กดปุ่ม "ลบ" — โหวตทั้งหมดของวิชานั้นจะถูกลบด้วย

> ตัวอย่าง: วิชา Machine Learning → เลือกเฉพาะ **ปี 3** และ **ปี 4**
> นักศึกษาปี 1-2 จะไม่เห็นวิชานี้ในหน้าโหวต

---

## 🔒 Security Note

ในโปรเจกต์นี้ Admin ไม่มี login (ตั้งใจให้ใช้ภายใน)
หากต้องการเพิ่ม auth ให้แก้ Supabase RLS policies ใน `schema.sql`
และเพิ่ม Supabase Auth ใน `/app/admin/page.tsx`
>>>>>>> f21d66f (Forst commit)
