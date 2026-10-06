# SkillSync — Master Plan (Mini Project)

> React Native CLI · NestJS · Prisma · Supabase Postgres · Upstash Redis · Gemini · FCM · GitHub Actions · Render
> **Tech stack is frozen. This plan only changes scope, not tools.**

Read this first, then your own file:
`01_DATABASE.md` · `02_BACKEND.md` · `03_FRONTEND.md` · `04_DEVOPS.md`

---

## 1. What we are building

SkillSync is an Android app where students form hackathon teams.
A **student** registers for a hackathon, creates or joins a team, and gets explainable teammate matches.
An **organiser** creates hackathons, sees who registered, sees the formed squads, and sends announcements.

The end product is a **signed, working APK** installed on real phones. Not a demo reel, not a web wrapper.

## 2. Scope

### In
| Area | Included |
|---|---|
| Auth | Register (student / organiser), login, refresh rotation, logout, email OTP verify, biometric unlock |
| Student | Profile, skills (manual + AI extract with confirm), browse hackathons, register, create team, join by QR, invitations, teammate and team recommendations, notifications |
| Organiser | Hub, create/edit hackathon, registrant roster, squad roster, check-in toggle, push announcement |
| AI | Skill extraction from text, team requirement extraction from text, hybrid match scoring with explanation |
| Platform | FCM push, QR show/scan, offline cached reads, CI/CD, signed APK release |

### Out (cut on purpose)
Projects module (applications, project members), skill-gap analysis, admin web dashboard, profile photo upload and Storage buckets, audit logs, landing page, multi-device push, i18n, light theme.
If someone asks for one of these, the answer is "after the APK works".

## 3. Roles and ownership

| Member | Role | Owns |
|---|---|---|
| 1 | Database | `prisma/`, `supabase/`, `docs/db/`, seed, candidate-selection SQL |
| 2 | Backend | `apps/api/src/` except `modules/ai` and `modules/recommendations` |
| 3 | Frontend lead | `apps/mobile/` design system, navigation, auth, student module |
| 4 | DevOps + AI | `.github/`, Render/Firebase/Upstash setup, signing, `modules/ai`, `modules/recommendations`, organiser screens in `apps/mobile/src/features/organizer/` |

Member 4 is the only one with slack once the pipeline is green, which is why the organiser screens sit there. They are forms and lists built on Member 3's components.
If your repo layout already differs, keep it and map the ownership above onto your paths.

```
skillsync/
  apps/api/            NestJS + prisma/
  apps/mobile/         React Native CLI
  supabase/            SQL that Prisma cannot express
  docs/                db/, api/
  .github/workflows/
```

## 4. Architecture

```
[RN APK] --HTTPS--> [NestJS on Render] --> [Supabase Postgres]
                          |--> [Upstash Redis]   cache, rate limit, OTP, QR tokens
                          |--> [Gemini API]      server side only
                          '--> [Firebase Admin]  push via FCM
GitHub Actions: PR checks -> Render deploy hook on main -> signed APK on tag
```

## 5. Business rules (single source of truth)

1. Roles: `student`, `organizer`. Organiser sign-up requires `ORGANIZER_INVITE_CODE` (server env). No code, no organiser account.
2. A student can be in **at most one team per hackathon**. Enforced by a DB unique constraint, not just app code.
3. Creating or joining a team auto-registers the student for that hackathon (same transaction) if registration is still open.
4. Registration closes at `registration_deadline` or when organiser sets status to `closed`.
5. Team size is capped by `min(team.max_members, hackathon.max_team_size)`.
6. QR join token: 24h TTL in Redis, reusable until expiry or team full. Leader can rotate it, which kills the old one.
7. Invitations expire after 48h. Expiry is computed on read, no cron.
8. Only the team leader can invite, remove members, rotate QR, edit team.
9. Only the hackathon's organiser can edit it, see its roster, check people in, and announce.
10. AI never writes data on its own. It returns suggestions, the user confirms.
11. AI is optional at runtime. If Gemini fails, every screen still works with deterministic output.

## 6. Contracts and gates

No dates. Work moves when a gate opens.

| Gate | Opens when | Unblocks |
|---|---|---|
| A. Schema freeze | Migration applied, Prisma client generated, seed runs | Backend, AI module |
| B. Swagger live | `/docs` on Render lists all endpoints with example payloads | Frontend real calls |
| C. Design system published | Tokens, fonts and base components merged | All screens |
| D. First signed APK | CI builds a release APK that installs and logs in against Render | Everyone tests on devices |
| E. Release candidate | Section 8 checklist passes on two physical phones | Tag `v1.0.0` |

