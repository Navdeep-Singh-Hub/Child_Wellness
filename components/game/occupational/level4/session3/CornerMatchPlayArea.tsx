/**
 * Prism vault backdrop for Corner Match (OT L4 S3 Game 5).
 */
import { CORNER_MATCH_THEME as T } from '@/components/game/occupational/level4/session3/session3Theme';
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
  isDragging: boolean;
  matchEmoji: string;
  matchKey: number;
};

export const CornerMatchPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  isDragging,
  matchEmoji,
  matchKey,
}) => {
  const prismPulse = useSharedValue(0.4);
  const toGlow = useSharedValue(0.5);
  const arrowT = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    prismPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.25, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    toGlow.value = withRepeat(
      withSequence(withTiming(1, { duration: 750 }), withTiming(0.35, { duration: 750 })),
      -1,
      true,
    );
  }, [roundActive, prismPulse, toGlow]);

  useEffect(() => {
    if (!matchKey) return;
    toGlow.value = withSequence(
      withSpring(1.4, { damping: 5, stiffness: 180 }),
      withTiming(0.5, { duration: 500 }),
    );
  }, [matchKey, toGlow]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      arrowT.value = 0;
      return;
    }
    arrowT.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 650, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 650, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      true,
    );
  }, [showGuide, roundActive, arrowT]);

  const prismStyle = useAnimatedStyle(() => ({ opacity: 0.2 + prismPulse.value * 0.4 }));
  const toStyle = useAnimatedStyle(() => ({ opacity: 0.3 + toGlow.value * 0.5 }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: arrowT.value * 24 },
      { translateY: arrowT.value * 18 },
    ],
    opacity: showGuide && roundActive && !isDragging ? 0.9 : 0,
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.vaultDark, T.velvet, '#7F1D1D']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.velvetSheen} />

      <Animated.View style={[styles.prismBeam, prismStyle]} />
      <View style={styles.prismBeamCore} />

      <View style={styles.fromPedestal}>
        <Text style={styles.pedestalLabel}>FROM</Text>
        <View style={styles.pedestalGem}>
          <Text style={styles.pedestalEmoji}>{matchEmoji}</Text>
        </View>
      </View>

      <View style={styles.toPedestal}>
        <Animated.View style={[styles.toGlow, toStyle]} />
        <Text style={styles.pedestalLabel}>MATCH</Text>
        <View style={[styles.pedestalGem, styles.pedestalGemTarget]}>
          <Text style={styles.pedestalEmoji}>{matchEmoji}</Text>
        </View>
      </View>

      {[0, 1, 2, 3].map((i) => (
        <View
          key={`spark-${i}`}
          style={[
            styles.prismSpark,
            { left: `${20 + i * 18}%`, top: `${12 + (i % 2) * 8}%` },
          ]}
        />
      ))}

      <Animated.View style={[styles.matchArrow, arrowStyle]}>
        <Text style={styles.arrowEmoji}>↘</Text>
        <Text style={styles.arrowHint}>Match gem</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  velvetSheen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  prismBeam: {
    position: 'absolute',
    left: '14%',
    top: '20%',
    width: '72%',
    height: 8,
    borderRadius: 4,
    backgroundColor: T.prismGlow,
    transform: [{ rotate: '32deg' }],
  },
  prismBeamCore: {
    position: 'absolute',
    left: '16%',
    top: '22%',
    width: '68%',
    height: 3,
    borderRadius: 2,
    backgroundColor: T.accent,
    opacity: 0.4,
    transform: [{ rotate: '32deg' }],
  },
  fromPedestal: {
    position: 'absolute',
    left: '5%',
    top: '8%',
    width: '26%',
    height: '26%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.accentGold,
    borderRadius: 14,
    backgroundColor: 'rgba(26,10,20,0.55)',
  },
  toPedestal: {
    position: 'absolute',
    right: '5%',
    bottom: '8%',
    width: '28%',
    height: '28%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.accent,
    borderRadius: 14,
    backgroundColor: 'rgba(26,10,20,0.55)',
    overflow: 'hidden',
  },
  toGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.accent,
  },
  pedestalLabel: {
    position: 'absolute',
    top: 8,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.accentDark,
  },
  pedestalGem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: T.accentGold,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  pedestalGemTarget: {
    borderColor: T.accent,
    zIndex: 2,
  },
  pedestalEmoji: { fontSize: 28 },
  prismSpark: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.prismGlow,
    opacity: 0.5,
  },
  matchArrow: {
    position: 'absolute',
    left: '40%',
    top: '40%',
    alignItems: 'center',
    zIndex: 4,
  },
  arrowEmoji: { fontSize: 32, color: '#FECDD3' },
  arrowHint: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: T.accentDark,
  },
});
