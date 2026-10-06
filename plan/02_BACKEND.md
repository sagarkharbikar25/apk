# SkillSync — Member 2: Backend (NestJS)

> Owns: `apps/api/src/` except `modules/ai/` and `modules/recommendations/` (Member 4)
> Do not edit files outside these paths.
> Read `00_MASTER_PLAN.md` first. Business rules there are law.

You open **Gate B (Swagger live)**. Frontend codes against `/docs`, not your source.
Auth comes first because every other screen waits on it.

---

## 1. Modules

```
auth  users  skills  hackathons  teams  notifications  push  health
redis (global)  prisma (global)
ai, recommendations  -> Member 4, you only wire them in
```

Conventions
- Prisma only, no raw SQL except Member 1's candidate queries
- DTOs with `class-validator`, `whitelist: true`, `forbidNonWhitelisted: true`
- Every route has Swagger decorators and an example response. This is the contract.
- Standard error: `{ statusCode, message, errors?: [{field,message}], code? }`
- Standard page: `{ data: [], meta: { page, limit, total, totalPages } }`
- Error `code` strings the app can switch on: `EMAIL_TAKEN`, `INVALID_CREDENTIALS`, `OTP_INVALID`, `TEAM_FULL`, `ALREADY_IN_TEAM`, `REGISTRATION_CLOSED`, `QR_EXPIRED`, `INVITE_EXPIRED`, `AI_UNAVAILABLE`

## 2. Auth

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register` | `{email,password,displayName,role,organizerCode?}`. 3/min per IP |
| POST | `/auth/login` | 5/min per IP |
| POST | `/auth/refresh` | Rotates pair, revokes old |
| POST | `/auth/logout` | Revokes refresh token, nulls `fcm_token` |
| POST | `/auth/verify-email` | `{email,otp}` against Redis |
| POST | `/auth/resend-verification` | 2/min per email |

- [ ] bcrypt, 12 rounds. Password min 8, 1 uppercase, 1 number
- [ ] Access JWT 15m `{sub, role}`. Refresh = random token, SHA256 stored, 7d
- [ ] **Reuse detection:** presenting an already-revoked refresh token revokes all of that user's tokens. Without this, rotation proves nothing.
- [ ] `role=organizer` requires `organizerCode === ORGANIZER_INVITE_CODE`, else 403
- [ ] OTP: 6 digits, store hashed in `otp:{email}` 10m. `OTP_DEV_MODE=true` logs the OTP and, outside production, returns it in the register response. Real email is a later swap behind an `EmailService` interface.
- [ ] Login for unverified email is allowed but `emailVerified:false` is in the payload. The app decides what to gate.
- [ ] Never log passwords, tokens, OTPs (except dev mode)

## 3. Users, skills

| Method | Path | Notes |
|---|---|---|
| GET | `/users/me` | Profile + skills |
| PATCH | `/users/me` | Invalidates `profile:{id}` and `recs:*` for the user |
| GET | `/users/:id/profile` | Public view, Redis cached |
| POST | `/users/me/fcm-token` | `{token}`. Overwrites |
| GET | `/skills` | `?category=&search=`. Cached 1h |
| POST | `/users/me/skills` | `{skillId, level}`, upsert |
| DELETE | `/users/me/skills/:skillId` | Invalidates caches |

## 4. Hackathons (student + organiser)

| Method | Path | Who | Notes |
|---|---|---|---|
| GET | `/hackathons` | any | `?status=&page=`. Includes `registered` flag for the caller |
| GET | `/hackathons/:id` | any | Counts: registrations, teams, teamless |
| POST | `/hackathons/:id/register` | student | Rule 4. Idempotent |
| POST | `/hackathons` | organiser | |
| PATCH | `/hackathons/:id` | owner | Status, dates, size. Cannot lower `max_team_size` below an existing team's size |
| GET | `/organizer/hackathons` | organiser | Own, with stats |
| GET | `/hackathons/:id/participants` | owner | `?teamless=true&page=` |
| GET | `/hackathons/:id/teams` | owner | Squad roster with members |
| PATCH | `/hackathons/:id/participants/:userId/check-in` | owner | `{checkedIn:boolean}` |
| POST | `/hackathons/:id/announce` | owner | `{title,body}`. Rate limit 5/min. Pushes to all registrants |

- [ ] `@Roles('organizer')` guard plus an **ownership check against the DB** (`organizer_id === user.id`). Role in the JWT alone is not enough.

## 5. Teams

| Method | Path | Who | Notes |
|---|---|---|---|
| POST | `/teams` | student | `{hackathonId,name,description,requiredSkillIds[]}`. Auto-registers. Creator becomes leader |
| GET | `/teams` | any | `?hackathonId=&mine=true&page=` |
| GET | `/teams/:id` | member or any registrant | Members, required skills, coverage |
| PATCH | `/teams/:id` | leader | Name, description, required skills (invalidate recs) |
| POST | `/teams/:id/qr` | leader | Creates or rotates token, returns `{token, deepLink, expiresAt}` |
| POST | `/teams/:id/join` | student | `{qrToken}`. Auto-registers |
| POST | `/teams/:id/invite` | leader | `{userId}`. Creates invitation + notification + push |
| GET | `/teams/invitations/me` | student | Pending, expiry computed on read |
| PATCH | `/teams/invitations/:id` | invitee | `{action:'accept'|'decline'}` |
| DELETE | `/teams/:id/members/:userId` | leader or self | Leader cannot leave while others remain, must transfer or delete |
| DELETE | `/teams/:id` | leader | Soft delete |

Join and accept share one `joinTeam(teamId,userId)` service function. One transaction:
1. Lock the team row (`SELECT ... FOR UPDATE` via `$queryRaw`) so the capacity check is race free
2. Check hackathon open, capacity vs `min(max_members, max_team_size)`
3. Upsert registration
4. Insert `team_members` row with `hackathon_id` copied from the team
5. Map Prisma `P2002` on `(hackathon_id,user_id)` to `ALREADY_IN_TEAM`, full team to `TEAM_FULL`
6. After commit: invalidate `recs:*`, notify leader (`member_joined`)

QR deep link payload: `skillsync://join/team/{teamId}?t={token}`

