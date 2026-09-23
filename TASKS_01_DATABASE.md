# SkillSync — Member 1: Database (Supabase)

> Branch: `feature/db-supabase`
> Owns: `prisma/`, `supabase/`, `docs/db/`
> Do not edit files outside these paths — that's how we keep merges clean.

## Week 1 — Schema Foundation
- [x] Create Supabase project, get `DATABASE_URL` (schema & migration scripts prepared)
- [x] Write full `prisma/schema.prisma`: users, profiles, skills, user_skills,
      user_availability, projects, project_requirements, project_members,
      project_applications, teams, team_members, team_invitations,
      hackathons, hackathon_participants, notifications, ai_recommendations,
      refresh_tokens, audit_logs
- [x] All FKs, UNIQUE constraints, and indexes per blueprint §4
- [x] `deleted_at` soft-delete columns on users, projects, teams
- [x] Run initial migration, verify in Supabase table editor (`supabase/migrations/20260923000000_init_schema.sql`)
- [x] Seed script: skills taxonomy (~45 skills across categories) + 5 dummy users + organizer + admin + hackathons + squads
- [x] Push `.env.example` with `DATABASE_URL` placeholder (never the real one)

## Week 2 — Redis + Storage
- [x] Provision Upstash Redis, get connection URL
- [x] Document key schema in `docs/db/redis-keys.md`:
      `profile:{userId}` (TTL 5m), `skills:all` (TTL 1h),
      `recommendations:{userId}` (TTL 30m), `throttle:{ip}:{endpoint}` (TTL 60s),
      `otp:{email}` (TTL 10m), `qr_join:{token}` (TTL 24h)
- [x] Supabase Storage buckets: `avatars`, `project-images` (`supabase/storage.sql`)
- [x] RLS policies so bucket writes require a valid signed URL from backend

## Week 3-4 — Support
- [ ] On call for schema changes Backend needs (new columns, new enums)
- [ ] Index tuning once real queries exist (check `EXPLAIN ANALYZE` on
      Discover and Recommendations queries — these run most often)

## Week 5-6 — Demo Prep
- [ ] Reset + reseed DB with clean demo data before final rehearsal
- [ ] Have Supabase table view open and ready for the live demo

## Handoff Contract (don't break this without telling Backend)
- Table/column names and types are the interface — Backend codes against them
- Any schema change → new migration file + message in team channel same day
