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

export type ColorToken = keyof typeof colors;
