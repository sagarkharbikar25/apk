-- ====================================================================
-- SkillSync — Master Supabase SQL Setup (Schema, Storage, RLS & Seed)
-- Run this complete script in Supabase Dashboard -> SQL Editor
-- ====================================================================

-- ── 1. Extensions ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 2. Custom Enums ─────────────────────────────────────────────────
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

-- ── 3. Table Definitions ────────────────────────────────────────────

-- Users
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

-- Profiles
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

-- Skills
CREATE TABLE IF NOT EXISTS "skills" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) UNIQUE NOT NULL,
  "category" VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS "idx_skills_name" ON "skills"("name");
CREATE INDEX IF NOT EXISTS "idx_skills_category" ON "skills"("category");

-- User Skills
CREATE TABLE IF NOT EXISTS "user_skills" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "skill_id" UUID NOT NULL REFERENCES "skills"("id") ON DELETE CASCADE,
  "level" "SkillLevel" NOT NULL,
  CONSTRAINT "uq_user_skills_user_skill" UNIQUE ("user_id", "skill_id")
);
CREATE INDEX IF NOT EXISTS "idx_user_skills_user_id" ON "user_skills"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_skills_skill_id" ON "user_skills"("skill_id");

-- User Availability
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

-- Projects
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

-- Project Requirements
CREATE TABLE IF NOT EXISTS "project_requirements" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "skill_id" UUID NOT NULL REFERENCES "skills"("id") ON DELETE CASCADE,
  "is_required" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "uq_project_requirements_project_skill" UNIQUE ("project_id", "skill_id")
);

-- Project Members
CREATE TABLE IF NOT EXISTS "project_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" VARCHAR(100),
  "joined_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "uq_project_members_project_user" UNIQUE ("project_id", "user_id")
);

-- Project Applications
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

-- Teams
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

-- Team Members
CREATE TABLE IF NOT EXISTS "team_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "team_id" UUID NOT NULL REFERENCES "teams"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "role" VARCHAR(100),
  "is_admin" BOOLEAN NOT NULL DEFAULT false,
  "joined_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "uq_team_members_team_user" UNIQUE ("team_id", "user_id")
);

-- Team Invitations
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

-- Hackathons
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

-- Hackathon Participants
CREATE TABLE IF NOT EXISTS "hackathon_participants" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "hackathon_id" UUID NOT NULL REFERENCES "hackathons"("id") ON DELETE CASCADE,
  "team_id" UUID REFERENCES "teams"("id"),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "uq_hackathon_participants_hackathon_user" UNIQUE ("hackathon_id", "user_id")
);

-- Notifications
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

-- AI Recommendations
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

-- Refresh Tokens
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

-- Audit Logs
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

