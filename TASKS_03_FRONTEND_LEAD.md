# SkillSync — Member 3: React Native Lead

> Branch: `feature/rn-auth-profile`
> Owns: `src/screens/auth/`, `src/screens/profile/`, `src/screens/discover/`,
>        `src/navigation/`, `src/store/` (zustand)
> Do not edit files outside these paths — that's how we keep merges clean.

## Week 1 — Shell + Auth
- [ ] `@react-navigation/native-stack` shell (Activity-stack based, not JS nav)
- [ ] Login/Register screens, `react-hook-form` + `zod` validation
- [ ] Wire to Backend's `/auth` endpoints (use Swagger contract once live)
- [ ] Zustand auth store (token, user, isAuthenticated)
- [ ] Axios instance with interceptor: attach JWT, silent refresh on 401

## Week 2 — Profile + Skills
- [ ] Profile view/edit screen (bio, college, links, looking_for, roles)
- [ ] Skills management UI — add/remove, level selector
- [ ] "Extract Skills" button → calls AI endpoint, user confirms suggestions
      before they're added (don't auto-add)

## Week 3 — Discover
- [ ] Discover feed using `@shopify/flash-list` (needed for 100+ cards)
- [ ] Filter by skill/category, pull-to-refresh
- [ ] Recommendation cards with score breakdown shown to user (explainability
      is a judging point — don't just show a number, show why)

## Week 4 — Biometric
- [ ] `react-native-keychain` token storage in Android Keystore
- [ ] `react-native-biometrics` — enable in settings, unlock on relaunch
- [ ] Verify: login → enable biometric → force-close app → reopen → unlock
      works without a new backend call

## Week 5-6 — Polish + Build
- [ ] Skeleton loaders on all your screens
- [ ] Bug bash with Member 4 — test both halves of the app together
- [ ] Signed APK build (this becomes the actual demo artifact)

## Handoff Contract
- Only touch `src/navigation/` route definitions Member 4 needs — coordinate
  before adding/renaming shared nav routes to avoid a merge fight there
