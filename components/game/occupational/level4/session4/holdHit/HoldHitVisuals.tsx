/**
 * Split-hand control lab for Hold & Hit (OT L4 S4 Game 5).
 */
import { HOLD_HIT_THEME as T } from '@/components/game/occupational/level4/session4/holdHit/holdHitTheme';
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
  holdSide: 'left' | 'right';
  isHolding: boolean;
  holdPct: number;
  canTap: boolean;
  tapCount: number;
  targetTaps: number;
  hitKey: number;
};

export const HoldHitPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  holdSide,
  isHolding,
  holdPct,
  canTap,
  tapCount,
  targetTaps,
  hitKey,
}) => {
  const linkPulse = useSharedValue(0.35);
  const guideScale = useSharedValue(1);
  const strikePulse = useSharedValue(0.4);

  useEffect(() => {
    if (!roundActive) return;
    linkPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.25, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [roundActive, linkPulse]);

  useEffect(() => {
    if (!canTap) {
      strikePulse.value = 0.4;
      return;
    }
    strikePulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 400 }), withTiming(0.4, { duration: 400 })),
      -1,
      true,
    );
  }, [canTap, strikePulse]);

  useEffect(() => {
    if (!hitKey) return;
    linkPulse.value = withSequence(
      withSpring(1.4, { damping: 5, stiffness: 180 }),
      withTiming(0.35, { duration: 500 }),
    );
  }, [hitKey, linkPulse]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guideScale]);

  const linkStyle = useAnimatedStyle(() => ({
    opacity: 0.15 + linkPulse.value * 0.35,
  }));
  const strikeStyle = useAnimatedStyle(() => ({
    opacity: canTap ? 0.3 + strikePulse.value * 0.5 : 0.1,
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));

  if (!roundActive) return null;

  const anchorLeft = holdSide === 'left';

  return (
    <>
      <LinearGradient
        colors={[T.labDark, '#134E4A', '#0F172A']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.splitZone, styles.anchorZone, anchorLeft ? styles.zoneLeft : styles.zoneRight]} />
      <View style={[styles.splitZone, styles.strikeZone, anchorLeft ? styles.zoneRight : styles.zoneLeft]} />

      <Animated.View style={[styles.splitBridge, linkStyle]} />
      <View style={styles.splitBridgeCore} />

      <View style={[styles.zoneBadge, anchorLeft ? styles.badgeLeft : styles.badgeRight]}>
        <Text style={styles.zoneBadgeText}>⚓ ANCHOR</Text>
      </View>
      <View style={[styles.zoneBadge, anchorLeft ? styles.badgeRight : styles.badgeLeft, styles.strikeBadge]}>
        <Text style={[styles.zoneBadgeText, styles.strikeBadgeText]}>⚡ STRIKE</Text>
      </View>

      {isHolding && (
        <View style={styles.holdMeter}>
          <View style={[styles.holdMeterFill, { width: `${holdPct}%` }]} />
        </View>
      )}

      {canTap && (
        <Animated.View style={[styles.strikeReady, strikeStyle]}>
          <Text style={styles.strikeReadyText}>TAP {targetTaps - tapCount} MORE!</Text>
        </Animated.View>
      )}

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>🤲 Hold + Tap!</Text>
      </Animated.View>

      <View style={styles.labLabel}>
        <Text style={styles.labLabelText}>SPLIT-HAND LAB</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  splitZone: {
    position: 'absolute',
    top: '18%',
    bottom: '14%',
    width: '46%',
    borderRadius: 16,
    borderWidth: 1,
  },
  anchorZone: {
    backgroundColor: 'rgba(20,184,166,0.08)',
    borderColor: 'rgba(45,212,191,0.25)',
  },
  strikeZone: {
    backgroundColor: 'rgba(251,191,36,0.06)',
    borderColor: 'rgba(251,191,36,0.2)',
  },
  zoneLeft: { left: '4%' },
  zoneRight: { right: '4%' },
  splitBridge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '48%',
    width: '20%',
    height: 4,
    borderRadius: 2,
    backgroundColor: T.anchorGlow,
  },
  splitBridgeCore: {
    position: 'absolute',
    alignSelf: 'center',
    top: '49%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: T.strikeGlow,
  },
  zoneBadge: {
    position: 'absolute',
    top: '22%',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(12,26,31,0.75)',
    borderWidth: 1,
    borderColor: T.anchorGlow,
  },
  badgeLeft: { left: '10%' },
  badgeRight: { right: '10%' },
  strikeBadge: { borderColor: T.strikeGlow },
  zoneBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.anchorGlow,
  },
  strikeBadgeText: { color: T.strikeGlow },
  holdMeter: {
    position: 'absolute',
    bottom: '18%',
    left: '12%',
    right: '12%',
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(12,26,31,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.3)',
    overflow: 'hidden',
  },
  holdMeterFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: T.anchorGlow,
  },
  strikeReady: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '24%',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderWidth: 1,
    borderColor: T.strikeGlow,
  },
  strikeReadyText: {
    fontSize: 12,
    fontWeight: '900',
    color: T.strikeGlow,
    letterSpacing: 0.5,
  },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '34%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(12,26,31,0.88)',
    borderWidth: 1,
    borderColor: T.anchorGlow,
  },
  guideText: { fontSize: 14, fontWeight: '900', color: T.accentDark },
  labLabel: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(45,212,191,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(45,212,191,0.3)',
  },
  labLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.anchorGlow,
  },
});
