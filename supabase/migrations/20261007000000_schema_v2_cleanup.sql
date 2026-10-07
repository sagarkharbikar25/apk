-- SkillSync Schema V2 Migration (12 Tables Freeze)
-- Adheres strictly to plan/01_DATABASE.md

-- 1. Drop 7 obsolete tables
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "ai_recommendations" CASCADE;
DROP TABLE IF EXISTS "project_applications" CASCADE;
DROP TABLE IF EXISTS "project_members" CASCADE;
DROP TABLE IF EXISTS "project_requirements" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "user_availability" CASCADE;

-- 2. Drop obsolete enums
DROP TYPE IF EXISTS "ProjectStatus" CASCADE;
DROP TYPE IF EXISTS "ProjectType" CASCADE;
DROP TYPE IF EXISTS "ApplicationStatus" CASCADE;

-- 3. Update 'skills': add aliases array and timestamps
ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "aliases" TEXT[] DEFAULT '{}';
ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "skills" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS "idx_skills_aliases_gin" ON "skills" USING GIN ("aliases");

-- 4. Rename hackathon_participants to hackathon_registrations & update schema
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hackathon_participants') THEN
    ALTER TABLE "hackathon_participants" RENAME TO "hackathon_registrations";
  END IF;
END $$;

ALTER TABLE IF EXISTS "hackathon_registrations" DROP COLUMN IF EXISTS "team_id";
ALTER TABLE IF EXISTS "hackathon_registrations" ADD COLUMN IF NOT EXISTS "checked_in" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE IF EXISTS "hackathon_registrations" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE IF EXISTS "hackathon_registrations" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 5. Update teams table
ALTER TABLE "teams" DROP COLUMN IF EXISTS "project_id";
ALTER TABLE "teams" DROP COLUMN IF EXISTS "qr_code";
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "hackathon_id" UUID;
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "teams" ALTER COLUMN "max_members" SET DEFAULT 4;

-- Composite unique constraint on teams (id, hackathon_id) for composite foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'teams_id_hackathon_id_key'
  ) THEN
    ALTER TABLE "teams" ADD CONSTRAINT "teams_id_hackathon_id_key" UNIQUE ("id", "hackathon_id");
  END IF;
END $$;

-- 6. Create team_required_skills table
CREATE TABLE IF NOT EXISTS "team_required_skills" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "team_required_skills_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "team_required_skills_team_id_skill_id_key" UNIQUE ("team_id", "skill_id"),
    CONSTRAINT "team_required_skills_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "team_required_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. Update team_members table
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "hackathon_id" UUID;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "is_leader" BOOLEAN NOT NULL DEFAULT FALSE;

-- If old column 'is_admin' exists, migrate values and drop
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'is_admin') THEN
    UPDATE "team_members" SET "is_leader" = "is_admin";
    ALTER TABLE "team_members" DROP COLUMN "is_admin";
  END IF;
END $$;

-- Populate team_members.hackathon_id from teams table if null
UPDATE "team_members" tm
SET "hackathon_id" = t."hackathon_id"
FROM "teams" t
WHERE tm."team_id" = t."id" AND tm."hackathon_id" IS NULL;

-- Enforce Rule 2 constraint: One team per hackathon per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'team_members_hackathon_id_user_id_key'
  ) THEN
    ALTER TABLE "team_members" ADD CONSTRAINT "team_members_hackathon_id_user_id_key" UNIQUE ("hackathon_id", "user_id");
  END IF;
END $$;

-- Composite foreign key from team_members (team_id, hackathon_id) to teams (id, hackathon_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'team_members_team_id_hackathon_id_fkey'
  ) THEN
    ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_hackathon_id_fkey"
        FOREIGN KEY ("team_id", "hackathon_id") REFERENCES "teams"("id", "hackathon_id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 8. Partial unique index on pending invitations
CREATE UNIQUE INDEX IF NOT EXISTS "uq_invite_pending"
    ON "team_invitations" ("team_id", "invitee_id") WHERE status = 'pending';

-- 9. Notification index for efficient unread listing
CREATE INDEX IF NOT EXISTS "idx_notifications_user_unread"
    ON "notifications" ("user_id", "is_read", "created_at" DESC);

-- 10. Profile index on looking_for
CREATE INDEX IF NOT EXISTS "idx_profiles_looking_for" ON "profiles" ("looking_for");
