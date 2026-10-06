# SkillSync — Member 1: Database

> Owns: `apps/api/prisma/`, `supabase/`, `docs/db/`
> Do not edit files outside these paths.
> Read `00_MASTER_PLAN.md` first. Business rules there are law.

You open **Gate A (schema freeze)**. Backend and AI are blocked on you, so freeze early and then protect the freeze.

---

## 1. Schema v2 (12 tables)

All tables: `id UUID PK default gen_random_uuid()`, `created_at`, `updated_at`.
Soft delete (`deleted_at`) only on `users` and `teams`. Every read of those filters `deleted_at IS NULL`.

### users
```
email            TEXT UNIQUE NOT NULL
password_hash    TEXT NOT NULL
role             ENUM('student','organizer') NOT NULL DEFAULT 'student'
email_verified   BOOLEAN DEFAULT FALSE
fcm_token        TEXT NULL
is_active        BOOLEAN DEFAULT TRUE
deleted_at       TIMESTAMP NULL
```

### profiles (1:1 users)
```
user_id          UUID UNIQUE FK users ON DELETE CASCADE
display_name     TEXT NOT NULL
bio              TEXT
college          TEXT            -- organisers use this as organisation name
graduation_year  INT
github_url       TEXT
linkedin_url     TEXT
looking_for      ENUM('teammate','team','both','not_looking') DEFAULT 'both'
preferred_roles  TEXT[]
```
`looking_for` values: `teammate` = I want to recruit, `team` = I want to join one.

### skills
```
name       TEXT UNIQUE NOT NULL
category   TEXT NOT NULL
aliases    TEXT[] DEFAULT '{}'    -- 'nodejs','node js' -> 'Node.js'. Used by AI name mapping.
```

### user_skills
```
user_id, skill_id        FK, both ON DELETE CASCADE
level                    ENUM('beginner','intermediate','advanced','expert')
UNIQUE(user_id, skill_id)
```

### hackathons
```
organizer_id            UUID FK users
title                   TEXT NOT NULL
description             TEXT
venue                   TEXT
start_date, end_date    TIMESTAMP
registration_deadline   TIMESTAMP
max_team_size           INT DEFAULT 4
status                  ENUM('draft','open','closed','completed') DEFAULT 'open'
```

### hackathon_registrations
```
hackathon_id, user_id   FK
checked_in              BOOLEAN DEFAULT FALSE
UNIQUE(hackathon_id, user_id)
```

### teams
```
hackathon_id    UUID FK hackathons NOT NULL
creator_id      UUID FK users
name            TEXT NOT NULL
description     TEXT
max_members     INT DEFAULT 4
deleted_at      TIMESTAMP NULL
UNIQUE(id, hackathon_id)          -- needed for the composite FK below
```

### team_required_skills
```
team_id, skill_id     FK ON DELETE CASCADE
UNIQUE(team_id, skill_id)
```

### team_members
```
team_id         UUID
hackathon_id    UUID               -- denormalised from teams on purpose
user_id         UUID FK users
role            TEXT
is_leader       BOOLEAN DEFAULT FALSE
joined_at       TIMESTAMP
FK (team_id, hackathon_id) -> teams(id, hackathon_id) ON DELETE CASCADE
UNIQUE(team_id, user_id)
UNIQUE(hackathon_id, user_id)      -- enforces rule 2: one team per hackathon
```
This is the one clever bit in the schema. The composite FK guarantees `hackathon_id` can never disagree with the team's real hackathon, so the unique constraint is trustworthy.

### team_invitations
```
team_id, inviter_id, invitee_id   FK
status      ENUM('pending','accepted','declined','expired') DEFAULT 'pending'
expires_at  TIMESTAMP
```
Prisma cannot express a partial unique index. Add it in a raw SQL migration:
```sql
CREATE UNIQUE INDEX uq_invite_pending
  ON team_invitations (team_id, invitee_id) WHERE status = 'pending';
```

### notifications
```
user_id   FK ON DELETE CASCADE
type      TEXT   -- team_invite | invitation_accepted | member_joined | hackathon_announcement
title     TEXT
body      TEXT
data      JSONB  -- deep link payload, e.g. {"route":"Invitations","invitationId":"..."}
is_read   BOOLEAN DEFAULT FALSE
```

### refresh_tokens
```
user_id      FK ON DELETE CASCADE
token_hash   TEXT UNIQUE      -- SHA256 of the raw token
expires_at   TIMESTAMP
revoked      BOOLEAN DEFAULT FALSE
```

## 2. Indexes

