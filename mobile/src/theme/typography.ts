import { TextStyle } from 'react-native';

export const DISPLAY = 'Orbitron-Black'; 
export const UI = { medium: 'Rajdhani-Medium', semi: 'Rajdhani-SemiBold', bold: 'Rajdhani-Bold' };

export const typography: Record<string, TextStyle> = {
  displayXL: {
    fontFamily: DISPLAY,
    fontSize: 40,
    lineHeight: 40,
    letterSpacing: -1.6, // -0.04em * 40
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  displayL: {
    fontFamily: DISPLAY,
    fontSize: 28,
    lineHeight: 30,
    letterSpacing: -0.84, // -0.03em * 28
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  displayM: {
    fontFamily: DISPLAY,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.4, // -0.02em * 20
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  title: {
    fontFamily: UI.bold,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  body: {
    fontFamily: UI.medium,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
    includeFontPadding: false,
  },
  label: {
    fontFamily: UI.semi,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  micro: {
    fontFamily: UI.semi,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 2.0,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
};
