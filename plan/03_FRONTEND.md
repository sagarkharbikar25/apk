# SkillSync — Member 3: Frontend (React Native CLI)

> Owns: `apps/mobile/` design system, navigation, auth, student module
> Member 4 owns `apps/mobile/src/features/organizer/` and builds it on your components.
> Read `00_MASTER_PLAN.md` first.

You open **Gate C (design system published)**. Everything visual waits on it, so ship tokens, fonts and base components before any screen.

---

## 1. Design direction: "HWI terminal"

The reference is the HWI JDCOEM website. The app must feel like the same family, not a generic Material or iOS-style app.

**Personality:** hacker-terminal meets event poster. Near-black canvas, one hot accent, huge squared display type, tiny letter-spaced labels, faint digit rain, sharp corners, thin lines.

**What to copy from the reference**
- Near-black background with faint vertical columns of digits (matrix rain), a few digits in pink
- Giant ghost words behind content at ~4% opacity (the site's "HACK WITH INDIA")
- Headline in a wide squared display font, white, with **one word in pink and glowing**
- Brand lockup with a pink full stop: `SKILLSYNC.`
- Eyebrow tag: bordered rectangle, pink dot, tiny tracked uppercase text
- Section labels written like code comments: `// CORE PRINCIPLES`
- L-shaped pink corner brackets around featured frames
- Square icon boxes with a thin pink border
- Divider: thin line with a small pink diamond in the middle
- Buttons: sharp rectangles. Solid pink primary, 1px pink outline secondary, uppercase tracked label with a small icon
- Nav: uppercase tracked labels, active item shows a pink underline

**Banned**
- Rounded cards, pill buttons, rounded bottom sheets (radius is 0 everywhere)
- Default Material elevation shadows, ripple in default grey
- Purple or blue gradients, glassmorphism, emoji in UI, mixed icon sets
- Light theme. Dark only.

## 2. Tokens (`src/theme/tokens.ts`)

Colours below are read by eye from the two screenshots. **Before publishing Gate C, copy the exact values from the website's CSS/Tailwind config** (`index.css` or `tailwind.config`) so the app and site match exactly.

```ts
export const colors = {
  bg:        '#0A0A0B',   // canvas
  surface:   '#101012',   // cards, nav bar
  surface2:  '#16161A',   // pressed, skeleton base
  line:      'rgba(255,255,255,0.08)',  // 1px borders
  text:      '#F5F5F7',
  textMuted: '#9A9AA3',
  textDim:   '#5C5C66',
  accent:    '#FF1654',   // text, borders, glow, icons
  accentSolid:'#E0124A',  // button fills, see contrast note
  accentDim: 'rgba(255,22,84,0.12)',
  ok:        '#3DDC97',
  warn:      '#FFB020',
  rain:      'rgba(255,255,255,0.07)',
  rainHot:   'rgba(255,22,84,0.5)',
} as const;

export const radius = 0;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const border = 1;
```

**Contrast note:** white on `#FF1654` is about 3.8:1, below the 4.5:1 needed for normal text. Use `accentSolid` for filled buttons (about 4.8:1 with white). Keep `accent` for borders, icons, large text and glow. Pink text on `bg` is about 5.2:1, fine.

## 3. Typography

Two families, loaded as local files.

| Role | Font | Used for |
|---|---|---|
| Display | wide squared techno face, see note | Headlines, brand, big numbers |
| UI + body | **Rajdhani** (Medium, SemiBold, Bold) | Nav, labels, body, buttons |

**Font note.** From the screenshots, the body and nav look like Rajdhani. The headline looks like a heavy wide squared face in the Orbitron family, but I am inferring from pixels and cannot confirm it. **Check the website's CSS for the real font name** and put it in one constant:

```ts
// src/theme/typography.ts
export const DISPLAY = 'Orbitron-Black'; // swap after checking the site's CSS
export const UI = { medium: 'Rajdhani-Medium', semi: 'Rajdhani-SemiBold', bold: 'Rajdhani-Bold' };
```

Android font rules (these bite people):
- Put static `.ttf` files in `apps/mobile/assets/fonts/`, link with `react-native.config.js` (`assets: ['./assets/fonts']`) and `npx react-native-asset`.
- On Android, `fontFamily` is the **file name**, e.g. `Rajdhani-SemiBold`. Pick weight by family, leave `fontWeight` unset.
- Variable fonts do not map weights reliably. Use the `static/` folder from the Google Fonts zip, or generate instances with `fonttools varLib.instancer`.
- Set `includeFontPadding={false}` on display text or it sits too low.

| Style | Font | Size/line | Tracking | Case |
|---|---|---|---|---|
| displayXL (hero) | Display | 40/40 | -0.04em (letters nearly touch, like the site) | UPPER |
| displayL | Display | 28/30 | -0.03em | UPPER |
| displayM | Display | 20/24 | -0.02em | UPPER |
| title | Rajdhani Bold | 18/22 | 0.5 | Sentence |
| body | Rajdhani Medium | 16/22 | 0 | Sentence |
| label | Rajdhani SemiBold | 12/16 | 2.4 | UPPER |
| micro | Rajdhani SemiBold | 10/12 | 2.0 | UPPER |

The site body uses a light weight on big screens. On a phone that is too thin, so body stays Medium. Light is allowed only for large intro paragraphs.
Display type is wide. Keep headlines to two short lines, use `numberOfLines` and `adjustsFontSizeToFit`, never use it for body or dense lists.

## 4. Signature components (`src/components/`)

Build these before screens. Each is a small file.

| Component | Spec |
|---|---|
| `Screen` | `bg` fill, `StatusBar` light with bg colour, optional `<DigitRain/>` layer, safe area |
| `DigitRain` | See section 5 |
| `GhostWord` | Giant display text, `text` at 4% opacity, clipped, `pointerEvents="none"`. Only on non-scrolling hero areas |
| `Brand` | `SKILLSYNC` in display font, pink `.` |
| `Headline` | Takes `children` and `accent` word. Accent word is pink with `textShadow` pink radius 12 |
| `Eyebrow` | 1px `line` border, pink 6px square dot, micro label, e.g. `SKILLSYNC · OFFICIAL BUILD` |
| `SectionLabel` | `// LABEL` in micro, `textMuted` |
| `Button` | Variants `primary` (accentSolid fill, white label), `outline` (1px accent, accent label), `ghost`. Height 52, uppercase label 14 semi tracked 1.5, optional leading icon. Pressed: fill darkens, scale 0.98, 120ms |
| `Card` | `surface`, 1px `line`. Prop `bracket` adds `CornerFrame` |
| `CornerFrame` | Four L-shapes (two borders each), 14px arms, 1px accent, absolutely positioned |
| `IconBox` | 40px square, 1px accent border, `accentDim` fill, lucide icon 20px stroke 1.5 |
| `Divider` | 1px `line` with a centred 6px rotated pink square |
| `Input` | Square, 1px `line`, focus turns border `accent`, label above in `label` style, error text pink with an icon |
| `SkillBadge` | Name + four small square pips, filled by level |
| `StatusPill` | Square (not pill), 1px border, `OPEN` pink, `CLOSED` dim, `FULL` warn |
| `ScoreBreakdown` | See section 7 |
| `Skeleton` | `surface2` blocks, slow horizontal shimmer, square |
| `OfflineBanner` | Top strip, 1px accent bottom border, `// OFFLINE — SHOWING SAVED DATA` |
| `EmptyState` | Big dim lucide icon, `// NO SQUADS YET`, one outline button |
| `ErrorState` | Pink-bordered box, `// REQUEST FAILED`, message, `RETRY` button |
| `Toast` | Top, square, accent left bar. Also used for foreground push banners |
| `Avatar` | Square initial block in display font, `accentDim` fill |

Icons: `lucide-react-native` only, stroke 1.5, 20 or 24px. This matches the website's icon style.

Glow rules (Android limits): `elevation` shadows are black only, so
- Text glow: `textShadowColor` pink, radius 10 to 14. Fine.
- Box glow: do not fake with elevation. Use a pre-exported soft radial pink PNG (`assets/images/glow.png`) placed behind headlines, plus the 1px accent border.

## 5. DigitRain

- 10 to 14 columns across the width, each a single `Text` with one digit per line (`0 1 7 3 ...`), `micro` size, `rain` colour, about 8% of digits `rainHot`
- Generate the digit strings once at module load with a seeded PRNG so they never reshuffle on re-render
- **Animated** version (Splash, Login, Register, Welcome only): each column drifts down with `Animated.loop` on `translateY`, 14 to 24 s per loop, different per column, `useNativeDriver: true`
- **Static** version everywhere else: same columns, no animation, lower opacity
- Never place it behind a `FlashList`. Put it on the `Screen` layer with `pointerEvents="none"`, `renderToHardwareTextureAndroid`
- Respect `AccessibilityInfo.isReduceMotionEnabled`: use the static version
- Pause animation when the screen is not focused (`useIsFocused`)

## 6. Motion

- Screen content enters with fade + 8px rise, 180ms, 40ms stagger, max 6 items
- Press feedback 120ms. Nothing bounces, nothing spins except loaders
- Headline accent word on Splash: one slow pink glow pulse, then still
- Skeleton shimmer 1.2s
- Keep everything on the native driver. If a screen drops frames, remove animation, not features.

## 7. ScoreBreakdown (explainability)

This is a judging point, so it must be clear.

```
// MATCH  82%
SKILL COVERAGE   ████████░░  80%
COMPLEMENTARY    ███████░░░  70%
EXPERIENCE       ██████░░░░  60%

[✓] Covers React Native, Node.js
[✓] Fills your gap: Docker
[!] Missing: Redis
// AI NOTE  Strong backend profile that matches the core of your stack.
```
- 10 square segments per bar, filled pink proportionally, rest `surface2`
- Icons are lucide `Check`, `AlertTriangle`, `Zap`. No emoji.
- If `aiNote` is null (Gemini down), the AI line is simply absent. No error, no empty space.
- Collapsed by default on list cards (score + top reason), expands on tap.

## 8. Navigation

- `@react-navigation/native-stack` for stacks. `@react-navigation/bottom-tabs` for the two tab bars (same ecosystem, needed for the module split).
- Root decides by `auth.status` and `user.role`: `AuthStack` | `StudentTabs` | `OrganizerTabs`
- Tab bar: `surface`, 1px top `line`, labels in `label` style, active tab gets a 2px pink line on top and pink icon, inactive `textDim`. This mirrors the website's underline nav.
- Header: `Brand` left, bell with unread dot right, 1px bottom `line`
- Deep link scheme `skillsync://`. Routes: `join/team/:teamId?t=`, `invitations`, `hackathon/:id`
- Cold-start push tap: `messaging().getInitialNotification()`. Background tap: `onNotificationOpenedApp`. Foreground: show `Toast`, do not auto-navigate.

Student tabs: `HOME · HACKS · TEAMS · ALERTS · PROFILE`
Organiser tabs: `HUB · CREATE · ALERTS · PROFILE`

## 9. Screens (student module and shared)

Each screen needs: loading (skeleton), empty, error, and offline state.

**Splash**: black, animated rain, `Brand`, `Headline` "FIND. **SYNC.** SHIP." Decides route after token check. Shows `// WAKING SERVER…` if the first request takes more than 3 s.
**Login / Register**: `Eyebrow`, `Headline` ("WELCOME **BACK.**" / "JOIN THE **BUILD.**"), inputs, primary button. Register has a `STUDENT | ORGANISER` square toggle. Organiser reveals an invite code field. `react-hook-form` + `zod`.
**VerifyEmail**: six square OTP boxes, resend with countdown.
**BiometricUnlock**: Brand, big fingerprint icon in `IconBox`, `UNLOCK` button, `USE PASSWORD` link.
**Home**: header, `// REGISTERED HACKATHONS` horizontal strip, `// TEAMS LOOKING FOR YOU` `FlashList` of recommendation cards with collapsed `ScoreBreakdown`, filter chips by hackathon, pull to refresh.
**HackathonList / Detail**: cards with `StatusPill`, deadline, team count. Detail has `CornerFrame` banner block, details, `REGISTER` button, `// OPEN SQUADS` list, `CREATE SQUAD` outline button.
**MyTeams**: list, `CREATE` and `SCAN QR` actions.
**CreateTeam**: name, description, `EXTRACT SKILLS` button (calls AI, shows suggestions as toggle chips, user confirms, never auto-adds), manual skill picker fallback.
**TeamDashboard**: members with `Avatar`, role, leader marker. Required skills with coverage bar. Leader actions: `SHOW QR`, `FIND TEAMMATES`, `INVITE`. Member action: `LEAVE`.
**FindTeammates**: recommendation cards with `ScoreBreakdown` and `INVITE`.
**ShowQR**: QR on a white square (dark modules need a light background to scan), `CornerFrame` around it, expiry text, `ROTATE` button.
**ScanQR**: `react-native-vision-camera` with code scanner, pink corner-bracket reticle, torch toggle, permission denied state with a settings button.
**Alerts**: segmented `ALL | INVITES`. Invitation cards have `ACCEPT` (primary) and `DECLINE` (outline). `MARK ALL READ`.
**Profile**: `Avatar`, name, college, links, skills with pips, `EDIT`, `SETTINGS`.
**EditProfile + Skills**: fields, skill list with level selector (four squares), `EXTRACT FROM BIO` flow.
**Settings**: biometric toggle, logout, app version.

Organiser screens are specified here so Member 4 builds them consistently:
**Hub**: `// YOUR HACKATHONS` list with registration and team counts, stat row of four `Card`s using display numbers.
**HackathonForm**: title, description, venue, dates, max team size, status. `@react-native-community/datetimepicker`.
**HackathonManage**: top tabs `ROSTER | SQUADS | ANNOUNCE`. Roster has a `TEAMLESS` filter and check-in toggle per row. Squads shows team cards with members. Announce is title + body + `SEND TO ALL`.

## 10. State, API, offline

- `zustand`: `authStore {status, user, accessToken}`, `settingsStore {biometricEnabled}` (the flag in MMKV)
- `axios` instance with `API_BASE_URL` from `react-native-config`
- **Single-flight refresh.** On 401, the first request starts a refresh and stores the promise. Every other 401 waits on that same promise, then retries. With rotating refresh tokens, parallel refreshes revoke each other and log the user out. Do not skip this.
- **Timeouts:** 15 s default. The very first request after launch gets 45 s, because a sleeping free-tier server can take a long time to wake.
- TanStack Query v5: `staleTime 60s`, `refetchOnWindowFocus false`, `onlineManager` wired to NetInfo
- Persist with `@tanstack/query-sync-storage-persister` on an MMKV adapter. **Whitelist** persisted queries: skills, my profile, my teams, hackathons, notifications. Never persist anything token-like.
- Tokens only in `react-native-keychain` (Android Keystore). MMKV holds non-sensitive flags.
- Offline writes are not queued. Buttons that need the network show a toast: `// NEEDS INTERNET`.
- Biometric flow: login, enable in Settings, `react-native-biometrics` prompt on relaunch, on success read tokens from Keychain. The unlock itself makes no network call. The first API call after it may 401 and silently refresh, that is expected.

## 11. Android specifics

- `android:windowBackground` set to `bg` in `styles.xml` so there is no white flash at launch
- `android:forceDarkAllowed="false"` so the OS never recolours the app
- Status bar and navigation bar colours set to `bg`
- Adaptive icon: `bg` background, pink display-font "S"
- Permissions: `INTERNET`, `CAMERA`, `POST_NOTIFICATIONS`, `USE_BIOMETRIC`. Nothing else.
- Request camera at the moment of tapping `SCAN QR`, notifications after login

## 12. Checklist

**Design system (Gate C)**
- [ ] Fonts bundled and rendering on a real device, `DISPLAY` constant confirmed against the website
- [ ] Tokens match website CSS exactly
- [ ] All components in section 4 exist with a `ComponentGallery` dev screen showing each
- [ ] `DigitRain` animated and static, 60 fps on a mid-range phone

**Auth and shell**
- [ ] Root navigator by role, tab bars styled
- [ ] Login, Register, OTP, Biometric, Splash with wake-up state
- [ ] Single-flight refresh verified with 3 parallel requests and an expired token

**Student module**
- [ ] Every screen in section 9 with all four states
- [ ] QR show/scan across two phones
- [ ] Push tap deep links from killed, background and foreground
- [ ] Offline verified: online load, airplane mode, cached data, reconnect refetch

**Polish**
- [ ] Skeletons on every list
- [ ] No default Material look anywhere: radius 0, no stock ripple colour, no emoji
- [ ] Bug bash with Member 4 on the organiser screens

## Handoff contract
Member 4 uses your components and tokens and does not restyle. If they need a new component, they ask you or add it to `components/` through a PR you review. Shared nav routes are yours.
