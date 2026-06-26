import AnimatedAccuracyRing from '@/components/AnimatedAccuracyRing';
import { HOME_COLORS, HOME_GRADIENTS, HOME_TYPE } from '@/constants/homeDesign';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { GlassSurface } from './GlassSurface';

type Props = {
  levelLabel: string;
  streak: number;
  bestStreak: number;
  accuracy: number;
};

export function HomeProgressHero({ levelLabel, streak, bestStreak, accuracy }: Props) {
  const enter = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(enter, { toValue: 1, friction: 7, tension: 42, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(shimmer, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ),
    ]).start();
  }, [enter, shimmer]);

  const shimmerX = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-120, 220] });

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [
          { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
          { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
        ],
      }}
    >
      <GlassSurface dark glow={HOME_COLORS.violet} style={styles.card}>
        <LinearGradient colors={[...HOME_GRADIENTS.hero]} style={StyleSheet.absoluteFill} />
        <LinearGradient
          colors={[...HOME_GRADIENTS.heroGlow]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}>
          <LinearGradient colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <View style={styles.content}>
          <View style={styles.left}>
            <View style={styles.levelPill}>
              <Ionicons name="sparkles" size={14} color="#C4B5FD" />
              <Text style={styles.levelText}>{levelLabel}</Text>
            </View>
            <Text style={styles.title}>Your progress shines</Text>
            <Text style={styles.subtitle}>Every session builds body awareness and confidence.</Text>
            <View style={styles.pills}>
              <View style={styles.pill}>
                <Ionicons name="flame" size={16} color="#FDBA74" />
                <Text style={styles.pillText}>{streak} day{streak !== 1 ? 's' : ''} streak</Text>
              </View>
              {bestStreak > streak ? (
                <View style={[styles.pill, styles.pillMuted]}>
                  <Ionicons name="trophy" size={14} color="#FDE68A" />
                  <Text style={[styles.pillText, { color: '#FDE68A' }]}>Best {bestStreak}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.ringWrap}>
            <AnimatedAccuracyRing
              value={accuracy}
              size={118}
              stroke={12}
              progressColor="#A78BFA"
              trackColor="rgba(255,255,255,0.15)"
              label="Accuracy"
              durationMs={1400}
            />
          </View>
        </View>
      </GlassSurface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 24, minHeight: 188 },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    opacity: 0.8,
  },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flex: 1, paddingRight: 12 },
  ringWrap: { marginLeft: 4 },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 14,
  },
  levelText: { color: '#E9D5FF', fontSize: 12, fontWeight: '800' },
  title: { ...HOME_TYPE.h1, color: '#FFFFFF', fontSize: 22, marginBottom: 8 },
  subtitle: { ...HOME_TYPE.caption, color: 'rgba(226, 232, 240, 0.85)', marginBottom: 16 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pillMuted: { backgroundColor: 'rgba(251, 191, 36, 0.12)' },
  pillText: { color: '#FFEDD5', fontSize: 13, fontWeight: '800' },
});
