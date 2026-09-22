export const colors = {
  // Deep Cyber / Cosmic Surfaces (Non-generic rich dark mode)
  background: '#070B14',
  surface: '#0F172A',
  surfaceElevated: '#172239',
  surfaceCard: '#131D31',
  surfaceBorder: '#22324E',
  surfaceBorderHighlight: '#3B82F6',

  // Radiant Brand Accents (Vibrant HSL-tailored)
  primary: '#6366F1',           // Electric Indigo
  primaryLight: '#818CF8',      // Soft Lavender Glow
  primaryDark: '#4338CA',       // Deep Royal Violet
  primarySubtle: 'rgba(99, 102, 241, 0.16)',
  primaryGlow: 'rgba(99, 102, 241, 0.35)',

  // Secondary Accents (Cyberpunk Cyan)
  secondary: '#06B6D4',         // Bright Cyan
  secondaryLight: '#38BDF8',    // Sky Glow
  secondaryDark: '#0891B2',
  secondarySubtle: 'rgba(6, 182, 212, 0.16)',

  // Semantic Status Tones
  success: '#10B981',           // Emerald Matrix
  successSubtle: 'rgba(16, 185, 129, 0.16)',
  warning: '#F59E0B',           // Solar Flare Amber
  warningSubtle: 'rgba(245, 158, 11, 0.16)',
  error: '#EF4444',             // Crimson Alert
  errorSubtle: 'rgba(239, 68, 68, 0.16)',
  info: '#60A5FA',

  // Non-generic Typography Hierarchy
  textPrimary: '#F8FAFC',       // Pure Frost White
  textSecondary: '#94A3B8',     // Muted Slate
  textMuted: '#64748B',         // Subtle Steel
  textInverse: '#070B14',
  textAccent: '#A5B4FC',

  // Form & Inputs
  inputBackground: '#0B111E',
  inputBorder: '#1E293B',
  inputFocusBorder: '#6366F1',
  inputPlaceholder: '#475569',

  // Overlay & Highlights
  divider: '#1E293B',
  overlay: 'rgba(7, 11, 20, 0.88)',
  shimmer: '#1E293B',
} as const;

export type ColorToken = keyof typeof colors;
