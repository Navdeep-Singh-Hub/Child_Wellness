import { HOME_COLORS, HOME_SHADOW } from '@/constants/homeDesign';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  glow?: string;
  dark?: boolean;
};

export function GlassSurface({ children, style, intensity = 72, glow, dark = false }: Props) {
  const base = [
    styles.base,
    dark ? styles.dark : styles.light,
    glow ? HOME_SHADOW.glow(glow) : HOME_SHADOW.soft,
    style,
  ];

  if (Platform.OS === 'ios') {
    return (
      <View style={[base, styles.clip]}>
        <BlurView intensity={intensity} tint={dark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, dark ? styles.darkOverlay : styles.lightOverlay]} />
        {children}
      </View>
    );
  }

  return <View style={base}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  clip: {
    overflow: 'hidden',
  },
  light: {
    backgroundColor: HOME_COLORS.surfaceGlassStrong,
    borderColor: HOME_COLORS.border,
  },
  dark: {
    backgroundColor: 'rgba(30, 27, 75, 0.82)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  lightOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  darkOverlay: {
    backgroundColor: 'rgba(30, 27, 75, 0.25)',
  },
});