## 6. Notifications and push

| Method | Path |
|---|---|
| GET | `/notifications` `?unread=true&page=&limit=` |
| PATCH | `/notifications/:id/read` |
| PATCH | `/notifications/read-all` |

Events that notify: `team_invite`, `invitation_accepted`, `member_joined`, `hackathon_announcement`.

- [ ] **DB row first, push second.** The row is the source of truth. A failed push never fails the request.
- [ ] `firebase-admin`, `sendEachForMulticast` for announcements
- [ ] Payload: `notification{title,body}` + `data{type, route, ...ids}` (all strings). Include `notification` so a killed app still shows it, and `data` so a tap can deep link.
- [ ] If FCM says the token is not registered, set `fcm_token = NULL`
- [ ] `FIREBASE_SERVICE_ACCOUNT` env as single-line JSON. Never commit it.

## 7. Wiring the AI module (Member 4 owns the logic)

| Method | Path | Notes |
|---|---|---|
| POST | `/ai/extract-skills` | `{text}` up to 2000 chars. 10/min per user |
| POST | `/ai/team-requirements` | `{description}`. 10/min per user |
| GET | `/teams/:id/recommendations` | Leader only. Candidates |
| GET | `/recommendations/teams` | `?hackathonId=`. Teams for the caller |

You provide the guards, throttling and DTOs. Agree the response shapes with Member 4 once and put them in Swagger.

## 8. Platform

- [ ] `GET /health` returns `{db:'ok',redis:'ok',uptime}`, no auth. Used by keep-alive.
- [ ] Helmet, CORS allow-list from env, body limit 1 MB (no uploads now)
- [ ] `@nestjs/throttler` with Redis store: global 100/min per user, tighter on auth and AI
- [ ] Request id in every log line
- [ ] Graceful failure if Redis is down: caches are skipped, rate limiting fails open, OTP and QR return 503 with a clear code
- [ ] Env validation at boot (fail fast). List in `.env.example`:
  `DATABASE_URL DIRECT_URL REDIS_URL JWT_SECRET JWT_REFRESH_PEPPER? ORGANIZER_INVITE_CODE OTP_DEV_MODE GEMINI_API_KEY GEMINI_MODEL FIREBASE_SERVICE_ACCOUNT CORS_ORIGINS`

## 9. Tests (Jest + Supertest)

- [ ] auth: register hashes, login 401, refresh rotates, reused refresh revokes all, organiser code enforced
- [ ] teams: concurrent join for the last slot gives exactly one success, second gets `TEAM_FULL`
- [ ] teams: user already in a team of the hackathon gets `ALREADY_IN_TEAM`
- [ ] hackathons: non-owner organiser gets 403 on roster and announce
- [ ] invitations: expired invite cannot be accepted
- [ ] Gemini and FCM mocked in all tests

## 10. Done when

- [ ] Every endpoint above exists in Swagger with example payloads
- [ ] CI green (Member 4's pipeline)
- [ ] Deployed on Render, `/health` ok
- [ ] Render logs tab ready to show during any demo

## Handoff contract
Frontend codes against Swagger. Breaking an endpoint shape means a message in the team channel before merging to `main`.
