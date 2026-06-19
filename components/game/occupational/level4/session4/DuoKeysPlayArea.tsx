/**
 * Concert hall stage for Duo Keys (OT L4 S4 Game 2).
 */
import { DUO_KEYS_THEME as T } from '@/components/game/occupational/level4/session4/session4Theme';
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
  leftLit: boolean;
  rightLit: boolean;
  chordKey: number;
  timerPct: number;
};

export const DuoKeysPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  leftLit,
  rightLit,
  chordKey,
  timerPct,
}) => {
  const spotlight = useSharedValue(0.5);
  const guideScale = useSharedValue(1);
  const noteBurst = useSharedValue(0);

  const urgent = timerPct < 28;

  useEffect(() => {
    if (!roundActive) return;
    spotlight.value = withRepeat(
      withSequence(
        withTiming(urgent ? 1 : 0.75, { duration: urgent ? 400 : 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(urgent ? 0.35 : 0.45, { duration: urgent ? 400 : 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [roundActive, urgent, spotlight]);

  useEffect(() => {
    if (!chordKey) return;
    noteBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 180 }),
      withTiming(0, { duration: 500 }),
    );
  }, [chordKey, noteBurst]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 520 }), withTiming(1, { duration: 520 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guideScale]);

  const spotlightStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + spotlight.value * 0.35,
    transform: [{ scaleX: 0.6 + spotlight.value * 0.25 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const noteStyle = useAnimatedStyle(() => ({
    opacity: noteBurst.value,
    transform: [{ translateY: -noteBurst.value * 40 }, { scale: 0.8 + noteBurst.value * 0.4 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.stageDark, '#3D1515', '#292524']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.curtain, styles.curtainLeft]} />
      <View style={[styles.curtain, styles.curtainRight]} />

      <Animated.View style={[styles.spotlight, spotlightStyle]} />
      <View style={styles.spotlightCore} />

      {[0, 1, 2, 3].map((i) => (
        <View key={`staff-${i}`} style={[styles.staffLine, { top: `${22 + i * 5}%` }]} />
      ))}

      <View style={styles.pianoBody}>
        <View style={styles.pianoLid} />
        <View style={[styles.pianoKeySlot, styles.pianoKeyLeft, leftLit && styles.keySlotLit]} />
        <View style={[styles.pianoKeySlot, styles.pianoKeyRight, rightLit && styles.keySlotLit]} />
      </View>

      <Animated.View style={[styles.noteBurst, noteStyle]} pointerEvents="none">
        <Text style={styles.noteBurstText}>🎵 ✨ 🎵</Text>
      </Animated.View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>🎹 Both keys!</Text>
      </Animated.View>

      <View style={styles.stageLabel}>
        <Text style={styles.stageLabelText}>CONCERT STAGE</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  curtain: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '18%',
    backgroundColor: T.curtainRed,
    opacity: 0.85,
  },
  curtainLeft: { left: 0, borderTopRightRadius: 8 },
  curtainRight: { right: 0, borderTopLeftRadius: 8 },
  spotlight: {
    position: 'absolute',
    alignSelf: 'center',
    top: 0,
    width: '70%',
    height: '55%',
    backgroundColor: T.spotlight,
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
  },
  spotlightCore: {
    position: 'absolute',
    alignSelf: 'center',
    top: '8%',
    width: '30%',
    height: '20%',
    borderRadius: 999,
    backgroundColor: T.accentGold,
    opacity: 0.12,
  },
  staffLine: {
    position: 'absolute',
    left: '22%',
    right: '22%',
    height: 1,
    backgroundColor: 'rgba(254,243,199,0.12)',
  },
  pianoBody: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '22%',
    backgroundColor: '#292524',
    borderTopWidth: 2,
    borderTopColor: 'rgba(245,158,11,0.35)',
  },
  pianoLid: {
    position: 'absolute',
    top: -8,
    left: '12%',
    right: '12%',
    height: 10,
    borderRadius: 4,
    backgroundColor: '#44403C',
  },
  pianoKeySlot: {
    position: 'absolute',
    top: 8,
    width: '22%',
    height: '55%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(254,243,199,0.2)',
    backgroundColor: 'rgba(255,251,235,0.08)',
  },
  pianoKeyLeft: { left: '24%' },
  pianoKeyRight: { right: '24%' },
  keySlotLit: {
    backgroundColor: 'rgba(251,191,36,0.35)',
    borderColor: T.accentGold,
  },
  noteBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '28%',
  },
  noteBurstText: { fontSize: 22, fontWeight: '900' },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '34%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(28,10,10,0.85)',
    borderWidth: 1,
    borderColor: T.accentGold,
  },
  guideText: { fontSize: 14, fontWeight: '900', color: T.accentDark },
  stageLabel: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
  },
  stageLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.accent,
  },
});
