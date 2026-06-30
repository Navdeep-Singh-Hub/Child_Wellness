/**
 * Split-brain number backdrop for Odd Even Tap (OT L4 S8 Game 4).
 */
import { ODD_EVEN_TAP_THEME as T } from '@/components/game/occupational/level4/session8/oddEvenTap/oddEvenTapTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  countKey: number;
  countNumber: number | null;
};

export const OddEvenTapPlayArea: React.FC<Props> = ({ roundActive, showGuide, countKey, countNumber }) => {
  const splitPulse = useSharedValue(0.2);
  const guideScale = useSharedValue(1);
  const matchBurst = useSharedValue(0);

  const isOdd = countNumber !== null && countNumber % 2 === 1;

  useEffect(() => {
    if (!roundActive) return;
    splitPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [roundActive, splitPulse]);

  useEffect(() => {
    if (!countKey) return;
    matchBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [countKey, matchBurst]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guideScale]);

  const splitStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + splitPulse.value * 0.45,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: matchBurst.value,
    transform: [{ scale: 0.85 + matchBurst.value * 0.35 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#450A0A', '#1A0A14', '#1E3A8A']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.splitLine, splitStyle]} />

      <View style={styles.oddZone}>
        <Text style={styles.zoneLabel}>ODD → LEFT</Text>
        <Text style={styles.zoneEmoji}>1️⃣ 3️⃣ 5️⃣</Text>
      </View>
      <View style={styles.evenZone}>
        <Text style={styles.zoneLabel}>EVEN → RIGHT</Text>
        <Text style={styles.zoneEmoji}>2️⃣ 4️⃣ 6️⃣</Text>
      </View>

      {countNumber !== null && (
        <View style={[styles.typeBadge, isOdd ? styles.oddBadge : styles.evenBadge]}>
          <Text style={styles.typeText}>{isOdd ? 'ODD' : 'EVEN'}</Text>
        </View>
      )}

      <Animated.View style={[styles.matchGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>🔢 ODD ← · → EVEN</Text>
        <Text style={styles.guideSub}>Read the number!</Text>
      </Animated.View>

      <Animated.View style={[styles.matchBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ MATCH ✦</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  splitLine: {
    position: 'absolute',
    alignSelf: 'center',
    top: '16%',
    bottom: '16%',
    width: 3,
    borderRadius: 2,
    backgroundColor: T.accent,
  },
  oddZone: {
    position: 'absolute',
    left: '6%',
    top: '18%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(69,10,10,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  evenZone: {
    position: 'absolute',
    right: '6%',
    top: '18%',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(30,58,138,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.35)',
    alignItems: 'flex-end',
  },
  zoneLabel: { fontSize: 9, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  zoneEmoji: { fontSize: 11, marginTop: 4 },
  typeBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  oddBadge: {
    backgroundColor: 'rgba(69,10,10,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.45)',
  },
  evenBadge: {
    backgroundColor: 'rgba(30,58,138,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.45)',
  },
  typeText: { fontSize: 11, fontWeight: '900', color: '#FFF1F2' },
  matchGuide: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 24,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(26,10,20,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.45)',
  },
  guideText: { fontSize: 15, fontWeight: '900', color: '#FFF1F2' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  matchBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '56%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(251,113,133,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#FFF1F2', letterSpacing: 1 },
});
