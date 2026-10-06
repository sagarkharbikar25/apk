export const colors = {
  // Deep Cosmic Obsidian Noir Surfaces (Zero generic blue, pure deep AI noir)
  background: '#090A0F',
  surface: '#13141E',
  surfaceElevated: '#1C1E2C',
  surfaceCard: '#171824',
  surfaceBorder: '#2D3044',
  surfaceBorderHighlight: '#C084FC',
  surfaceGlass: 'rgba(19, 20, 30, 0.85)',

  // Brand Primary — Gemini Electric Amethyst
  primary: '#A855F7',           // Vibrant Electric Amethyst
  primaryLight: '#C084FC',      // Luminous Lavender Glow
  primaryDark: '#7E22CE',       // Deep Royal Amethyst
  primarySubtle: 'rgba(168, 85, 247, 0.16)',
  primaryGlow: 'rgba(192, 132, 252, 0.38)',

  // Brand Secondary — Gemini Sunset Rose & Neon Coral
  secondary: '#F43F5E',         // Sunset Neon Rose
  secondaryLight: '#FB7185',    // Radiant Coral Glow
  secondaryDark: '#E11D48',     // Deep Crimson Rose
  secondarySubtle: 'rgba(244, 63, 94, 0.16)',
  secondaryGlow: 'rgba(251, 113, 133, 0.35)',

  // Supporting Gemini AI Accents
  accentPink: '#EC4899',        // Prismatic Fuchsia
  accentPinkSubtle: 'rgba(236, 72, 153, 0.16)',
  accentPurple: '#A855F7',      // Electric Amethyst
  accentPurpleSubtle: 'rgba(168, 85, 247, 0.16)',
  accentAmber: '#F59E0B',       // Solar Flare Gold
  accentAmberSubtle: 'rgba(245, 158, 11, 0.16)',
  accentEmerald: '#10B981',     // Emerald Matrix
  accentEmeraldSubtle: 'rgba(16, 185, 129, 0.16)',
  accentCyan: '#06B6D4',        // Cyber Neon Cyan
  accentCyanSubtle: 'rgba(6, 182, 212, 0.16)',

  // Semantic Status Tones
  success: '#10B981',           // Emerald Matrix
  successSubtle: 'rgba(16, 185, 129, 0.16)',
  warning: '#F59E0B',           // Solar Gold
  warningSubtle: 'rgba(245, 158, 11, 0.16)',
  error: '#EF4444',             // Crimson Alert
  errorSubtle: 'rgba(239, 68, 68, 0.16)',
  info: '#C084FC',              // Amethyst Info

  // Non-Generic Typography Hierarchy
  textPrimary: '#FAF5FF',       // Frost Lavender White
  textSecondary: '#A1A1AA',     // Slate Warm Gray
  textMuted: '#71717A',         // Steel Zinc
  textInverse: '#090A0F',
  textAccent: '#E879F9',        // Orchid Spark
  textCyan: '#FB7185',          // Coral Glow replacement

  // Form & Inputs
  inputBackground: '#0F1018',
  inputBorder: '#27293A',
  inputFocusBorder: '#A855F7',
  inputPlaceholder: '#52525B',

  // Overlay & Highlights
  divider: '#27293A',
  overlay: 'rgba(9, 10, 15, 0.92)',
  shimmer: '#27293A',
} as const;

export type ColorToken = keyof typeof colors;