-- ── 4. Supabase Storage Buckets & Policies ───────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
  ('project-images', 'project-images', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Public Read Project Images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated Upload Project Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ── 5. Seed Skills Taxonomy (~45 Skills) ────────────────────────────
INSERT INTO "skills" ("name", "category") VALUES
  ('React Native', 'Mobile'),
  ('Flutter', 'Mobile'),
  ('Kotlin', 'Mobile'),
  ('Swift', 'Mobile'),
  ('Android SDK', 'Mobile'),
  ('iOS SDK', 'Mobile'),
  ('Expo', 'Mobile'),
  ('React', 'Frontend'),
  ('Next.js', 'Frontend'),
  ('TypeScript', 'Frontend'),
  ('JavaScript', 'Frontend'),
  ('TailwindCSS', 'Frontend'),
  ('Vue.js', 'Frontend'),
  ('Angular', 'Frontend'),
  ('Svelte', 'Frontend'),
  ('Node.js', 'Backend'),
  ('NestJS', 'Backend'),
  ('Python', 'Backend'),
  ('FastAPI', 'Backend'),
  ('Go', 'Backend'),
  ('Java', 'Backend'),
  ('Spring Boot', 'Backend'),
  ('Rust', 'Backend'),
  ('GraphQL', 'Backend'),
  ('PostgreSQL', 'Database'),
  ('MongoDB', 'Database'),
  ('Redis', 'Database'),
  ('Prisma ORM', 'Database'),
  ('Supabase DB', 'Database'),
  ('Firebase Firestore', 'Database'),
  ('Google Gemini', 'AI/ML'),
  ('OpenAI API', 'AI/ML'),
  ('PyTorch', 'AI/ML'),
  ('TensorFlow', 'AI/ML'),
  ('LangChain', 'AI/ML'),
  ('Computer Vision', 'AI/ML'),
  ('Natural Language Processing', 'AI/ML'),
  ('Figma', 'Design'),
  ('UI/UX Design', 'Design'),
  ('Design Systems', 'Design'),
  ('Docker', 'DevOps'),
  ('Kubernetes', 'DevOps'),
  ('GitHub Actions', 'DevOps'),
  ('AWS', 'Cloud'),
  ('Google Cloud Platform', 'Cloud'),
  ('Supabase', 'Cloud'),
  ('Firebase', 'Cloud'),
  ('Vercel', 'Cloud'),
  ('Cybersecurity', 'Security'),
  ('Solidity', 'Blockchain'),
  ('Web3.js', 'Blockchain')
ON CONFLICT ("name") DO NOTHING;

-- ── 6. Seed Demo Users & Roles ──────────────────────────────────────
-- Password hash for 'Admin@SkillSync2026!'
INSERT INTO "users" ("id", "email", "password_hash", "role", "email_verified")
VALUES ('c0a80101-0000-0000-0000-000000000001', 'admin@skillsync.io', '$2b$12$NlmzK2H84iWc53eJb/H7qu5KmgLq8Xv5F5R4dO6jX7.gO4K2vN6Wy', 'admin', true)
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "profiles" ("user_id", "display_name", "bio", "college", "location")
VALUES ('c0a80101-0000-0000-0000-000000000001', 'SkillSync Master Admin', 'Platform Administrator & System Auditor', 'SkillSync HQ', 'San Francisco, CA')
ON CONFLICT ("user_id") DO NOTHING;

-- Password hash for 'Organizer@2026!'
INSERT INTO "users" ("id", "email", "password_hash", "role", "email_verified")
VALUES ('c0a80101-0000-0000-0000-000000000002', 'organizer@skillsync.io', '$2b$10$w8.gU9qUjO3F4O5F1Y8y/OYmR67m5W3lGZ1A6i3b9e4Y0f8X2s1lq', 'organizer', true)
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "profiles" ("user_id", "display_name", "bio", "college", "location", "preferred_roles")
VALUES ('c0a80101-0000-0000-0000-000000000002', 'TechFest Global Events', 'Global Hackathon & Tech Innovation Summit Committee', 'Stanford Innovation Lab', 'Palo Alto, CA', ARRAY['Hackathon Organizer', 'Event Director'])
ON CONFLICT ("user_id") DO NOTHING;

-- Password hash for 'Password@123'
INSERT INTO "users" ("id", "email", "password_hash", "role", "email_verified")
VALUES 
  ('c0a80101-0000-0000-0000-000000000003', 'student@skillsync.io', '$2b$10$yqJ1X1.4qZl2x7K7C3Kx5.G6x0jF2s1lqY8y/OYmR67m5W3lGZ1A6', 'student', true),
  ('c0a80101-0000-0000-0000-000000000004', 'alex.chen@university.edu', '$2b$10$yqJ1X1.4qZl2x7K7C3Kx5.G6x0jF2s1lqY8y/OYmR67m5W3lGZ1A6', 'student', true),
  ('c0a80101-0000-0000-0000-000000000005', 'maya.patel@tech.edu', '$2b$10$yqJ1X1.4qZl2x7K7C3Kx5.G6x0jF2s1lqY8y/OYmR67m5W3lGZ1A6', 'student', true)
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "profiles" ("user_id", "display_name", "bio", "college", "graduation_year", "location", "github_url", "linkedin_url", "looking_for", "preferred_roles")
VALUES 
  ('c0a80101-0000-0000-0000-000000000003', 'Dev Demo Student', 'Mobile & Web builder exploring AI-driven student platforms.', 'Stanford University', 2026, 'Stanford, CA', 'https://github.com/skillsync-dev', 'https://linkedin.com/in/skillsync-demo', 'both', ARRAY['Frontend Developer', 'Mobile Engineer']),
  ('c0a80101-0000-0000-0000-000000000004', 'Alex Chen', 'Full-stack builder passionate about Mobile apps and Gemini AI.', 'UC Berkeley', 2026, 'Berkeley, CA', 'https://github.com/alexchen-dev', 'https://linkedin.com/in/alexchen', 'both', ARRAY['Full-Stack Developer', 'Mobile Lead']),
  ('c0a80101-0000-0000-0000-000000000005', 'Maya Patel', 'AI researcher and Python engineer working on recommendation engines.', 'Georgia Tech', 2025, 'Atlanta, GA', 'https://github.com/mayapatel-ai', 'https://linkedin.com/in/mayapatel', 'teammate', ARRAY['AI/ML Engineer', 'Backend Specialist'])
ON CONFLICT ("user_id") DO NOTHING;

-- ── 7. Seed Sample Hackathons ───────────────────────────────────────
INSERT INTO "hackathons" ("id", "title", "organizer_id", "description", "start_date", "end_date", "registration_deadline", "max_team_size", "is_active")
VALUES 
  ('h0a80101-0000-0000-0000-000000000001', 'AI In Action Global Hackathon 2026', 'c0a80101-0000-0000-0000-000000000002', 'Build cutting-edge multi-agent AI and mobile solutions to revolutionize student collaboration.', NOW() + INTERVAL '7 days', NOW() + INTERVAL '9 days', NOW() + INTERVAL '5 days', 4, true),
  ('h0a80101-0000-0000-0000-000000000002', 'Campus Web3 & Cloud Summit 2026', 'c0a80101-0000-0000-0000-000000000002', 'Design next-generation decentralized infrastructure and cloud tools for universities.', NOW() + INTERVAL '20 days', NOW() + INTERVAL '22 days', NOW() + INTERVAL '18 days', 5, true)
ON CONFLICT ("id") DO NOTHING;

-- ── 8. Seed Sample Squad / Team ─────────────────────────────────────
INSERT INTO "teams" ("id", "name", "creator_id", "qr_code", "max_members")
VALUES ('t0a80101-0000-0000-0000-000000000001', 'CyberVanguard Squad', 'c0a80101-0000-0000-0000-000000000004', '7b2a6f81-99c2-4820-a6fe-f584e2079011', 4)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "team_members" ("team_id", "user_id", "role", "is_admin")
VALUES 
  ('t0a80101-0000-0000-0000-000000000001', 'c0a80101-0000-0000-0000-000000000004', 'Team Lead', true),
  ('t0a80101-0000-0000-0000-000000000001', 'c0a80101-0000-0000-0000-000000000005', 'AI Researcher', false)
ON CONFLICT ("team_id", "user_id") DO NOTHING;
