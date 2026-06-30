/**
 * Sunset away-stadium play area for Return Pass (OT L4 S2 Game 1).
 * Mirrored RTL flow — goal left, kick-off right.
 */
import { RETURN_PASS_THEME as T } from '@/components/game/occupational/level4/session2/returnPass/returnPassTheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  isDragging: boolean;
};

const STRIPE_COUNT = 6;

export const ReturnPassPlayArea: React.FC<Props> = ({ roundActive, showGuide, isDragging }) => {
  const goalGlow = useSharedValue(0.6);
  const arrowX = useSharedValue(0);
  const sunset = useSharedValue(0.4);

  useEffect(() => {
    if (!roundActive) return;
    goalGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.55, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    sunset.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.35, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [roundActive, goalGlow, sunset]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      arrowX.value = 0;
      return;
    }
    arrowX.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: 650, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 650, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      true,
    );
  }, [showGuide, roundActive, arrowX]);

  const goalGlowStyle = useAnimatedStyle(() => ({ opacity: goalGlow.value }));
  const sunsetStyle = useAnimatedStyle(() => ({ opacity: sunset.value }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
    opacity: showGuide && roundActive && !isDragging ? 0.9 : 0,
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.pitchDark, T.pitchLight, T.pitchDark]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.sunsetWash, sunsetStyle]} />

      {Array.from({ length: STRIPE_COUNT }).map((_, i) => (
        <View
          key={`stripe-${i}`}
          style={[
            styles.grassStripe,
            { top: `${8 + i * (84 / STRIPE_COUNT)}%`, opacity: i % 2 === 0 ? 0.07 : 0.04 },
          ]}
        />
      ))}

      <View style={styles.centerLine} />
      <View style={styles.centerCircle} />

      <View style={[styles.penaltyBox, styles.goalZone]}>
        <Animated.View style={[styles.goalGlowRing, goalGlowStyle]} />
        <View style={styles.goalFrame}>
          <View style={[styles.goalPost, styles.goalPostLeft]} />
          <View style={[styles.goalPost, styles.goalPostRight]} />
          <View style={styles.goalCrossbar} />
          <LinearGradient colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.05)']} style={styles.goalNet}>
            <Text style={styles.goalLabel}>HOME</Text>
          </LinearGradient>
        </View>
      </View>

      <View style={[styles.penaltyBox, styles.kickZone]}>
        <Text style={styles.zoneTag}>KICK</Text>
        <View style={styles.kickSpot} />
      </View>

      <View style={styles.crowdRow}>
        {['🧣', '🧑', '👧', '🧒', '👦', '🧑', '👩', '🧣'].map((e, i) => (
          <Text key={`fan-${i}`} style={[styles.crowdEmoji, { opacity: 0.35 + (i % 3) * 0.15 }]}>
            {e}
          </Text>
        ))}
      </View>

      <Animated.View style={[styles.passArrow, arrowStyle]}>
        <Text style={styles.passArrowText}>⬅</Text>
        <Text style={styles.passArrowHint}>Slide home</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  sunsetWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.sunsetGlow,
  },
  grassStripe: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '14%',
    backgroundColor: '#fff',
  },
  centerLine: {
    position: 'absolute',
    left: '50%',
    top: '10%',
    bottom: '10%',
    width: 2,
    marginLeft: -1,
    backgroundColor: T.pitchLine,
    opacity: 0.55,
  },
  centerCircle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 56,
    height: 56,
    marginLeft: -28,
    marginTop: -28,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: T.pitchLine,
    opacity: 0.45,
  },
  penaltyBox: {
    position: 'absolute',
    top: '18%',
    height: '64%',
    borderWidth: 2,
    borderColor: T.pitchLine,
    borderRadius: 4,
    opacity: 0.85,
  },
  goalZone: {
    left: '4%',
    width: '24%',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: T.goalGold,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  kickZone: {
    right: '4%',
    width: '22%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  zoneTag: {
    position: 'absolute',
    top: 10,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.pitchLine,
  },
  kickSpot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: T.pitchLine,
    opacity: 0.7,
  },
  goalGlowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    backgroundColor: T.goalGold,
    transform: [{ scale: 1.06 }],
  },
  goalFrame: {
    width: '88%',
    height: '78%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  goalPost: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: '72%',
    backgroundColor: T.goalGold,
    borderRadius: 2,
  },
  goalPostLeft: { left: 0 },
  goalPostRight: { right: 0 },
  goalCrossbar: {
    position: 'absolute',
    top: '28%',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: T.goalGold,
    borderRadius: 2,
  },
  goalNet: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    right: 4,
    height: '70%',
    borderWidth: 1,
    borderColor: 'rgba(253,224,71,0.35)',
    borderStyle: 'dashed',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalLabel: {
    color: T.goalGold,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  crowdRow: {
    position: 'absolute',
    top: 6,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  crowdEmoji: { fontSize: 11 },
  passArrow: {
    position: 'absolute',
    right: '28%',
    top: '44%',
    alignItems: 'center',
  },
  passArrowText: {
    fontSize: 32,
    color: T.goalGold,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  passArrowHint: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },
});
