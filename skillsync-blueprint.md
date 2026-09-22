# SkillSync — Complete Technical Blueprint

> React Native CLI · NestJS · Supabase PostgreSQL · Redis · Gemini AI  
> 4-Member Team · College Competition · Production-Style Architecture

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack — Justified](#3-tech-stack--justified)
4. [Database Schema](#4-database-schema)
5. [Redis Design](#5-redis-design)
6. [REST API Design](#6-rest-api-design)
7. [AI Architecture](#7-ai-architecture)
8. [Mobile — Real Android Features](#8-mobile--real-android-features)
9. [Security Design](#9-security-design)
10. [Performance Engineering](#10-performance-engineering)
11. [CI/CD — GitHub Actions](#11-cicd--github-actions)
12. [Testing Strategy](#12-testing-strategy)
13. [5-Minute Demo Script](#13-5-minute-demo-script)
14. [Judging Impact Analysis](#14-judging-impact-analysis)

---

## 1. Project Overview

SkillSync is a student collaboration and team-building platform delivered as a **genuine React Native Android application** — not a WebView or PWA.

Students build professional profiles, add skills and projects, discover teammates, form hackathon teams, and receive AI-powered match recommendations with explainable scoring.

### Core Value Proposition

- Real mobile-first experience with native Android SDK integration
- Hybrid AI matching: deterministic scoring + Gemini NLP enrichment
- Production-grade backend with Redis caching and cloud PostgreSQL
- Hackathon team formation with QR-based joining and push notifications
- Biometric authentication, Android Keystore token storage, offline-aware architecture

### Team Allocation (4 Members)

| Member | Responsibility |
|--------|---------------|
| Member 1 — RN Lead | Auth, Biometric, Navigation, Profile, Discover screens |
| Member 2 — RN / UI | Teams, Hackathons, Notifications, Admin Dashboard |
| Member 3 — Backend Lead | Auth, Users, Projects, Teams APIs, Prisma migrations |
| Member 4 — AI + DevOps | Gemini integration, Matching algorithm, CI/CD, Redis, Monitoring |

### 6-Week Timeline

| Week | Focus |
|------|-------|
| 1 | Repo setup, DB schema, Auth API, Login/Register screens |
| 2 | Profile, Skills, Projects APIs + screens |
| 3 | Discover, Recommendations, AI layer |
| 4 | Teams, Invitations, QR joining, Push notifications |
| 5 | Admin dashboard, Performance polish, CI/CD |
| 6 | Testing, Demo preparation, Signed APK build |

---

## 2. System Architecture

### Deployment Diagram

```
  [React Native APK] ──── HTTPS ────► [NestJS on Render]
                                              │
                         ┌────────────────────┼────────────────────┐
                         ▼                    ▼                    ▼
                 [Supabase PG]            [Upstash Redis]     [Gemini API]
                         │
                         ▼
                [Supabase Storage]

  [Admin React App] ──────────────────► [Vercel]
  [Landing Page]    ──────────────────► [Vercel]

  GitHub ──► GitHub Actions ──► Render (backend auto-deploy)
                           ──► Vercel (admin auto-deploy)
                           ──► GitHub Releases (signed APK)
```

### Why Each Component Lives Where It Does

**React Native APK**
- Installed on an Android device. **Not "deployed" anywhere in the cloud.**
- Distributed via GitHub Releases / Firebase App Distribution.
- Communicates with the backend via HTTPS REST API only.
- The APK file is a static binary artefact, not a running server.

**NestJS on Render**
- Backend REST API server that **does** run in the cloud.
- Handles auth, business logic, DB queries, AI calls, push notifications.
- Environment variables stored in Render dashboard — never inside the APK.

**Supabase PostgreSQL**
- Managed PostgreSQL. No DB server to maintain or patch.
- Prisma ORM connects from NestJS via `DATABASE_URL` secret.

**Upstash Redis**
- Serverless Redis, free tier (10k commands/day).
- HTTP-compatible — works on any deployment target without persistent connections.

**Gemini API**
- Called from NestJS backend **only**.
- API key never touches React Native source code.

**Supabase Storage**
- Profile pictures, project images.
- Backend issues pre-signed URLs; APK uploads directly to the storage bucket.

**Vercel**
- Admin dashboard + landing page. Zero-config deploy, free tier.

**GitHub Actions**
- CI on every PR: lint, type-check, tests, build validation.
- CD on merge to `main`: trigger Render deploy hook.
- Separate workflow builds signed APK on release tag.

### Data Flow: Student Logs In

```
1. APK sends POST /auth/login { email, password }
2. NestJS verifies bcrypt hash in PostgreSQL
3. NestJS issues: access token (JWT, 15 min) + refresh token (UUID, 7 days)
4. Refresh token is SHA256-hashed and stored in refresh_tokens table
5. APK stores both tokens in Android Keystore via react-native-keychain
6. Subsequent requests include: Authorization: Bearer <access_token>
7. Biometric unlock re-hydrates token from Keystore — no new backend call
```

### APK Distribution Options

| Option | Method | Recommended For |
|--------|--------|----------------|
| A | Direct APK via USB / file share | Quickest fallback |
| B | GitHub Release asset | Standard for competition |
| C | Firebase App Distribution | Best UX for multiple judges |
| D | Vercel landing page with download link | Professional presentation |
| E | Google Play internal testing | Only if time and budget allow |

> **Key distinction:** Hosting the APK file = storing a binary somewhere downloadable. Running the backend = a Node.js process executing on Render's cloud servers. These are completely different concepts.

---

## 3. Tech Stack — Justified

### Mobile — React Native CLI + TypeScript

| Package | Justification |
|---------|--------------|
| `react-native` (CLI, not Expo) | Full native module access. Required for Android Keystore, BiometricPrompt, custom permissions, and production APK signing control. |
| `TypeScript` | Type safety, better IDE support, fewer runtime bugs across a 4-person team. |
| `@react-navigation/native-stack` | Uses actual Android Activity stack. Faster transitions than JS-based navigation. |
| `@tanstack/react-query` v5 | Server state: caching, background refetch, pagination, retry. Eliminates manual loading/error state. |
| `zustand` | Lightweight client state (auth, session, theme). Simpler than Redux for a small team. |
| `axios` | Interceptors for JWT attachment and silent token refresh on 401. |
| `react-hook-form` + `zod` | Form validation without re-renders per keystroke. Zod schemas shareable with backend DTOs. |
| `@shopify/flash-list` | High-performance lists via Fabric/JSI. Required for Discover screen (100+ cards). |
| `react-native-mmkv` | Synchronous C++ key-value storage. For non-sensitive cache: skills list, last-seen profiles. |
| `react-native-keychain` | Secure token storage using Android Keystore system. |
| `react-native-biometrics` | Wraps Android BiometricPrompt. OS handles biometric data — app never sees it. |
| `react-native-vision-camera` | Photo capture + QR frame processor. |
| `@react-native-firebase/messaging` | FCM push notifications. Background + foreground handling. |
| `react-native-permissions` | Unified permission request API. |

### Backend — NestJS + TypeScript

| Package | Justification |
|---------|--------------|
| `@nestjs/core` | Modular, opinionated framework. DI container, Guards, Pipes. Better team scaling than raw Express. |
| `prisma` + `@prisma/client` | Type-safe ORM. Schema-first. Migration management. Prisma Studio for DB debugging. |
| `@nestjs/jwt` + `passport-jwt` | JWT strategy with access + refresh token rotation. |
| `bcrypt` | Password hashing with salt. Never store plaintext. |
| `ioredis` | Redis client. Works with Upstash via TLS URL. |
| `@nestjs/throttler` | Rate limiting with Redis store. Per-IP and per-user limits. |
| `class-validator` + `class-transformer` | DTO validation with decorators via NestJS ValidationPipe. |
| `@google/generative-ai` | Gemini API SDK. Server-side only. |
| `firebase-admin` | Send push notifications via FCM from backend. |
| `multer` + `sharp` | File upload handling + image resizing before Supabase Storage upload. |

### Admin Dashboard — React + Vite + Tailwind

| Package | Justification |
|---------|--------------|
| `react` + `vite` | Fast dev server, instant HMR, optimized production build. |
| `@tanstack/react-query` | Consistent with mobile codebase. |
| `tailwindcss` + `shadcn/ui` | Rapid, consistent UI components. |
| `recharts` | Analytics: user growth, team formation rate, skill distribution charts. |
| `react-router-dom` v6 | Client-side routing. |

### Infrastructure

| Service | Role |
|---------|------|
| Supabase PostgreSQL 15 | Managed DB, free tier sufficient for competition scale |
| Upstash Redis | Serverless Redis, free tier (10k commands/day) |
| Google Gemini 1.5 Flash | Fast, cheap, sufficient for skill extraction + matching enrichment |
| GitHub Actions | CI/CD, free for public repos |
| Render | Backend hosting |
| Vercel | Admin + landing page hosting |

---

## 4. Database Schema

All tables include: `id UUID PK`, `created_at TIMESTAMP`, `updated_at TIMESTAMP`.

### users
```sql
id              UUID PRIMARY KEY
email           TEXT UNIQUE NOT NULL
password_hash   TEXT NOT NULL
role            ENUM('student','admin','organizer') DEFAULT 'student'
email_verified  BOOLEAN DEFAULT FALSE
is_active       BOOLEAN DEFAULT TRUE
deleted_at      TIMESTAMP NULL          -- soft delete
-- INDEX: email
```

### profiles
```sql
id              UUID PRIMARY KEY
user_id         UUID FK users.id UNIQUE  -- 1:1 with users
display_name    TEXT NOT NULL
bio             TEXT
college         TEXT
graduation_year INT
avatar_url      TEXT
github_url      TEXT
linkedin_url    TEXT
portfolio_url   TEXT
location        TEXT
looking_for     ENUM('teammate','project','both','not_looking')
preferred_roles TEXT[]                  -- ['Frontend','ML Engineer']
-- INDEX: user_id, looking_for
```

### skills
```sql
id       UUID PRIMARY KEY
name     TEXT UNIQUE NOT NULL          -- 'React Native', 'Python'
category TEXT                          -- 'Mobile', 'ML', 'Web'
-- INDEX: name, category
```

### user_skills
```sql
id        UUID PRIMARY KEY
user_id   UUID FK users.id
skill_id  UUID FK skills.id
level     ENUM('beginner','intermediate','advanced','expert')
UNIQUE(user_id, skill_id)
-- INDEX: user_id, skill_id
```

### user_availability
```sql
id          UUID PRIMARY KEY
user_id     UUID FK users.id UNIQUE
hours_week  INT
start_date  DATE
end_date    DATE NULL
timezone    TEXT
```

### projects
```sql
id           UUID PRIMARY KEY
creator_id   UUID FK users.id
title        TEXT NOT NULL
description  TEXT NOT NULL
status       ENUM('open','in_progress','completed','archived')
type         ENUM('hackathon','personal','research','startup')
max_members  INT DEFAULT 4
deleted_at   TIMESTAMP NULL
-- INDEX: creator_id, status, type
```

### project_requirements
```sql
id           UUID PRIMARY KEY
project_id   UUID FK projects.id
skill_id     UUID FK skills.id
is_required  BOOLEAN DEFAULT TRUE
UNIQUE(project_id, skill_id)
```

### project_members
```sql
id         UUID PRIMARY KEY
project_id UUID FK projects.id
user_id    UUID FK users.id
role       TEXT
joined_at  TIMESTAMP
UNIQUE(project_id, user_id)
```

### project_applications
```sql
id           UUID PRIMARY KEY
project_id   UUID FK projects.id
applicant_id UUID FK users.id
status       ENUM('pending','accepted','rejected')
message      TEXT
-- INDEX: project_id, applicant_id, status
```

### teams
```sql
id          UUID PRIMARY KEY
name        TEXT NOT NULL
project_id  UUID FK projects.id NULL
creator_id  UUID FK users.id
qr_code     TEXT UNIQUE              -- UUID used in QR for join
max_members INT DEFAULT 5
deleted_at  TIMESTAMP NULL
-- INDEX: creator_id, qr_code
```

### team_members
```sql
id        UUID PRIMARY KEY
team_id   UUID FK teams.id
user_id   UUID FK users.id
role      TEXT
is_admin  BOOLEAN DEFAULT FALSE
joined_at TIMESTAMP
UNIQUE(team_id, user_id)
```

### team_invitations
```sql
id          UUID PRIMARY KEY
team_id     UUID FK teams.id
inviter_id  UUID FK users.id
invitee_id  UUID FK users.id
status      ENUM('pending','accepted','declined','expired')
expires_at  TIMESTAMP
-- INDEX: invitee_id, status
```

### hackathons
```sql
id                    UUID PRIMARY KEY
title                 TEXT NOT NULL
organizer_id          UUID FK users.id
description           TEXT
start_date            TIMESTAMP
end_date              TIMESTAMP
registration_deadline TIMESTAMP
max_team_size         INT DEFAULT 4
is_active             BOOLEAN DEFAULT TRUE
```

### hackathon_participants
```sql
id            UUID PRIMARY KEY
hackathon_id  UUID FK hackathons.id
team_id       UUID FK teams.id NULL
user_id       UUID FK users.id
UNIQUE(hackathon_id, user_id)
```

### notifications
```sql
id       UUID PRIMARY KEY
user_id  UUID FK users.id
type     TEXT    -- 'team_invite','application_update','recommendation'
title    TEXT
body     TEXT
data     JSONB   -- arbitrary payload for deep linking
is_read  BOOLEAN DEFAULT FALSE
-- INDEX: user_id + is_read + created_at (composite)
```

### ai_recommendations
```sql
id                  UUID PRIMARY KEY
for_user_id         UUID FK users.id
recommended_user_id UUID FK users.id NULL
project_id          UUID FK projects.id NULL
score               FLOAT              -- 0.0 to 1.0
score_breakdown     JSONB              -- {"skillCoverage":0.8,"availability":1.0,...}
reasons             TEXT[]             -- human-readable explanation strings
generated_at        TIMESTAMP
expires_at          TIMESTAMP
-- INDEX: for_user_id + expires_at (composite)
```

### refresh_tokens
```sql
id          UUID PRIMARY KEY
user_id     UUID FK users.id
token_hash  TEXT UNIQUE    -- SHA256 of the actual token
expires_at  TIMESTAMP
revoked     BOOLEAN DEFAULT FALSE
-- INDEX: token_hash, user_id
```

### audit_logs
```sql
id          UUID PRIMARY KEY
user_id     UUID FK users.id NULL
action      TEXT    -- 'login','profile_update','team_join'
entity_type TEXT
entity_id   UUID NULL
ip_address  INET
user_agent  TEXT
metadata    JSONB
```

### Cascade Rules

| Parent deleted | Child behavior |
|---------------|---------------|
| `users` | `profiles`, `user_skills`, `user_availability` CASCADE DELETE |
| `projects` | `project_requirements`, `project_members`, `project_applications` CASCADE DELETE |
| `teams` | `team_members`, `team_invitations` CASCADE DELETE |
| `notifications` | No cascade; cleaned up by periodic job |

### Soft Delete Strategy

Apply `deleted_at` to: `users`, `projects`, `teams`.  
All queries filter with `WHERE deleted_at IS NULL`.  
Hard deletes only during GDPR/data-purge flows.

---

## 5. Redis Design

> Use Redis **only** where it provides measurable benefit. Every key below has a justification, TTL, and fallback.

### 1. Profile Cache

```
Key:        profile:{userId}
Value:      JSON of profile + skills array
TTL:        5 minutes
Invalidate: On PATCH /users/me → DEL profile:{userId}
Fallback:   Cache miss → query Supabase → re-populate
Why:        Discover screen loads 20 profiles per page. Cache eliminates
            20 DB queries per page for recently viewed profiles.
```

### 2. Skills List Cache

```
Key:        skills:all
Value:      JSON array of all skill objects
TTL:        1 hour
Invalidate: On admin POST/DELETE /skills
Fallback:   Cache miss → SELECT * FROM skills → re-populate
Why:        Referenced on every profile edit, filter, and search.
            Changes at most a few times per week.
```

### 3. Recommendation Cache

```
Key:        recommendations:{userId}
Value:      JSON array of top-10 recommendations with score_breakdown
TTL:        30 minutes
Invalidate: When user updates profile or skills
Fallback:   Cache miss → run matching algorithm + Gemini call → cache result
Why:        Gemini call + scoring across 500 users = 2–4 seconds.
            Cache makes GET /recommendations return in < 100ms.
```

### 4. Rate Limiting

```
Key:        throttle:{ip}:{endpoint}
Value:      Request count
TTL:        60-second window
Managed by: @nestjs/throttler with Redis store

Limits:
  POST /auth/login           → 5 req/min per IP
  POST /auth/register        → 3 req/min per IP
  POST /ai/analyze-project   → 10 req/min per user
  General API                → 100 req/min per authenticated user
```

### 5. OTP / Email Verification

```
Key:        otp:{email}
Value:      Hashed OTP code
TTL:        10 minutes
Invalidate: DEL otp:{email} on successful verification
Why:        OTP must expire. Redis TTL handles this without a cron job.
```

### 6. QR Join Token

```
Key:        qr_join:{token}
Value:      JSON { teamId, createdBy, expiresAt }
TTL:        24 hours (or until used)
Invalidate: DEL qr_join:{token} on successful join
Why:        Ephemeral — no need for a DB table. TTL = automatic expiry.
```

### What NOT to Cache

- ❌ Passwords or password hashes
- ❌ Refresh tokens (in PostgreSQL for revocation control)
- ❌ Notification payloads (must be reliably delivered via PG + FCM)
- ❌ Audit logs (must be persistent)
- ❌ Sensitive personal data

---

## 6. REST API Design

All endpoints use HTTPS. Authenticated endpoints require:
```
Authorization: Bearer <access_token>
```

**Standard error response:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

**Standard paginated response:**
```json
{
  "data": [...],
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}
```

### Auth

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/auth/register` | No | Rate limit: 3/min per IP |
| POST | `/auth/login` | No | Rate limit: 5/min per IP |
| POST | `/auth/refresh` | No | Rotates token pair; old token revoked |
| POST | `/auth/logout` | Yes | Revokes refresh token |
| POST | `/auth/verify-email` | No | Validates OTP from Redis |
| POST | `/auth/resend-verification` | No | Rate limit: 2/min per email |

### Users / Profiles

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/users/me` | Yes | Full profile + skills + availability |
| PATCH | `/users/me` | Yes | Invalidates profile Redis cache |
| GET | `/users/:id/profile` | Yes | Public view, served from Redis cache |

### Skills

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/skills` | Optional | Cached in Redis 1h. Query: `?category=&search=` |
| POST | `/users/me/skills` | Yes | Body: `{ skillId, level }` |
| DELETE | `/users/me/skills/:skillId` | Yes | Invalidates profile + recommendation cache |

### Projects

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/projects` | Yes | Body: `{ title, description, type, maxMembers, requiredSkillIds[] }` |
| GET | `/projects` | Yes | Paginated. Query: `?status=&type=&skills=&page=&limit=` |
| GET | `/projects/:id` | Yes | Project + members + requirements + application status |
| PATCH | `/projects/:id` | Yes | Creator only |
| DELETE | `/projects/:id` | Yes | Soft delete. Creator or admin |
| POST | `/projects/:id/apply` | Yes | Cannot apply to own project |
| GET | `/projects/:id/applications` | Yes | Creator only. Paginated |
| PATCH | `/projects/:id/applications/:appId` | Yes | Creator only. `{ status: 'accepted'\|'rejected' }` |
| POST | `/projects/:id/invite` | Yes | Project member only |

### Teams

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/teams` | Yes | Generates `qr_code` UUID |
| GET | `/teams` | Yes | Query: `?hackathonId=&page=` |
| GET | `/teams/:id` | Yes | Members + hackathon link |
| POST | `/teams/:id/invite` | Yes | Team admin only; sends push notification |
| POST | `/teams/:id/join` | Yes | Body: `{ qrToken? }`. Validates Redis token |
| PATCH | `/teams/invitations/:id` | Yes | Invitee only. `{ action: 'accept'\|'decline' }` |
| GET | `/teams/invitations/me` | Yes | Pending invitations for current user |

### AI

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/ai/analyze-project` | Yes | Rate limit: 10/min per user. Calls Gemini. |
| POST | `/ai/skill-gap` | Yes | Deterministic + Gemini enrichment |
| GET | `/recommendations` | Yes | Query: `?projectId=`. Served from Redis cache. |

### Hackathons

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/hackathons` | Optional | Query: `?active=true&page=` |
| GET | `/hackathons/:id` | Optional | |
| POST | `/hackathons/:id/register` | Yes | Before deadline; checks team size |

### Notifications

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/notifications` | Yes | Query: `?unread=true&page=&limit=` |
| PATCH | `/notifications/:id/read` | Yes | |
| PATCH | `/notifications/read-all` | Yes | |

### Admin (`admin` role required)

| Method | Endpoint |
|--------|----------|
| GET | `/admin/users?page=&search=` |
| PATCH | `/admin/users/:id/status` |
| GET | `/admin/projects?status=` |
| GET | `/admin/hackathons` |
| POST | `/admin/hackathons` |
| GET | `/admin/analytics/summary` |
| GET | `/admin/audit-logs?userId=&action=&page=` |

---

## 7. AI Architecture

> The AI layer is **not** a chatbot. It is a structured extraction + scoring system. Gemini handles NLP; a deterministic algorithm handles matching.

### Feature 1 — Skill Extraction from Profile Text

**Trigger:** User submits bio or project description.

**Gemini prompt:**
```
System: "You are a technical skill extractor. Extract skills from the text.
         Return ONLY a JSON array: [{name: string, category: string}].
         No explanation, no markdown, no preamble."
User: "I built a REST API with Node.js, deployed on AWS EC2 with Docker,
       and added a React TypeScript frontend..."
```

**Output parsed by backend:**
```json
[
  { "name": "Node.js", "category": "Backend" },
  { "name": "Docker", "category": "DevOps" },
  { "name": "React", "category": "Frontend" },
  { "name": "TypeScript", "category": "Language" }
]
```

Backend matches names against `skills` table and **suggests** them to the user. User confirms before skills are added.

---

### Feature 2 — Project Requirement Extraction

**Trigger:** `POST /ai/analyze-project` with project description.

**Gemini prompt:**
```
System: "Extract technical requirements from a project description.
         Return ONLY JSON:
         {
           requiredSkills: string[],
           preferredSkills: string[],
           roles: string[],
           difficulty: 'beginner'|'intermediate'|'advanced',
           estimatedWeeklyHours: number
         }"
```

**Output:**
```json
{
  "requiredSkills": ["WebSockets", "Node.js", "React", "TypeScript"],
  "preferredSkills": ["Redis", "Docker"],
  "roles": ["Frontend Engineer", "Backend Engineer", "DevOps"],
  "difficulty": "advanced",
  "estimatedWeeklyHours": 15
}
```

Backend maps skill names to IDs and creates `project_requirements` rows.

---

### Feature 3 — Teammate Recommendation (Hybrid Algorithm)

**Do NOT rely on LLM alone.** Deterministic scoring first; Gemini enrichment on top.

#### Step 1 — Filter Candidates (SQL)
- Exclude existing team members
- Exclude `looking_for = 'not_looking'`

#### Step 2 — Score Each Candidate (Deterministic)

| Component | Weight | Formula |
|-----------|--------|---------|
| Skill coverage | 40% | `(candidate skills ∩ required skills) / required skills` |
| Complementary skills | 25% | Candidate covers gaps not filled by existing team |
| Availability | 15% | `min(candidate hours/week ÷ project hours/week, 1.0)` |
| Project interest | 10% | `(preferredRoles ∩ neededRoles) / neededRoles` |
| Experience | 10% | Weighted avg of skill levels (beginner=0.25 → expert=1.0) |

```
final_score = Σ(weight × component_score)   →   0.0 to 1.0
```

> Weights are configurable. These are design defaults, not scientifically derived values. State this clearly to judges.

#### Step 3 — Gemini Enrichment (Top 20 Candidates Only)

Batch call: send top-20 candidate profiles + project description.  
Prompt asks for one qualitative sentence per candidate.  
Parsed and appended to `score_breakdown.geminiReason`.

#### Step 4 — Store and Cache

Save to `ai_recommendations` table. Cache in Redis for 30 minutes.

#### Explainability (shown in UI)

`score_breakdown` stored as JSONB:
```json
{
  "skillCoverage": 0.8,
  "complementary": 0.6,
  "availability": 1.0,
  "projectInterest": 0.5,
  "experience": 0.7,
  "geminiReason": "Strong backend skills with React Native experience matches all core project needs."
}
```

**UI renders:**
```
✅ Covers 80% of required skills
✅ Fully available (15 h/week)
✅ Interested in Backend roles
⚡ AI: "Strong backend skills with React Native experience matches all core project needs."
```

---

### Feature 4 — Skill Gap Analysis

**Trigger:** `POST /ai/skill-gap` with `projectId`.

**Step 1 — Deterministic:**
```
missing = project_required_skills − user_skills
```

**Step 2 — Gemini enrichment:**
```
Input: "User is missing: [Spring Boot, Docker]. Suggest 2-3 specific
        learning resources or approaches for each."
```

**Response:**
```json
{
  "missingSkills": [
    { "name": "Spring Boot", "category": "Backend" },
    { "name": "Docker", "category": "DevOps" }
  ],
  "learningRecommendations": [
    { "skill": "Spring Boot", "suggestions": ["Spring official guides", "Baeldung.com"] },
    { "skill": "Docker", "suggestions": ["Docker Getting Started docs", "Play with Docker"] }
  ]
}
```

### AI Cost Management

- Rate limit AI endpoints: 10 calls/min per user
- Cache recommendations 30 min — avoid redundant Gemini calls
- Batch Gemini enrichment (top-20 in one request, not 20 individual calls)
- Use `gemini-1.5-flash` (not `pro`) for latency and cost
- Monitor usage in Google AI Studio console

---

## 8. Mobile — Real Android Features

### 1. Biometric Authentication

**Library:** `react-native-biometrics`

**How it works:**
1. On first login success, store tokens in Android Keystore via `react-native-keychain`
2. Create biometric key pair: `RNBiometrics.createKeys()`
3. On subsequent app opens, show `BiometricPrompt`
4. On success, retrieve tokens from Keychain and hydrate auth state
5. **Biometric never sends data to the backend.** It only gates local token access.

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.USE_BIOMETRIC"/>
<uses-permission android:name="android.permission.USE_FINGERPRINT"/>
```

**Fallback:** If biometric not enrolled → show PIN/password. App fully functional without biometric.

**What is NOT done:**
- ❌ Raw fingerprint data never read or stored
- ❌ Biometric not used for network authentication (JWT handles that)

---

### 2. Camera

**Library:** `react-native-vision-camera`

**Use cases:** Profile photo, project cover image, QR scanning via frame processor.

```xml
<uses-permission android:name="android.permission.CAMERA"/>
```

Permission requested at point of use only. If denied, offer gallery upload alternative.

---

### 3. QR Scanner

**QR payload:** `skillsync://join/team/{token}`

**Join flow:**
```
Team creator → "Share QR" → backend returns qr_code UUID from Redis/DB
→ react-native-qrcode-svg renders QR
→ Joining student scans → app calls POST /teams/:id/join { qrToken }
→ Backend validates token in Redis → adds user to team
```

Also used for hackathon event check-in and project deep-link sharing.

---

### 4. Push Notifications (FCM)

**Setup:** `@react-native-firebase/messaging` + `google-services.json` in `android/app/`

**FCM Token flow:**
1. On app launch: `messaging().getToken()`
2. POST to `/users/me/fcm-token` → stored in `users` table
3. Backend uses `firebase-admin` to send targeted notifications

**Notification routing:**

| Type | Deep link target |
|------|-----------------|
| `team_invite` | `/teams/invitations` |
| `application_accepted` | `/projects/:id` |
| `recommendation_new` | `/recommendations` |
| `hackathon_announcement` | `/hackathons/:id` |

```xml
<!-- Android 13+ runtime permission -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

---

### 5. Secure Storage

| Data | Storage | Why |
|------|---------|-----|
| `ACCESS_TOKEN` | `react-native-keychain` → Android Keystore | Encrypted, hardware-backed |
| `REFRESH_TOKEN` | `react-native-keychain` → Android Keystore | Encrypted, hardware-backed |
| `BIOMETRIC_FLAG` | `react-native-mmkv` | Non-sensitive boolean |
| Skills list cache | `react-native-mmkv` | Fast, synchronous |
| User preferences | `react-native-mmkv` | Non-sensitive settings |

**Never stored in the app:**
- ❌ Passwords
- ❌ Gemini API key
- ❌ Supabase service role key
- ❌ Database credentials

---

### 6. Android Permissions — Full List

| Permission | Why Needed | When Requested | Dangerous? | On Denial |
|-----------|-----------|---------------|-----------|----------|
| `INTERNET` | All API calls | Auto (no prompt) | No | App non-functional |
| `USE_BIOMETRIC` | BiometricPrompt | First biometric setup | No | Skip biometric feature |
| `USE_FINGERPRINT` | Fingerprint compat | Same as above | No | Skip biometric feature |
| `CAMERA` | Photo + QR scan | On tap camera button | Yes | Offer gallery upload |
| `READ_MEDIA_IMAGES` (API 33+) | Gallery photo picker | On tap gallery | Yes | Show settings instruction |
| `POST_NOTIFICATIONS` (API 33+) | FCM push | On first launch | Yes | App works; no push alerts |
| `VIBRATE` | Notification feedback | Implicit | No | Silent notifications |

**Not requested:**
- ❌ `ACCESS_FINE_LOCATION` (no location feature)
- ❌ `READ_CONTACTS`
- ❌ `RECORD_AUDIO`
- ❌ `BLUETOOTH`

> **Rule:** Only request permissions for which there is a clear, visible user-facing feature.

---

### 7. Offline / Network Resilience

**Works offline (MMKV cached):**
- ✅ View previously loaded profile
- ✅ View cached skills list
- ✅ View cached recommendations
- ✅ Read already-loaded notifications

**Requires internet:**
- ❌ Login / Registration
- ❌ Discover (real-time search)
- ❌ Submit applications / invitations
- ❌ AI analysis

**Implementation:**
- `@react-native-community/netinfo` for connectivity detection
- Offline: persistent banner shown
- Reconnect: TanStack Query automatically refetches stale data
- Axios timeout: 10 seconds → retry UI on timeout
- 401 response: silent token refresh via interceptor → retry original request

---

### 8. Screen Performance Targets

| Screen | First Render | API Calls | Payload | Cache Strategy |
|--------|-------------|-----------|---------|---------------|
| Splash → Home (warm) | < 1.0s | 0 | — | MMKV session |
| Splash → Home (cold) | < 2.5s | 1 GET /me | < 5 KB | Write to MMKV |
| Discover | < 1.5s | 1 paginated | < 20 KB | TanStack cache |
| Profile view | < 0.8s | 1 (cached) | < 8 KB | Redis + TanStack |
| Recommendations | < 1.0s | 1 (cached) | < 15 KB | Redis 30 min TTL |
| Notifications | < 0.8s | 1 paginated | < 10 KB | TanStack |

---

## 9. Security Design

### JWT Authentication

```
Access token:   JWT signed with JWT_SECRET | TTL: 15 minutes
Refresh token:  UUID stored as SHA256 hash in refresh_tokens table | TTL: 7 days
Rotation:       Every POST /auth/refresh issues new pair and revokes old token
```

**JWT payload:** `{ sub: userId, role: 'student', iat, exp }`

### Password Security

- `bcrypt` with `saltRounds = 12`
- Minimum: 8 chars, 1 uppercase, 1 number
- Validated client-side (Zod) and server-side (class-validator)
- Never logged, never returned in API responses

### RBAC

```
Roles: student | admin | organizer

@Roles('admin') guard → /admin/* routes
Role in JWT payload + verified in DB on admin actions
```

### API Security Checklist

- ✅ HTTPS only (Render enforces SSL)
- ✅ CORS: specific origins only (not `*` in production)
- ✅ Helmet middleware: secure HTTP headers
- ✅ Request body size limit: 10 MB
- ✅ All DTOs validated with `class-validator` (whitelist + strip unknown fields)
- ✅ Prisma parameterized queries: SQL injection impossible
- ✅ File uploads: MIME type validated with `file-type` library (not just Content-Type header)
- ✅ Image max size: 5 MB; resized with `sharp` before storage

### Secrets Management

**Environment variables only — never in source code:**

| Secret | Where Stored |
|--------|-------------|
| `DATABASE_URL` | Render Environment Variables |
| `JWT_SECRET` | Render Environment Variables |
| `REDIS_URL` | Render Environment Variables |
| `GEMINI_API_KEY` | Render Environment Variables |
| `FIREBASE_SERVICE_ACCOUNT` | Render Environment Variables (JSON stringified) |
| `SUPABASE_SERVICE_ROLE_KEY` | Render Environment Variables |

**In React Native:** Zero backend secrets. Only `API_BASE_URL`.

### Audit Logging

Actions written to `audit_logs`:
- `auth/login` (success + failure)
- `profile_update`
- `team_join` / `team_leave`
- `application_accept` / `application_reject`
- All admin actions

---

## 10. Performance Engineering

### Performance Budget

| Metric | Target |
|--------|--------|
| Cold start → first meaningful frame | < 2.5s |
| Warm start → interactive | < 1.0s |
| Discover → first cards | < 1.5s |
| Navigation between screens | < 300ms |
| `GET /users/me` (cache hit) | < 80ms |
| `GET /recommendations` (cache hit) | < 100ms |
| `POST /ai/analyze-project` | < 4,000ms (show spinner) |
| `POST /auth/login` | < 300ms |

### Diagnosing Slowness

```
App feels slow
      │
      ├── Only on first open?
      │       YES → Cold start: Hermes JIT, bundle size, splash blocking
      │       NO  → Continue ↓
      │
      ├── Specific screen or all navigation?
      │       All navigation → JS thread blocking, large re-renders
      │       Specific screen → API or render issue on that screen
      │
      ├── Check Flipper Network tab
      │       API call > 500ms?
      │       YES → Backend issue ↓
      │       NO  → Rendering issue → check React DevTools re-render count
      │
      ├── Check Render dashboard logs
      │       First request after idle?
      │       YES → Render free-tier cold start (~800ms) → warm server before demo
      │       NO  → Continue ↓
      │
      ├── Check DB query
      │       EXPLAIN ANALYZE in Supabase SQL editor
      │       Missing index? → Add index
      │       Connection pool exhausted? → Add pooling params to DATABASE_URL
      │
      └── Check Redis
              Cache key correct? TTL set? ioredis connection pooled?
```

### Render Cold Start Mitigation

Render free tier spins down after 15 minutes of inactivity.

- **Option A:** Upgrade to Render Starter ($7/mo) — always-on
- **Option B:** Cron job pings `GET /health` every 14 minutes
- **Option C:** Show skeleton UI while cold start resolves — users perceive as data loading

**For demo:** Pre-warm the server 5 minutes before presenting.

### React Native Performance Techniques

- **Hermes engine** enabled (default RN 0.70+): ~40% faster startup vs JSC
- **FlashList** over FlatList for any list > 50 items
- **React.memo** on `StudentCard`, `SkillBadge`, `NotificationItem`
- **useCallback** for `renderItem` and event handlers in lists
- **TanStack Query:** `staleTime: 60_000`, `refetchOnWindowFocus: false`
- **FastImage** (`react-native-fast-image`) for cached network images
- Thumbnails 200×200px WebP in lists; full res only on detail screens
- Compress uploads with `react-native-compressor` before sending
- Lazy-load non-critical screens (Settings, Help)

**Avoid:**
- ❌ Anonymous functions in JSX props (new reference per render)
- ❌ Large objects in `useState`
- ❌ Inline styles in list items
- ❌ `AsyncStorage` for large data (use MMKV)

---

## 11. CI/CD — GitHub Actions

### Branch Strategy

```
main          ← Production. Protected. PRs only. 1 required review.
develop       ← Integration. Protected. CI required.
feature/*     ← All feature work
fix/*         ← Bug fixes
hotfix/*      ← Emergency production fixes
chore/*       ← Tooling, deps, cleanup
docs/*        ← Documentation only
```

**Merge flow:**
```
feature branch → PR → CI passes → code review → develop
develop (weekly) → PR → full test → main → production deploy
```

### Workflow 1 — Mobile PR Checks

**Trigger:** `pull_request` to `develop` or `main`

```yaml
jobs:
  lint-and-typecheck:
    - npm ci
    - npx tsc --noEmit
    - npx eslint . --ext .ts,.tsx

  unit-tests:
    - npm ci
    - npm test -- --ci --coverage

  android-build-check:
    - uses: actions/setup-java@v4 (java 17)
    - npm ci
    - cd android && ./gradlew assembleDebug
```

### Workflow 2 — Backend PR Checks

**Trigger:** `pull_request`

```yaml
services:
  postgres: image: postgres:15
  redis: image: redis:7

jobs:
  lint-test-build:
    - npm ci
    - npx tsc --noEmit
    - npx eslint .
    - prisma migrate deploy (test DB)
    - npm test
```

### Workflow 3 — Backend CD (Deploy to Render)

**Trigger:** `push` to `main`

```yaml
jobs:
  deploy:
    - curl -X POST "${{ secrets.RENDER_DEPLOY_HOOK_URL }}"
```

### Workflow 4 — Signed APK Release Build

**Trigger:** Tag push matching `v*.*.*`

```yaml
jobs:
  build-apk:
    - setup-java (17)
    - npm ci
    - cd android && ./gradlew assembleRelease
      (env: KEYSTORE, KEY_ALIAS, KEY_PASSWORD, STORE_PASSWORD from secrets)
    - Upload APK to GitHub Release via softprops/action-gh-release
```

### Workflow 5 — Admin Dashboard

Vercel auto-deploys on push to `main` via GitHub integration. No workflow file needed.

### Required GitHub Secrets

```
RENDER_DEPLOY_HOOK_URL
ANDROID_KEYSTORE_BASE64
ANDROID_KEY_ALIAS
ANDROID_KEY_PASSWORD
ANDROID_STORE_PASSWORD
```

---

## 12. Testing Strategy

### Mobile (Jest + React Native Testing Library)

**Unit tests — pure logic:**
```
src/utils/__tests__/
  matchingScore.test.ts     ← Score calculation determinism
  tokenUtils.test.ts        ← Token parsing, expiry checks
```

**Component tests:**
```
StudentCard renders name, skills, score badge
SkillBadge renders correct level color
NotificationItem shows unread indicator
```

**Screen tests:**
```
LoginScreen:
  ✓ Shows validation errors on empty submit
  ✓ Shows loading state during API call
  ✓ Navigates to Home on success
  ✓ Shows error toast on wrong credentials

ProfileEditScreen:
  ✓ Prepopulates form fields from stored user data
  ✓ Skill suggestion chips appear after bio input
```

### Backend (Jest + Supertest)

**Service unit tests:**
```
auth.service.spec.ts:
  ✓ register() hashes password with bcrypt
  ✓ login() returns tokens on valid credentials
  ✓ login() throws UnauthorizedException on wrong password
  ✓ refresh() rotates token and revokes old one

recommendations.service.spec.ts:
  ✓ Score 0.0–1.0 range enforced
  ✓ Excludes existing team members
  ✓ Returns cached result on Redis hit
```

**Integration tests (controller + test DB):**

| Endpoint | Tested scenarios |
|----------|-----------------|
| POST /auth/register | 201 valid, 400 duplicate email, 400 bad email, 429 rate limit |
| POST /auth/login | 200 with tokens, 401 wrong password, 429 after 5 attempts |
| GET /users/me | 200 with profile, 401 no token, 401 expired token |
| POST /projects/:id/apply | 201 first apply, 409 duplicate, 403 creator applying |
| POST /ai/analyze-project | 200 structured output, 400 empty description (Gemini mocked) |

### E2E Critical Flows (Manual Checklist)

Run before every demo:

- [ ] Full onboarding: register → verify email → complete profile → add skills
- [ ] AI skill extraction from bio text
- [ ] AI project requirement analysis
- [ ] Skill gap report for a project
- [ ] Create project → view recommendations → invite teammate
- [ ] Teammate receives push notification → accepts invitation
- [ ] Team dashboard shows both members
- [ ] QR join: show QR on device A → scan on device B → join succeeds
- [ ] Biometric: login → enable biometric → close app → reopen → biometric unlock
- [ ] Offline: load data online → airplane mode → offline banner → cached data visible → reconnect → refetch

---

## 13. 5-Minute Demo Script

### Pre-Demo Checklist

- [ ] Pre-warm Render backend (open admin dashboard 5 min before)
- [ ] 2 Android devices charged and connected to internet
- [ ] Admin dashboard open on laptop
- [ ] Supabase table view open in another tab
- [ ] Render logs open in another tab

---

### [0:00] — Hook

> *"SkillSync solves a real problem every hackathon team faces: finding the right teammates. This is a production-grade Android application — not a web app wrapped in an APK — with a real backend on Render, PostgreSQL on Supabase, Redis caching, and an AI matching engine powered by Gemini."*

---

### [0:30] — Login + Biometric

> *"Student A logs in with email and password. Tokens are stored in the Android Keystore — not in plain storage."*

→ Enable biometric in Settings → Close app completely → Reopen

> *"Android BiometricPrompt handles authentication. The app never reads fingerprint data. It only unlocks the locally stored access token."*

---

### [1:00] — Profile + AI Skill Extraction

→ Paste project description into bio.  
→ Tap "Extract Skills".

> *"Our backend sends this to Gemini with a strict JSON-only prompt. In under 2 seconds: Node.js, Docker, React, TypeScript, PostgreSQL. Student A confirms and adds them."*

---

### [1:45] — Project Creation + AI Requirement Analysis

→ Create project with description.  
→ Tap "Analyze requirements".

> *"Gemini extracts required skills and roles. Stored in PostgreSQL via Prisma ORM."*

---

### [2:15] — Recommendations + Explainable Scoring

→ Open Recommendations screen. Show Student B's card.

> *"Not just an LLM guess. Weighted scoring: 40% skill coverage, 25% complementary skills, 15% availability. Every recommendation explains itself."*

→ Pull-to-refresh to show Redis cache speed.

---

### [3:00] — Team Creation + QR Join + Push Notification

→ Student A creates team. Show QR code.  
→ Student B scans QR on second device.

> *"QR token validated in Redis. Student B joins. Now Student A sends an invitation..."*

→ Send invitation. Push notification appears on Student B's device.

> *"Firebase Cloud Messaging — a real push notification. Tap it → lands directly on the invitation screen. Accept → team dashboard updates."*

---

### [3:45] — Offline Resilience

→ Enable airplane mode on Student A.

> *"Offline banner appears. Profile and cached data still visible via MMKV. Reconnect — TanStack Query refetches automatically."*

---

### [4:15] — Admin Dashboard + Backend Proof

→ Show KPI cards, student table, audit logs.  
→ Show Render backend logs.  
→ Show Supabase table rows.  
→ Show Upstash Redis cache hit rate.

---

### [4:45] — CI/CD + APK Distribution

→ Show GitHub Actions runs.  
→ Show GitHub Release with signed APK asset.

> *"Every PR triggers TypeScript check, ESLint, Jest tests, and an Android debug build. On release, a signed APK is built automatically."*

---

### [5:00] — Close

> *"SkillSync: real Android app, real backend, real AI, real cloud infrastructure. A product you could submit to the Play Store today."*

---

### Prepared Answers to Judge Questions

**Q: Why not Expo?**  
A: Expo limits native module access. We needed Android Keystore for token security and BiometricPrompt for native fingerprint auth. React Native CLI gives full control.

**Q: What does the AI actually do?**  
A: Two things: structured extraction (Gemini parses text into strict JSON) and scoring enrichment (qualitative context on top of a deterministic algorithm). The match score itself is math, not a black box.

**Q: How is this different from LinkedIn?**  
A: LinkedIn is a professional network. SkillSync is focused on active team formation — with AI skill-gap analysis, QR-based team joining, and a scoring algorithm that considers complementary skills and availability, not just profile completeness.

**Q: Could this scale?**  
A: Stateless NestJS is horizontally scalable on Render. Redis reduces DB load via caching. Supabase PostgreSQL handles millions of rows. AI calls are rate-limited and cached. The architecture handles real production load.

---

## 14. Judging Impact Analysis

### Scoring Against Common Competition Criteria

| Criterion | Score | Evidence |
|-----------|-------|----------|
| Innovation | 8/10 | Explainable AI teammate matching with skill-gap analysis is uncommon in student projects |
| Real-world problem | 9/10 | Hackathon team formation is a genuine pain point for every CS student. High relatability |
| Technical complexity | 9/10 | JWT + biometric + FCM + Redis + Prisma + NestJS + Gemini + CI/CD. Most teams skip half of this |
| AI usage | 8/10 | Hybrid algorithm: deterministic scoring + Gemini NLP. Explainable output. Not just a chat wrapper |
| Mobile development | 10/10 | React Native CLI, BiometricPrompt, Android Keystore, FCM, QR, VisionCamera. Real Android SDK |
| Security | 9/10 | bcrypt, JWT rotation, Android Keystore, rate limiting, no secrets in APK, RBAC, audit logs |
| Scalability | 8/10 | Stateless NestJS, Redis caching, Supabase pooling, indexed schema |
| UX / UI | 7/10 | Skeleton loaders, offline states, push notifications, FlashList. Professional feel |
| Deployment | 9/10 | Backend on Render, admin on Vercel, DB on Supabase, APK via GitHub Releases, CI/CD complete |
| Social / educational impact | 8/10 | Helps students find teams for learning projects, surface skill gaps, connect across colleges |
| Feasibility | 8/10 | Proven tech stack. Free tiers cover competition scale. Tight but achievable in 6 weeks |
| Demo quality | 9/10 | Scripted 5-min flow, 2 devices, live notifications, admin dashboard, Redis stats, CI/CD shown |

### Genuine Weaknesses (Be Honest if Asked)

| Weakness | Mitigation |
|---------|-----------|
| Gemini latency 2–4s on first call | Show spinner with progress text. Pre-generate recommendations on profile save. |
| Render free-tier cold start (~800ms) | Warm server before demo. Upgrade to Starter tier if budget allows. |
| Scoring weights (40/25/15/10/10) are assumptions, not ML-derived | "These are configurable. In production they would be tuned with user feedback data." |
| Push notifications require physical devices with Play Services | Use 2 real Android phones for demo. Not emulators. |
| No profile photo moderation | "Future feature: admin flagging + auto-moderation via Vision API." |

### What Makes This Stand Out

**Typical college competition project:**
- React web app + basic CRUD + one ChatGPT API call + Vercel deploy
- No auth security, no token refresh, no rate limiting
- "Mobile" version is Expo WebView
- No caching, no CI/CD
- Demo is clicking through a web app

**SkillSync delivers:**
- Actual Android SDK (BiometricPrompt, Android Keystore, FCM, QR, VisionCamera)
- Explainable AI with a real scoring algorithm — not just prompt engineering
- JWT rotation, RBAC, audit logs, rate limiting
- Redis caching demonstrable live during demo
- GitHub Actions CI/CD with a signed APK release artifact
- Admin dashboard with real-time analytics
- QR team joining with Redis token management

**The key message to judges: "This is how real apps are built. Not a prototype."**

---

*SkillSync Technical Blueprint — Generated for competition preparation.*  
*Stack: React Native CLI · NestJS · Supabase · Upstash Redis · Gemini 1.5 Flash · GitHub Actions · Render · Vercel*