Until a gate opens, build against mocks. Do not wait idle.

Rules that keep merges clean:
- DB table and column names are the interface. Any change is a new migration file plus a team message the same day.
- Backend breaking an endpoint shape flags it before merging.
- Shared nav routes are owned by Member 3. Member 4 requests additions, does not edit them.

## 7. Screen inventory

| Group | Count | Screens |
|---|---|---|
| Shared | 6 | Splash, Login, Register, VerifyEmail, BiometricUnlock, Settings |
| Student | 13 | Home, HackathonList, HackathonDetail, MyTeams, CreateTeam, TeamDashboard, FindTeammates, ShowQR, ScanQR, Invitations, Notifications, Profile, EditProfile+Skills |
| Organiser | 5 | Hub, HackathonForm, HackathonManage (Roster / Squads / Announce tabs), Notifications, Profile |

About 24 screens. Details are in `03_FRONTEND.md`.

## 8. Definition of done: the APK

Run on **two physical Android phones with Play Services**. Emulators do not count for push.

**Student flow**
- [ ] Register, enter OTP, land on Home
- [ ] Enable biometric, force-close, reopen, unlock
- [ ] Paste bio, extract skills, confirm, skills saved
- [ ] Register for hackathon, create team, extract required skills from team description
- [ ] Show QR on phone A, scan on phone B, B joins, A gets push
- [ ] Leader invites a recommended teammate, invitee gets push, taps it, lands on Invitations, accepts
- [ ] Recommendation card shows breakdown bars, reasons, and an AI note (or none if Gemini is down)
- [ ] Airplane mode: banner appears, cached screens still render, reconnect refetches

**Organiser flow**
- [ ] Register with invite code, create hackathon
- [ ] Roster shows registrants, teamless filter works, check-in toggles
- [ ] Squads tab shows teams and members
- [ ] Announcement reaches all registrants as a push

**Release**
- [ ] APK is signed, installs from GitHub Release, no debug banner, no red screens
- [ ] First launch after server sleep shows a waking-server state instead of a failure

## 9. Risks

| Risk | Plan |
|---|---|
| Render free tier sleeps and cold start can take tens of seconds | Keep-alive ping on `/health`, longer first-request timeout, "waking server" UI, wake manually before any demo |
| Parallel 401s with rotating refresh tokens log users out | Single-flight refresh in the Axios interceptor (see frontend file) |
| Gemini slow, wrong model name, or quota hit | Model id in env, 8s timeout, deterministic fallback, whitelist output against `skills` table |
| FCM does not work on emulators | Two physical phones in the checklist |
| Last-slot team join race | Transaction plus unique constraint, tested with a concurrent join test |
| Upstash free limits | Check current limits before launch, cache sparingly, rate limit store only on auth and AI routes if needed |

## 10. Assumptions I made. Change them if wrong.

1. Recommendations score **users against a team's required skills**, not against a separate "project". Projects were merged into teams to keep this a mini project.
2. One FCM token per user (one device). Good enough for this scope.
3. No profile photos. Avatars are a square initial block in the theme.
4. Email OTP uses `OTP_DEV_MODE=true` by default (OTP printed to server logs and returned only in non-production). Real email can be added later through an HTTP email API.
5. Extra small libs beyond the blueprint, all within the same ecosystems: `@react-navigation/bottom-tabs`, `react-native-svg` (already required by `react-native-qrcode-svg`), `lucide-react-native`, `@react-native-community/datetimepicker`, `react-native-config`, TanStack persist packages.

## 11. Changes vs the old blueprint

| Old | New |
|---|---|
| 18 tables | 12 tables (see DB file) |
| Projects, applications, skill gap | Removed, team requirements replace them |
| `ai_recommendations` table | Redis cache only |
| Admin dashboard on Vercel | Removed, organiser module in the app instead |
| Weights 40/25/15/10/10 | 50/30/20 (coverage, complementary, experience) |
| `qr_code` column on teams | Redis token only |
| `gemini-1.5-flash` hardcoded | Model id from env, verify current name in AI Studio |
| Render cold start "~800ms" | Plan for tens of seconds on free tier |