| Table | Index |
|---|---|
| users | `email` (unique already) |
| profiles | `looking_for` |
| skills | `category`, GIN on `aliases` |
| user_skills | `user_id`, `skill_id` |
| hackathons | `(status, start_date)`, `organizer_id` |
| hackathon_registrations | `user_id` |
| teams | `hackathon_id`, `creator_id` |
| team_members | `user_id` |
| team_invitations | `(invitee_id, status)` |
| notifications | `(user_id, is_read, created_at DESC)` |
| refresh_tokens | `user_id` |

## 3. Migration from the current 18-table schema

Do not edit the applied migration. Add a **new** migration file:

- [ ] Drop: `projects`, `project_requirements`, `project_members`, `project_applications`, `user_availability`, `ai_recommendations`, `audit_logs`
- [ ] Rename `hackathon_participants` to `hackathon_registrations`, drop its `team_id`, add `checked_in`
- [ ] `users`: remove `admin` from role enum, add `fcm_token`
- [ ] `teams`: make `hackathon_id` required, drop `project_id` and `qr_code`
- [ ] Add `team_required_skills`, `team_members.hackathon_id` + constraints, `skills.aliases`
- [ ] Rename `team_members.is_admin` to `is_leader`
- [ ] Partial unique index on pending invitations
- [ ] Data is demo-only, so a reset is acceptable. Say so in the team channel before running it.

## 4. Seed (`prisma/seed.ts`)

Must be idempotent (`upsert`) and runnable with `npm run db:seed`.

- [ ] ~45 skills across categories (Frontend, Backend, Mobile, ML/AI, DevOps, Data, Design, Language), each with aliases
- [ ] 1 organiser: `organizer@demo.skillsync` + 1 open hackathon + 1 closed hackathon
- [ ] 12 students with varied skill sets and levels, mixed `looking_for`
- [ ] 4 teams in the open hackathon with required skills, 1 deliberately **full**, 1 with a skill gap
- [ ] ~5 registered but teamless students (these power teammate recommendations)
- [ ] 2 pending invitations, a few notifications
- [ ] Known demo password, written in `docs/db/README.md`. Never reused anywhere real.
- [ ] `npm run db:reset-demo` = truncate + migrate + seed

## 5. Redis key schema (`docs/db/redis-keys.md`)

| Key | Value | TTL | Invalidated when |
|---|---|---|---|
| `profile:{userId}` | profile + skills JSON | 5m | profile or skills change |
| `skills:all` | all skills JSON | 1h | skills table changes |
| `recs:team:{teamId}` | candidates for a team | 10m | team members or required skills change |
| `recs:user:{userId}:{hackathonId}` | teams for a student | 10m | user skills change |
| `throttle:{ip}:{route}` | counter | 60s | automatic |
| `otp:{email}` | hashed OTP | 10m | verified or resent |
| `qr_join:{token}` | `{teamId, createdBy}` | 24h | rotated or expired |
| `team_qr:{teamId}` | current token | 24h | rotated |

Never cache: password hashes, refresh tokens, notification payloads.

## 6. Candidate-selection query (you own this)

Backend/AI call it, you write and tune it. Two functions:

**A. Teamless candidates for a team** (powers FindTeammates)
Registrants of the team's hackathon who are not in any team of that hackathon, `looking_for IN ('team','both')`, active, not deleted, with their skills and levels aggregated in one query.

**B. Open teams for a student** (powers Home recommendations)
Teams in hackathons the student is registered for, not full, student not already in one, with required skills and current members' skills aggregated.

- [ ] Return shapes documented in `docs/db/queries.md`
- [ ] `EXPLAIN ANALYZE` on both with seed data, and with 500 generated users. Add indexes if a seq scan hurts.
- [ ] No N+1. One round trip per function.

## 7. Connection setup

- [ ] `DATABASE_URL` = Supabase pooled connection (for runtime)
- [ ] `DIRECT_URL` = direct connection (for `prisma migrate`)
- [ ] `directUrl` set in `schema.prisma`. Check Supabase's current docs for the exact ports and parameters, they change.
- [ ] `.env.example` has placeholders only. Never commit the real URLs.

## 8. Done when

- [ ] Fresh clone: `prisma migrate deploy && npm run db:seed` gives a fully working demo dataset
- [ ] Concurrent test: two inserts racing for the same user in two teams of one hackathon, exactly one fails
- [ ] `docs/db/` has ERD (Mermaid is fine), redis-keys, queries, README
- [ ] Table view open and ready for any demo, with demo data reset beforehand

## Handoff contract
Any schema change means a new migration file plus a message in the team channel the same day. No silent changes after Gate A.
