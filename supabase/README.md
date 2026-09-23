# SkillSync — Supabase Database & Storage Setup

## 1. Prerequisites
- A Supabase Project created on [Supabase Dashboard](https://app.supabase.com)
- PostgreSQL Database Connection String (Direct or Transaction Pooler)
- Supabase Project URL & Service Role Key

---

## 2. Setting Up `.env`
In `backend/.env`, configure your Supabase credentials:

```env
# Supabase PostgreSQL Connection URL
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
# Or Direct:
# DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Supabase Storage & API
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
```

---

## 3. Applying Schema Migrations

### Option A: Via Prisma CLI (Recommended)
```bash
cd backend
npx prisma db push
```

### Option B: Via Supabase SQL Editor
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Copy and execute the contents of [`supabase/migrations/20260923000000_init_schema.sql`](./migrations/20260923000000_init_schema.sql).
3. Copy and execute the contents of [`supabase/storage.sql`](./storage.sql) to set up buckets (`avatars`, `project-images`) and RLS policies.

---

## 4. Seeding the Database
Once the schema is pushed, seed the database with initial skills taxonomy (45+ skills), dummy student profiles, organizer account, hackathons, and squads:

```bash
cd backend
npm run seed
```

---

## 5. Seeded Accounts & Credentials
| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@skillsync.io` | `Admin@SkillSync2026!` | Master Administrator |
| **Organizer** | `organizer@skillsync.io` | `Organizer@2026!` | TechFest Global Committee |
| **Student** | `alex.chen@university.edu` | `Password@123` | UC Berkeley Full-Stack |
| **Student** | `maya.patel@tech.edu` | `Password@123` | Georgia Tech AI/ML |
| **Student** | `sarah.kim@design.edu` | `Password@123` | RISD UI/UX Designer |
| **Student** | `marcus.vance@mit.edu` | `Password@123` | MIT DevOps / Cloud |
| **Student** | `student@skillsync.io` | `Password@123` | Stanford Mobile Builder |
