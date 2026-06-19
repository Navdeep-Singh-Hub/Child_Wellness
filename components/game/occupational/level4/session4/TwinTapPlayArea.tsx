/**
 * Neural sync arena for Twin Tap (OT L4 S4 Game 1).
 */
import { TWIN_TAP_THEME as T } from '@/components/game/occupational/level4/session4/session4Theme';
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
  syncKey: number;
};

export const TwinTapPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  leftLit,
  rightLit,
  syncKey,
}) => {
  const bridgePulse = useSharedValue(0.35);
  const guideScale = useSharedValue(1);

  useEffect(() => {
    if (!roundActive) return;
    bridgePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.25, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [roundActive, bridgePulse]);

  useEffect(() => {
    if (!syncKey) return;
    bridgePulse.value = withSequence(
      withSpring(1.5, { damping: 4, stiffness: 200 }),
      withTiming(0.35, { duration: 600 }),
    );
  }, [syncKey, bridgePulse]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      guideScale.value = 1;
      return;
    }
    guideScale.value = withRepeat(
      withSequence(withTiming(1.12, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
      true,
    );
  }, [showGuide, roundActive, guideScale]);

  const bridgeStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + bridgePulse.value * 0.55,
    transform: [{ scaleX: 0.85 + bridgePulse.value * 0.15 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive ? 0.95 : 0,
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.arenaDark, '#164E63', '#0F172A']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.gridFloor}>
        {[0, 1, 2, 3].map((i) => (
          <View key={`row-${i}`} style={[styles.gridLine, { top: `${20 + i * 18}%` }]} />
        ))}
      </View>

      <Animated.View style={[styles.syncBridge, bridgeStyle]} />
      <View style={styles.syncBridgeCore} />

      <View style={[styles.pedestal, styles.leftPedestal, leftLit && styles.pedestalLit]}>
        <Text style={styles.pedestalLabel}>LEFT</Text>
      </View>
      <View style={[styles.pedestal, styles.rightPedestal, rightLit && styles.pedestalLit]}>
        <Text style={styles.pedestalLabel}>RIGHT</Text>
      </View>

      <Animated.View style={[styles.guideBadge, guideStyle]}>
        <Text style={styles.guideText}>👐 Together!</Text>
      </Animated.View>

      <View style={styles.syncLabel}>
        <Text style={styles.syncLabelText}>SYNC BRIDGE</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  gridFloor: { ...StyleSheet.absoluteFillObject },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(34,211,238,0.08)',
  },
  syncBridge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '44%',
    width: '50%',
    height: 12,
    borderRadius: 6,
    backgroundColor: T.syncGlow,
  },
  syncBridgeCore: {
    position: 'absolute',
    alignSelf: 'center',
    top: '46%',
    width: '42%',
    height: 4,
    borderRadius: 2,
    backgroundColor: T.accentCoral,
    opacity: 0.35,
  },
  pedestal: {
    position: 'absolute',
    bottom: '18%',
    width: '28%',
    height: '14%',
    borderWidth: 2,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  leftPedestal: {
    left: '8%',
    borderColor: T.leftColor,
  },
  rightPedestal: {
    right: '8%',
    borderColor: T.rightColor,
  },
  pedestalLit: {
    backgroundColor: 'rgba(34,211,238,0.15)',
  },
  pedestalLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.accentDark,
  },
  guideBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '32%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(15,23,42,0.8)',
    borderWidth: 1,
    borderColor: T.syncGlow,
  },
  guideText: {
    fontSize: 14,
    fontWeight: '900',
    color: T.accentDark,
  },
  syncLabel: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.3)',
  },
  syncLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: T.syncGlow,
  },
});
