# SkillSync — Database (Supabase PostgreSQL + Prisma)

> Plan reference: `plan/01_DATABASE.md`
> 12 Tables (Gate A Freeze) · Supabase Pooler & Direct Connection · Upstash Redis Caching

---

## 1. Quick Setup & Demo Reset

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Deploy Migrations
npx prisma migrate deploy

# 3. Seed Demo Data (Idempotent)
npm run seed

# 4. Full Reset (Truncate + Migrate + Seed)
npm run db:reset-demo
```

---

## 2. Environment & Connection Setup

```ini
# Runtime Pooled Connection (for transaction mode)
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct Connection (for migrations and schema changes)
DIRECT_URL=postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

---

## 3. Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Organizer** | `organizer@demo.skillsync` | `Password@123` |
| **Student (Leader)** | `alex.chen@demo.skillsync` | `Password@123` |
| **Student (Teammate)** | `priya.sharma@demo.skillsync` | `Password@123` |
| **Student (Designer)** | `marcus.vance@demo.skillsync` | `Password@123` |
| **Student (Teamless candidate)** | `david.kim@demo.skillsync` | `Password@123` |

> **Organizer Invite Code:** `SKILLSYNC_ORG_2026`

---

## 4. Schema Summary (12 Tables v2)

1. `users`: Auth identity, bcrypt password hash, role (`student` \| `organizer`), FCM token, soft-delete.
2. `profiles`: Display name, bio, college, graduation year, portfolio links, `looking_for` (`teammate`, `team`, `both`, `not_looking`).
3. `skills`: Normalized skill catalog with `aliases` array for AI matching and GIN index.
4. `user_skills`: User-to-skill map with proficiency `level` (`beginner`, `intermediate`, `advanced`, `expert`).
5. `hackathons`: Hackathon events, venue, schedule, `max_team_size`, `status` (`draft`, `open`, `closed`, `completed`).
6. `hackathon_registrations`: Registrants per hackathon, `checked_in` boolean flag.
7. `teams`: Hackathon squads, max capacity, soft delete, composite constraint `UNIQUE(id, hackathon_id)`.
8. `team_required_skills`: Skills sought by the team for recommendation matching.
9. `team_members`: Squad membership with `is_leader`, role, and composite FK + `UNIQUE(hackathon_id, user_id)` enforcing at most one team per hackathon.
10. `team_invitations`: Team invite records with partial unique index `uq_invite_pending` on pending status.
11. `notifications`: In-app notification logs with JSON deep-link data payloads.
12. `refresh_tokens`: SHA256 hashed refresh tokens with automatic replay reuse detection.
