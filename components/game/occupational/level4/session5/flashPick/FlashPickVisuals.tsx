/**
 * Split decision arena for Flash Pick (OT L4 S5 Game 3).
 */
import { FLASH_PICK_THEME as T } from '@/components/game/occupational/level4/session5/flashPick/flashPickTheme';
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

type Hand = 'left' | 'right';

type Props = {
  roundActive: boolean;
  showGuide: boolean;
  flashedSide: Hand | null;
  flashTimeLeft: number;
  flashDurationMs: number;
  pickKey: number;
};

export const FlashPickPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  flashedSide,
  flashTimeLeft,
  flashDurationMs,
  pickKey,
}) => {
  const boltPulse = useSharedValue(0.3);
  const guideScale = useSharedValue(1);
  const pickBurst = useSharedValue(0);

  const timerPct = flashDurationMs > 0 ? (flashTimeLeft / flashDurationMs) * 100 : 0;
  const urgent = flashedSide !== null && timerPct < 35;

  useEffect(() => {
    if (!roundActive || !flashedSide) {
      boltPulse.value = 0.3;
      return;
    }
    boltPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: urgent ? 250 : 500, easing: Easing.out(Easing.quad) }),
        withTiming(0.25, { duration: urgent ? 250 : 500 }),
      ),
      -1,
      true,
    );
  }, [roundActive, flashedSide, urgent, boltPulse]);

  useEffect(() => {
    if (!pickKey) return;
    pickBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [pickKey, pickBurst]);

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

  const boltStyle = useAnimatedStyle(() => ({
    opacity: flashedSide ? 0.3 + boltPulse.value * 0.6 : 0.1,
    transform: [{ scale: 0.9 + boltPulse.value * 0.2 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: pickBurst.value,
    transform: [{ scale: 0.85 + pickBurst.value * 0.3 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.arenaDark, '#450A0A', '#1A0A0A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.centerDivider} />

      <View style={[styles.panelZone, styles.leftZone, flashedSide === 'left' && styles.zoneFlash]}>
        <Text style={[styles.zoneLabel, flashedSide === 'left' && styles.zoneLabelLit]}>LEFT</Text>
      </View>
      <View style={[styles.panelZone, styles.rightZone, flashedSide === 'right' && styles.zoneFlashRed]}>
        <Text style={[styles.zoneLabel, flashedSide === 'right' && styles.zoneLabelLitRed]}>RIGHT</Text>
      </View>

      <Animated.View style={[styles.boltStrike, boltStyle]} pointerEvents="none">
        <Text style={styles.boltEmoji}>⚡</Text>
      </Animated.View>

      {flashedSide ? (
        <View style={styles.pickSignal}>
          <Text style={styles.pickSignalText}>TAP {flashedSide.toUpperCase()}!</Text>
        </View>
      ) : (
        <View style={styles.waitSignal}>
          <Text style={styles.waitSignalText}>WAIT…</Text>
        </View>
      )}

      {flashedSide && (
        <View style={styles.timerBar}>
          <View style={[styles.timerFill, { width: `${timerPct}%`, backgroundColor: urgent ? '#EF4444' : T.boltGlow }]} />
        </View>
      )}

      <Animated.View style={[styles.pickBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.pickBurstText}>⚡ PICKED!</Text>
      </Animated.View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>👀 Watch both sides!</Text>
      </Animated.View>

      <View style={styles.arenaLabel}>
        <Text style={styles.arenaLabelText}>DECISION ARENA</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  centerDivider: {
    position: 'absolute',
    alignSelf: 'center',
    top: '18%',
    bottom: '12%',
    width: 3,
    backgroundColor: 'rgba(251,191,36,0.25)',
    borderRadius: 2,
  },
  panelZone: {
    position: 'absolute',
    top: '20%',
    bottom: '14%',
    width: '42%',
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 12,
  },
  leftZone: {
    left: '5%',
    borderColor: 'rgba(96,165,250,0.3)',
    backgroundColor: 'rgba(59,130,246,0.06)',
  },
  rightZone: {
    right: '5%',
    borderColor: 'rgba(248,113,113,0.3)',
    backgroundColor: 'rgba(239,68,68,0.06)',
  },
  zoneFlash: {
    borderColor: T.accentBlue,
    backgroundColor: 'rgba(59,130,246,0.18)',
    shadowColor: T.accentBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  zoneFlashRed: {
    borderColor: T.accentRed,
    backgroundColor: 'rgba(239,68,68,0.18)',
    shadowColor: T.accentRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  zoneLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: 'rgba(96,165,250,0.5)',
  },
  zoneLabelLit: { color: T.accentDark },
  zoneLabelLitRed: { color: '#FECACA' },
  boltStrike: {
    position: 'absolute',
    alignSelf: 'center',
    top: '32%',
  },
  boltEmoji: { fontSize: 36 },
  pickSignal: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(251,191,36,0.15)',
    borderWidth: 1,
    borderColor: T.boltGlow,
  },
  pickSignalText: { fontSize: 14, fontWeight: '900', color: T.boltGlow, letterSpacing: 1 },
  waitSignal: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(26,10,10,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
  },
  waitSignalText: { fontSize: 13, fontWeight: '800', color: '#94A3B8', letterSpacing: 2 },
  timerBar: {
    position: 'absolute',
    bottom: '18%',
    left: '12%',
    right: '12%',
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(26,10,10,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
    overflow: 'hidden',
  },
  timerFill: { height: '100%', borderRadius: 4 },
  pickBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
  },
  pickBurstText: { fontSize: 20, fontWeight: '900', color: T.boltGlow },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: '24%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(26,10,10,0.88)',
    borderWidth: 1,
    borderColor: T.boltGlow,
  },
  guideText: { fontSize: 14, fontWeight: '900', color: T.accentDark },
  arenaLabel: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(251,191,36,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.35)',
  },
  arenaLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.boltGlow,
  },
});
