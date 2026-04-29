-- ============================================================
-- Course Vote — Supabase Schema
-- รันใน Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. COURSES
create table if not exists courses (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  code          text,
  allowed_years int[] not null default '{1,2,3,4}',
  created_at    timestamptz default now()
);

-- 2. VOTES
create table if not exists votes (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid references courses(id) on delete cascade,
  rating     text not null check (rating in ('สู่ขิด','เกือบตาย','พอไหว','ต้องลอง','รักแรกพบ')),
  year       int  not null check (year between 1 and 4),
  voter_id   uuid not null,
  created_at timestamptz default now(),
  unique (voter_id, course_id)
);

-- 3. INDEXES
create index if not exists votes_course_id_idx on votes (course_id);
create index if not exists votes_rating_idx    on votes (rating);
create index if not exists votes_year_idx      on votes (year);
create index if not exists votes_voter_id_idx  on votes (voter_id);

-- 4. ROW LEVEL SECURITY
alter table courses enable row level security;
alter table votes   enable row level security;

-- Allow public reads
create policy "public read courses" on courses for select using (true);
create policy "public read votes"   on votes   for select using (true);

-- Allow public inserts on votes (anonymous voting)
create policy "public insert votes" on votes for insert with check (true);

-- Allow public updates on votes (upsert — voter can change their vote)
create policy "public update votes" on votes for update using (true) with check (true);

-- Allow public CRUD on courses (admin page)
create policy "public insert courses" on courses for insert with check (true);
create policy "public update courses" on courses for update using (true);
create policy "public delete courses" on courses for delete using (true);

-- ============================================================
-- SAMPLE DATA (optional — ลบได้)
-- ============================================================
insert into courses (name, code, allowed_years) values
  ('Introduction to Programming',  'CS101', '{1,2,3,4}'),
  ('Data Structures',              'CS201', '{1,2,3,4}'),
  ('Database Systems',             'CS301', '{2,3,4}'),
  ('Machine Learning',             'CS401', '{3,4}'),
  ('Software Engineering',         'CS302', '{2,3,4}'),
  ('Computer Networks',            'CS303', '{2,3,4}'),
  ('Operating Systems',            'CS304', '{2,3,4}'),
  ('AI Fundamentals',              'CS402', '{3,4}');

-- ============================================================
-- MIGRATION: สำหรับ database ที่มีอยู่แล้ว (รันแยกต่างหาก)
-- ============================================================
-- alter table votes add column voter_id uuid;
-- update votes set voter_id = gen_random_uuid() where voter_id is null;
-- alter table votes alter column voter_id set not null;
-- alter table votes add unique (voter_id, course_id);
-- create index votes_voter_id_idx on votes (voter_id);
-- create policy "public update votes" on votes for update using (true) with check (true);
