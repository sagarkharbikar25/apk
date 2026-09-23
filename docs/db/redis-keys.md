# SkillSync — Redis Key Schema & Caching Architecture

## Overview
SkillSync uses **Upstash Redis** as an in-memory caching and transient state store to achieve sub-millisecond response times, implement distributed rate-limiting, and offload read pressure from the primary PostgreSQL / Supabase database.

---

## 1. Key Schema Taxonomy

| Key Pattern | Data Type | TTL | Serialization | Invalidation Trigger / Policy | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `profile:{userId}` | String (JSON) | `300s` (5 min) | JSON string | On `PUT /profile`, `POST /profile/skills` | Cached user profile + user skills for fast lookups. |
| `skills:all` | String (JSON) | `3600s` (1 hour) | JSON array | On admin skill taxonomy update | Global skill catalog used across search, filters, and chips. |
| `recommendations:{userId}` | String (JSON) | `1800s` (30 min) | JSON array | On profile/skill update or daily cron | Precomputed AI-matched teammates with score breakdowns. |
| `throttle:{ip}:{endpoint}` | Integer | `60s` (1 min) | Raw Int | Auto-expiry (sliding window) | Global & route-level rate limiting counter. |
| `otp:{email}` | String | `600s` (10 min) | Raw String | On successful verification or expiry | Secure 6-digit email verification OTP. |
| `qr_join:{token}` | String (JSON) | `86400s` (24 hr) | JSON object | On team max capacity or manual revoke | Team QR code invite payload (`teamId`, `inviterId`). |

---

## 2. Key Details & Payload Specifications

### `profile:{userId}`
- **Pattern:** `profile:c0a80101-0000-0000-0000-000000000001`
- **TTL:** 300 seconds (5 minutes)
- **Structure:**
```json
{
  "id": "c0a80101-0000-0000-0000-000000000001",
  "userId": "u123",
  "displayName": "Alex Chen",
  "bio": "Full-stack builder & AI hacker",
  "college": "UC Berkeley",
  "graduationYear": 2026,
  "avatarUrl": "https://[SUPABASE].supabase.co/storage/v1/object/public/avatars/u123.jpg",
  "skills": [
    { "id": "s1", "name": "React Native", "category": "Mobile", "level": "expert" },
    { "id": "s2", "name": "TypeScript", "category": "Frontend", "level": "expert" }
  ],
  "availability": {
    "hoursWeek": 20,
    "startDate": "2026-09-23T00:00:00.000Z",
    "timezone": "UTC-8"
  }
}
```

---

### `skills:all`
- **Pattern:** `skills:all`
- **TTL:** 3600 seconds (1 hour)
- **Structure:**
```json
[
  { "id": "s1", "name": "React Native", "category": "Mobile" },
  { "id": "s2", "name": "Google Gemini", "category": "AI/ML" },
  { "id": "s3", "name": "NestJS", "category": "Backend" }
]
```

---

### `recommendations:{userId}`
- **Pattern:** `recommendations:u123`
- **TTL:** 1800 seconds (30 minutes)
- **Structure:**
```json
[
  {
    "userId": "u456",
    "displayName": "Maya Patel",
    "matchScore": 94.5,
    "scoreBreakdown": { "skillOverlap": 96, "complementarity": 95, "availability": 90 },
    "reasons": [
      "Complementary expertise in PyTorch and Google Gemini AI",
      "Compatible graduation year and weekly commitment"
    ]
  }
]
```

---

### `throttle:{ip}:{endpoint}`
- **Pattern:** `throttle:192.168.1.50:/api/v1/auth/login`
- **TTL:** 60 seconds
- **Value:** Integer request count within the current minute window.

---

### `otp:{email}`
- **Pattern:** `otp:student@skillsync.io`
- **TTL:** 600 seconds (10 minutes)
- **Value:** `"849201"`

---

### `qr_join:{token}`
- **Pattern:** `qr_join:7b2a6f81-99c2-4820-a6fe-f584e2079011`
- **TTL:** 86400 seconds (24 hours)
- **Structure:**
```json
{
  "teamId": "t987",
  "teamName": "CyberVanguard Squad",
  "inviterId": "u123",
  "role": "Member",
  "createdAt": 1790131200000
}
```

---

## 3. Cache Invalidation & Consistency

1. **Write-Through / Evict on Mutation:**
   - Any update to a user profile or skill triggers `redis.del("profile:" + userId)`.
   - Adding or removing team members clears related squad cache.
2. **Graceful Fallback:**
   - If Redis is unavailable or times out, the backend seamlessly falls back to PostgreSQL querying without throwing a 500 error.
