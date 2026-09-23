# SkillSync — Member 4: React Native / UI

> Branch: `feature/rn-teams-notifications`
> Owns: `src/screens/teams/`, `src/screens/hackathons/`,
>        `src/screens/notifications/`, `src/components/offline/`
> Do not edit files outside these paths — that's how we keep merges clean.

## Week 1 — Setup Support
- [x] Help Member 3 scaffold shared UI components/design tokens
      (agree on this early so both of you aren't restyling later)
- [x] Get familiar with Backend's Teams/Hackathons Swagger contracts once live

## Week 2 — Teams Screens (static first)
- [x] Team creation screen, team dashboard (members list)
- [x] Build against mocked data if Backend's Teams API isn't ready yet —
      don't block on them, swap in real calls when available

## Week 3 — QR Join
- [x] `react-native-vision-camera` QR frame processor
- [x] Show QR (team's `qr_code`) on device A, scan on device B
- [x] Wire to `POST /teams/:id/join` with `qrToken`

## Week 4 — Push Notifications
- [x] `@react-native-firebase/messaging` setup, FCM token registration
- [x] Foreground + background notification handling
- [x] Tap notification → deep link to invitation screen
- [x] Invitation accept/decline UI → `PATCH /teams/invitations/:id`
- [x] Notifications list screen, mark read/read-all

## Week 5 — Offline Resilience
- [x] `react-native-mmkv` cache for last-fetched data
- [x] Offline banner (detect connectivity loss)
- [x] TanStack Query auto-refetch on reconnect
- [x] Verify: online → load data → airplane mode → cached data still shows →
      reconnect → refetches automatically

## Week 6 — Demo Prep
- [x] Rehearse the QR join + push notification demo beat on two physical
      Android devices (not emulators — Play Services needed for FCM)
- [x] Bug bash with Member 3
- [x] Dedicated Organizer Hub & Squad Roster management module

## Optional / Stretch (only if week 5 finishes early)
- [ ] Minimal admin dashboard (React + Vite) — do not staff this by default,
      it's the lowest-weighted judging criterion relative to effort required

## Handoff Contract
- Only touch `src/navigation/` route definitions you need — coordinate with
  Member 3 before adding/renaming shared nav routes
