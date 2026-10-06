# SkillSync — Database (Supabase PostgreSQL + Prisma)

> Plan reference: `plan/01_DATABASE.md`
> 12 Tables · Supabase Pooler & Direct Connection · Upstash Redis Caching

---

## 1. Quick Setup

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Push / Deploy Migrations
npx prisma db push # or npx prisma migrate deploy

# 3. Seed Demo Data
npm run seed
```

---

## 2. Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Organizer** | `organizer@demo.skillsync` | `SecurePass123!` |
| **Student (Leader)** | `alex.chen@mit.edu` | `SecurePass123!` |
| **Student (Teammate)** | `sarah.lin@berkeley.edu` | `SecurePass123!` |
| **Student (Teamless)** | `dev.marcus@stanford.edu` | `SecurePass123!` |

> **Organizer Invite Code:** `SKILLSYNC_ORG_2026`

---

## 3. Schema Summary (12 Tables)

1. `users`: Auth identity, bcrypt password hash, role (`student` \| `organizer`), FCM token, soft-delete.
2. `profiles`: Display name, bio, college, graduation year, social links, `looking_for`.
3. `skills`: Normalized skill catalog with `aliases` array for AI matching.
4. `user_skills`: User-to-skill map with proficiency `level` (`beginner`, `intermediate`, `advanced`, `expert`).
5. `hackathons`: Hackathon details, dates, deadline, `max_team_size`, status, organizer foreign key.
6. `hackathon_registrations` / `hackathon_participants`: Registrants per hackathon, check-in status.
7. `teams`: Hackathon squads, max capacity, soft delete.
8. `team_required_skills`: Skills sought by the team for recommendation matching.
9. `team_members`: Squad membership with `is_leader`, role, and composite constraint enforcing at most one team per hackathon.
10. `team_invitations`: Team invite records with 48h expiration check.
11. `notifications`: In-app notification logs with JSON deep-link data payloads.
12. `refresh_tokens`: SHA256 hashed refresh tokens with automatic replay reuse detection.
