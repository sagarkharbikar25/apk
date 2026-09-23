# SkillSync — Member 2: Backend (NestJS)

> Branch: `feature/backend-api`
> Owns: `src/` (NestJS app), `.github/workflows/`
> Do not edit files outside these paths — that's how we keep merges clean.

You're the critical path. If you fall behind, both frontend members stall.
Get auth working by day 3 of week 1 no matter what — everything else waits on it.

## Week 1 — Auth
- [x] NestJS project scaffold, connect Prisma client to DB member's schema
- [x] `POST /auth/register`, `/auth/login` (bcrypt), rate limit 5/3 per min per IP
- [x] JWT access (15min) + refresh (7d, SHA256-hashed in `refresh_tokens`)
- [x] `POST /auth/refresh` — rotates pair, revokes old token
- [x] `POST /auth/verify-email` via Redis OTP
- [x] Publish OpenAPI/Swagger so frontend can code against real contracts early

## Week 2 — Core CRUD
- [x] `GET/PATCH /users/me`, `GET /users/:id/profile` (Redis-cached)
- [x] `GET /skills`, `POST/DELETE /users/me/skills` (invalidate profile +
      recommendation cache on skill change)
- [x] `POST/GET/PATCH/DELETE /projects`, apply/invite/applications endpoints

## Week 3 — AI Layer
- [x] Gemini skill extraction (`POST /ai/analyze-project` variant for bio text)
- [x] Gemini project requirement extraction
- [x] Deterministic matching algorithm (skill coverage + complementary +
      availability weights) + Gemini enrichment on top
- [x] `GET /recommendations` — cache-first, 30min TTL

## Week 4 — Teams, Hackathons, Push
- [x] Teams CRUD, QR token generate/validate against Redis `qr_join:{token}`
- [x] Team invitations (accept/decline), hackathon register
- [x] `firebase-admin` push send on: team invite, invitation accepted
- [x] `GET/PATCH /notifications`

## Week 5 — CI/CD + Hardening
- [x] GitHub Actions: lint + typecheck + test on every PR
- [x] Deploy hook to Render on merge to `main`
- [x] Rate limit review across all endpoints, RBAC check on admin routes

## Week 6 — Demo Prep
- [x] Warm Render instance before demo (free tier cold start ~800ms)
- [x] Render logs tab ready to show live during demo

## Handoff Contract
- Frontend codes against your Swagger docs, not your source — keep it current
- Breaking an endpoint shape → flag in team channel before merging to `main`
