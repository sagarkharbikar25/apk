import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect, Polyline, Line, G } from 'react-native-svg';
import { colors } from '../../theme';

export type IconName =
  | 'discover'
  | 'teams'
  | 'hackathons'
  | 'notifications'
  | 'profile'
  | 'search'
  | 'filter'
  | 'qr'
  | 'sparkle'
  | 'chevronRight'
  | 'chevronDown'
  | 'chevronUp'
  | 'arrowBack'
  | 'check'
  | 'close'
  | 'fingerprint'
  | 'lock'
  | 'shield';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: ViewStyle;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = colors.textPrimary,
  strokeWidth = 2,
  style,
}) => {
  const renderPaths = () => {
    switch (name) {
      case 'discover':
        // Compass / Radar
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="10" />
            <Path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill={color} fillOpacity="0.2" />
          </G>
        );

      case 'teams':
        // Users / Squad
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <Circle cx="9" cy="7" r="4" />
            <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </G>
        );

      case 'hackathons':
        // Trophy / Cup
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <Path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <Path d="M4 22h16" />
            <Path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34" />
            <Path d="M6 2h12v7a6 6 0 0 1-12 0V2z" />
          </G>
        );

      case 'notifications':
        // Bell
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </G>
        );

      case 'profile':
        // User
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <Circle cx="12" cy="7" r="4" />
          </G>
        );

      case 'search':
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="11" cy="11" r="8" />
            <Line x1="21" y1="21" x2="16.65" y2="16.65" />
          </G>
        );

      case 'filter':
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Line x1="4" y1="21" x2="4" y2="14" />
            <Line x1="4" y1="10" x2="4" y2="3" />
            <Line x1="12" y1="21" x2="12" y2="12" />
            <Line x1="12" y1="8" x2="12" y2="3" />
            <Line x1="20" y1="21" x2="20" y2="16" />
            <Line x1="20" y1="12" x2="20" y2="3" />
            <Line x1="1" y1="14" x2="7" y2="14" />
            <Line x1="9" y1="8" x2="15" y2="8" />
            <Line x1="17" y1="16" x2="23" y2="16" />
          </G>
        );

      case 'qr':
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Rect x="3" y="3" width="7" height="7" rx="1" />
            <Rect x="14" y="3" width="7" height="7" rx="1" />
            <Rect x="3" y="14" width="7" height="7" rx="1" />
            <Line x1="14" y1="14" x2="14.01" y2="14" />
            <Line x1="17" y1="17" x2="21" y2="17" />
            <Line x1="17" y1="21" x2="21" y2="21" />
            <Line x1="21" y1="14" x2="21" y2="17" />
          </G>
        );

      case 'sparkle':
        // AI / Magic
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" fill={color} fillOpacity="0.25" />
          </G>
        );

      case 'chevronRight':
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Polyline points="9 18 15 12 9 6" />
          </G>
        );

      case 'chevronDown':
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Polyline points="6 9 12 15 18 9" />
          </G>
        );

      case 'chevronUp':
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Polyline points="18 15 12 9 6 15" />
          </G>
        );

      case 'arrowBack':
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Line x1="19" y1="12" x2="5" y2="12" />
            <Polyline points="12 19 5 12 12 5" />
          </G>
        );

      case 'check':
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Polyline points="20 6 9 17 4 12" />
          </G>
        );

      case 'close':
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Line x1="18" y1="6" x2="6" y2="18" />
            <Line x1="6" y1="6" x2="18" y2="18" />
          </G>
        );

      case 'fingerprint':
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
            <Path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 11.8-1.5" />
            <Path d="M8.5 22c.5-1.5 1-4 1-7a2.5 2.5 0 0 1 5 0c0 2.5-.5 5-1 7" />
            <Path d="M12 12v3" />
          </G>
        );

      case 'lock':
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </G>
        );

      case 'shield':
        return (
          <G stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </G>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {renderPaths()}
      </Svg>
    </View>
  );
};

export default Icon;
