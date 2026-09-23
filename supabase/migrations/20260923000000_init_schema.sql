-- ============================================================
-- SkillSync — Initial PostgreSQL Schema Migration
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('student', 'admin', 'organizer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "LookingFor" AS ENUM ('teammate', 'project', 'both', 'not_looking');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "SkillLevel" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ProjectStatus" AS ENUM ('open', 'in_progress', 'completed', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ProjectType" AS ENUM ('hackathon', 'personal', 'research', 'startup');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "InvitationStatus" AS ENUM ('pending', 'accepted', 'declined', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'student',
  "email_verified" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "fcm_token" VARCHAR(500),
  "deleted_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "display_name" VARCHAR(255) NOT NULL,
  "bio" TEXT,
  "college" VARCHAR(255),
  "graduation_year" INTEGER,
  "avatar_url" VARCHAR(500),
  "github_url" VARCHAR(500),
  "linkedin_url" VARCHAR(500),
  "portfolio_url" VARCHAR(500),
  "location" VARCHAR(255),
  "looking_for" "LookingFor",
  "preferred_roles" TEXT[],
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_profiles_user_id" ON "profiles"("user_id");
CREATE INDEX IF NOT EXISTS "idx_profiles_looking_for" ON "profiles"("looking_for");

-- 3. Skills Table
CREATE TABLE IF NOT EXISTS "skills" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) UNIQUE NOT NULL,
  "category" VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS "idx_skills_name" ON "skills"("name");
CREATE INDEX IF NOT EXISTS "idx_skills_category" ON "skills"("category");

-- 4. User Skills Table
CREATE TABLE IF NOT EXISTS "user_skills" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "skill_id" UUID NOT NULL REFERENCES "skills"("id") ON DELETE CASCADE,
  "level" "SkillLevel" NOT NULL,
  CONSTRAINT "uq_user_skills_user_skill" UNIQUE ("user_id", "skill_id")
);
CREATE INDEX IF NOT EXISTS "idx_user_skills_user_id" ON "user_skills"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_skills_skill_id" ON "user_skills"("skill_id");

-- 5. User Availability Table
CREATE TABLE IF NOT EXISTS "user_availability" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "hours_week" INTEGER NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE,
  "timezone" VARCHAR(50),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Projects Table
CREATE TABLE IF NOT EXISTS "projects" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id" UUID NOT NULL REFERENCES "users"("id"),
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "status" "ProjectStatus" NOT NULL DEFAULT 'open',
  "type" "ProjectType" NOT NULL,
  "max_members" INTEGER NOT NULL DEFAULT 4,
  "deleted_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_projects_creator_id" ON "projects"("creator_id");
CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "projects"("status");
CREATE INDEX IF NOT EXISTS "idx_projects_type" ON "projects"("type");

-- 7. Project Requirements Table
CREATE TABLE IF NOT EXISTS "project_requirements" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "skill_id" UUID NOT NULL REFERENCES "skills"("id") ON DELETE CASCADE,
  "is_required" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "uq_project_requirements_project_skill" UNIQUE ("project_id", "skill_id")
);

-- 8. Project Members Table
CREATE TABLE IF NOT EXISTS "project_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" VARCHAR(100),
  "joined_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "uq_project_members_project_user" UNIQUE ("project_id", "user_id")
);

-- 9. Project Applications Table
CREATE TABLE IF NOT EXISTS "project_applications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "applicant_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
  "message" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_project_applications_project_id" ON "project_applications"("project_id");
CREATE INDEX IF NOT EXISTS "idx_project_applications_applicant_id" ON "project_applications"("applicant_id");
CREATE INDEX IF NOT EXISTS "idx_project_applications_status" ON "project_applications"("status");

-- 10. Teams Table
CREATE TABLE IF NOT EXISTS "teams" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "project_id" UUID,
  "creator_id" UUID NOT NULL REFERENCES "users"("id"),
  "qr_code" VARCHAR(100) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  "max_members" INTEGER NOT NULL DEFAULT 5,
  "deleted_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_teams_creator_id" ON "teams"("creator_id");
CREATE INDEX IF NOT EXISTS "idx_teams_qr_code" ON "teams"("qr_code");

-- 11. Team Members Table
CREATE TABLE IF NOT EXISTS "team_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "team_id" UUID NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" VARCHAR(100),
  "is_admin" BOOLEAN NOT NULL DEFAULT false,
  "joined_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "uq_team_members_team_user" UNIQUE ("team_id", "user_id")
);

-- 12. Team Invitations Table
CREATE TABLE IF NOT EXISTS "team_invitations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "team_id" UUID NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
  "inviter_id" UUID NOT NULL REFERENCES "users"("id"),
  "invitee_id" UUID NOT NULL REFERENCES "users"("id"),
  "status" "InvitationStatus" NOT NULL DEFAULT 'pending',
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_team_invitations_invitee_id" ON "team_invitations"("invitee_id");
CREATE INDEX IF NOT EXISTS "idx_team_invitations_status" ON "team_invitations"("status");

-- 13. Hackathons Table
CREATE TABLE IF NOT EXISTS "hackathons" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(255) NOT NULL,
  "organizer_id" UUID NOT NULL REFERENCES "users"("id"),
  "description" TEXT,
  "start_date" TIMESTAMPTZ NOT NULL,
  "end_date" TIMESTAMPTZ NOT NULL,
  "registration_deadline" TIMESTAMPTZ NOT NULL,
  "max_team_size" INTEGER NOT NULL DEFAULT 4,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Hackathon Participants Table
CREATE TABLE IF NOT EXISTS "hackathon_participants" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "hackathon_id" UUID NOT NULL REFERENCES "hackathons"("id") ON DELETE CASCADE,
  "team_id" UUID REFERENCES "teams"("id"),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "uq_hackathon_participants_hackathon_user" UNIQUE ("hackathon_id", "user_id")
);

-- 15. Notifications Table
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" VARCHAR(100) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "body" TEXT NOT NULL,
  "data" JSONB,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_is_read" ON "notifications"("is_read");
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications"("created_at");

-- 16. AI Recommendations Table
CREATE TABLE IF NOT EXISTS "ai_recommendations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "for_user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "recommended_user_id" UUID REFERENCES "users"("id"),
  "project_id" UUID REFERENCES "projects"("id"),
  "score" DOUBLE PRECISION NOT NULL,
  "score_breakdown" JSONB NOT NULL,
  "reasons" TEXT[] NOT NULL,
  "generated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "expires_at" TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_ai_recommendations_for_user_id" ON "ai_recommendations"("for_user_id");
CREATE INDEX IF NOT EXISTS "idx_ai_recommendations_expires_at" ON "ai_recommendations"("expires_at");

-- 17. Refresh Tokens Table
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" VARCHAR(255) UNIQUE NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "revoked" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_token_hash" ON "refresh_tokens"("token_hash");
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id");

-- 18. Audit Logs Table
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "users"("id"),
  "action" VARCHAR(100) NOT NULL,
  "entity_type" VARCHAR(100),
  "entity_id" VARCHAR(100),
  "ip_address" VARCHAR(50),
  "user_agent" VARCHAR(500),
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
