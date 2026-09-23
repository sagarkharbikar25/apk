/**
 * "Quiet Focus" Theme Palette
 * A restrained, editorial dark theme designed for student focus and minimal cognitive load.
 * Base: Matte near-black & low-contrast neutrals.
 * Accents: Single accent per role (Soft Mint #6EE7C4 for Student, Soft Amber #E8B25E for Organizer).
 */
export const colors = {
  // ── Base Surfaces ─────────────────────────────────────────────
  background: '#0E0F12',              // Matte near-black
  surface: '#16181C',                 // Card surface
  surfaceElevated: '#1B1E23',         // Pressed / active card surface
  surfaceCard: '#16181C',
  surfaceBorder: '#24262B',           // 1px low-contrast structural border / divider
  surfaceBorderHighlight: '#24262B',  // Keep borders neutral (no color shift)
  surfaceGlass: 'rgba(22, 24, 28, 0.95)',

  // ── Role Accents (Single Accent per role) ─────────────────────
  // Student Role Accent — Soft Mint (Actionable signal only)
  student: '#6EE7C4',
  studentLight: '#A7F3D0',
  studentDark: '#34D399',
  studentSubtle: 'rgba(110, 231, 196, 0.12)',

  // Organizer Role Accent — Soft Amber (Actionable signal only)
  organizer: '#E8B25E',
  organizerLight: '#FDE68A',
  organizerDark: '#D97706',
  organizerSubtle: 'rgba(232, 178, 94, 0.12)',

  // Aliases
  studentAccent: '#6EE7C4',
  organizerAccent: '#E8B25E',
  primary: '#6EE7C4',                 // Default to Student accent
  primaryLight: '#A7F3D0',
  primaryDark: '#34D399',
  primarySubtle: 'rgba(110, 231, 196, 0.12)',

  secondary: '#E8B25E',               // Default to Organizer accent
  secondaryLight: '#FDE68A',
  secondaryDark: '#D97706',
  secondarySubtle: 'rgba(232, 178, 94, 0.12)',

  // ── Neutral Chips (Quiet Focus — All tags are neutral) ────────
  chipBackground: '#1F2226',
  chipText: '#C7CBD1',
  chipMoreText: '#868D99',

  // ── Typography & Neutrals ─────────────────────────────────────
  textPrimary: '#EDEFF2',             // Headings & high-priority text
  textSecondary: '#868D99',           // Muted secondary text
  textBody: '#A7ACB4',                // Body copy
  textMuted: '#565B64',               // Inactive nav, timestamps, metadata
  textDark: '#0E0F12',                // High-contrast dark text on Mint / Amber CTA
  textInverse: '#0E0F12',
  textAccent: '#6EE7C4',

  // ── Functional Status Indicators ──────────────────────────────
  statusActive: '#6EE7C4',            // 6px dot for active status
  statusInactive: '#565B64',          // 6px dot for upcoming / closed
  success: '#6EE7C4',
  successSubtle: 'rgba(110, 231, 196, 0.12)',
  warning: '#E8B25E',
  warningSubtle: 'rgba(232, 178, 94, 0.12)',
  error: '#FF6B6B',                   // Soft coral for danger actions
  errorSubtle: 'rgba(255, 107, 107, 0.12)',

  // ── Match Score & Category Colors ─────────────────────────────
  matchHigh: '#14E1C4',               // 90-100%: Teal-green
  matchMed: '#FFB020',                // 70-89%: Trophy Gold
  matchLow: '#6B7280',                // <70%: Slate
  categoryFrontend: '#6EE7C4',
  categoryBackend: '#38BDF8',
  categoryAI: '#A78BFA',
  categoryDevOps: '#F472B6',
  categoryMobile: '#34D399',
  categoryDesign: '#FBBF24',

  // ── Forms & Dividers ──────────────────────────────────────────
  inputBackground: '#16181C',
  inputBorder: '#24262B',
  inputFocusBorder: '#3A3F4A',        // Restrained focus border
  inputPlaceholder: '#565B64',

  divider: '#24262B',
  overlay: 'rgba(14, 15, 18, 0.94)',
  shimmer: '#1F2226',
} as const;

export type ColorToken = keyof typeof colors;
