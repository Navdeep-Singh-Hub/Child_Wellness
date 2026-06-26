import {
  HOME_COLORS,
  HOME_LAYOUT,
  HOME_STAT_THEMES,
  HOME_TYPE,
  type HomeStatKey,
} from '@/constants/homeDesign';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { GlassSurface } from './GlassSurface';

type Props = {
  values: Record<HomeStatKey, string>;
  enterDelay?: number;
};

const ORDER: HomeStatKey[] = ['xp', 'coins', 'streak', 'hearts'];

export function HomeStatsGrid({ values }: Props) {
  return (
    <View style={styles.grid}>
      {ORDER.map((key, index) => (
        <HomeStatTile key={key} statKey={key} value={values[key]} index={index} />
      ))}
    </View>
  );
}

function HomeStatTile({ statKey, value, index }: { statKey: HomeStatKey; value: string; index: number }) {
  const theme = { key: statKey, ...HOME_STAT_THEMES[statKey] };
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, {
      toValue: 1,
      delay: 120 + index * 90,
      friction: 7,
      tension: 48,
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          opacity: enter,
          transform: [
            { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
            { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
          ],
        },
      ]}
    >
      <GlassSurface glow={theme.accent} style={styles.card}>
        <LinearGradient colors={theme.gradient} style={[StyleSheet.absoluteFill, { opacity: 0.55 }]} />
        <View style={[styles.pattern, { backgroundColor: `${theme.accent}08` }]} />
        <Text style={styles.identity}>{theme.identity}</Text>
        <View style={[styles.iconOrb, { backgroundColor: theme.accent }]}>
          <Ionicons name={theme.icon as keyof typeof Ionicons.glyphMap} size={22} color="#FFF" />
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{theme.title}</Text>
        <Text style={styles.caption}>{theme.caption}</Text>
      </GlassSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  tile: { width: HOME_LAYOUT.statTileWidth },
  card: {
    padding: 20,
    minHeight: 168,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pattern: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  identity: {
    position: 'absolute',
    top: 14,
    left: 16,
    ...HOME_TYPE.micro,
    color: HOME_COLORS.inkFaint,
    textTransform: 'uppercase',
  },
  iconOrb: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  value: { ...HOME_TYPE.stat, color: HOME_COLORS.ink, marginBottom: 2 },
  label: { fontSize: 15, fontWeight: '800', color: HOME_COLORS.inkSoft },
  caption: { ...HOME_TYPE.micro, color: HOME_COLORS.inkMuted, marginTop: 4, textTransform: 'none', letterSpacing: 0 },
});
