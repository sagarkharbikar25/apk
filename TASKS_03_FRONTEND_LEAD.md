# SkillSync — Member 3: React Native Lead

> Branch: `feature/rn-auth-profile`
> Owns: `src/screens/auth/`, `src/screens/profile/`, `src/screens/discover/`,
>        `src/navigation/`, `src/store/` (zustand)
> Do not edit files outside these paths — that's how we keep merges clean.

## Week 1 — Shell + Auth
- [x] `@react-navigation/native-stack` shell (Activity-stack based, not JS nav)
- [x] Login/Register screens, `react-hook-form` + `zod` validation
- [x] Wire to Backend's `/auth` endpoints (use Swagger contract once live)
- [x] Zustand auth store (token, user, isAuthenticated)
- [x] Axios instance with interceptor: attach JWT, silent refresh on 401

## Week 2 — Profile + Skills
- [x] Profile view/edit screen (bio, college, links, looking_for, roles)
- [x] Skills management UI — add/remove, level selector
- [x] "Extract Skills" button → calls AI endpoint, user confirms suggestions
      before they're added (don't auto-add)

## Week 3 — Discover
- [x] Discover feed using `@shopify/flash-list` (needed for 100+ cards)
- [x] Filter by skill/category, pull-to-refresh
- [x] Recommendation cards with score breakdown shown to user (explainability
      is a judging point — don't just show a number, show why)

## Week 4 — Biometric
- [x] `react-native-keychain` token storage in Android Keystore
- [x] `react-native-biometrics` — enable in settings, unlock on relaunch
- [x] Verify: login → enable biometric → force-close app → reopen → unlock
      works without a new backend call

## Week 5-6 — Polish + Build
- [x] Skeleton loaders on all your screens
- [x] Bug bash with Member 4 — test both halves of the app together
- [x] Signed APK build (this becomes the actual demo artifact)

## Handoff Contract
- Only touch `src/navigation/` route definitions Member 4 needs — coordinate
  before adding/renaming shared nav routes to avoid a merge fight there
