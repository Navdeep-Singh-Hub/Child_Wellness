/**
 * Balance scale backdrop for Even Pull (OT L4 S9 Game 5).
 */
import { EVEN_PULL_THEME as T } from '@/components/game/occupational/level4/session9/evenPull/evenPullTheme';
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
  balanceKey: number;
  targetY: number;
};

export const EvenPullPlayArea: React.FC<Props> = ({ roundActive, showGuide, balanceKey, targetY }) => {
  const scalePulse = useSharedValue(0.2);
  const guideScale = useSharedValue(1);
  const balanceBurst = useSharedValue(0);
  const leftBeam = useSharedValue(0);
  const rightBeam = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    scalePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    leftBeam.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0.3, { duration: 700 })),
      -1,
      true,
    );
    rightBeam.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      true,
    );
  }, [roundActive, leftBeam, rightBeam, scalePulse]);

  useEffect(() => {
    if (!balanceKey) return;
    balanceBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [balanceKey, balanceBurst]);

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

  const beamStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + scalePulse.value * 0.4,
  }));
  const leftPanStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + leftBeam.value * 0.5,
    transform: [{ translateY: leftBeam.value * 4 }],
  }));
  const rightPanStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + rightBeam.value * 0.5,
    transform: [{ translateY: rightBeam.value * 4 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: balanceBurst.value,
    transform: [{ scale: 0.85 + balanceBurst.value * 0.35 }],
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

      <View style={styles.fulcrum}>
        <Text style={styles.fulcrumText}>⚖️</Text>
      </View>

      <Animated.View style={[styles.beam, beamStyle]} />

      <Animated.View style={[styles.leftPan, leftPanStyle]}>
        <Text style={styles.panLabel}>LEFT</Text>
      </Animated.View>
      <Animated.View style={[styles.rightPan, rightPanStyle]}>
        <Text style={styles.panLabel}>RIGHT</Text>
      </Animated.View>

      <View style={[styles.balanceGlow, { top: targetY - 6 }]} />

      <Animated.View style={[styles.balanceGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>⚖️ SAME SPEED DOWN!</Text>
        <Text style={styles.guideSub}>Hit the balance line together</Text>
      </Animated.View>

      <Animated.View style={[styles.balanceBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ BALANCED! ✦</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  fulcrum: {
    position: 'absolute',
    alignSelf: 'center',
    top: '14%',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(26,10,20,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(251,113,133,0.4)',
  },
  fulcrumText: { fontSize: 24 },
  beam: {
    position: 'absolute',
    alignSelf: 'center',
    top: '22%',
    width: '70%',
    height: 4,
    borderRadius: 2,
    backgroundColor: T.balanceGlow,
  },
  leftPan: {
    position: 'absolute',
    left: '12%',
    top: '26%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(69,10,10,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
  },
  rightPan: {
    position: 'absolute',
    right: '12%',
    top: '26%',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(30,58,138,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.4)',
  },
  panLabel: { fontSize: 9, fontWeight: '900', color: T.accentDark, letterSpacing: 0.5 },
  balanceGlow: {
    position: 'absolute',
    left: '8%',
    right: '8%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(251,113,133,0.25)',
  },
  balanceGuide: {
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
  balanceBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '48%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(251,113,133,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#FFF1F2', letterSpacing: 1 },
});
