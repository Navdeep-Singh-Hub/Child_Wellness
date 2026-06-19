/**
 * Cosmic star-field play area for Star Sweep (OT L4 S2 Game 2).
 */
import { STAR_SWEEP_THEME as T } from '@/components/game/occupational/level4/session2/session2Theme';
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
  collectKey: number;
  collectedCount: number;
  starEmoji: string;
};

const BG_STARS = [
  { top: '12%', left: '8%', s: 3 },
  { top: '22%', left: '42%', s: 2 },
  { top: '18%', left: '78%', s: 3 },
  { top: '55%', left: '15%', s: 2 },
  { top: '68%', left: '55%', s: 3 },
  { top: '78%', left: '85%', s: 2 },
  { top: '40%', left: '90%', s: 2 },
];

export const StarSweepPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  isDragging,
  collectKey,
  collectedCount,
  starEmoji,
}) => {
  const twinkle = useSharedValue(0.4);
  const bagGlow = useSharedValue(0.5);
  const arrowX = useSharedValue(0);
  const nebulaDrift = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    twinkle.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    bagGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 }),
      ),
      -1,
      true,
    );
    nebulaDrift.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-8, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [roundActive, twinkle, bagGlow, nebulaDrift]);

  useEffect(() => {
    if (!collectKey) return;
    bagGlow.value = withSequence(
      withSpring(1.3, { damping: 6, stiffness: 200 }),
      withTiming(0.5, { duration: 500 }),
    );
  }, [collectKey, bagGlow]);

  useEffect(() => {
    if (!showGuide || !roundActive) {
      arrowX.value = 0;
      return;
    }
    arrowX.value = withRepeat(
      withSequence(
        withTiming(-16, { duration: 580, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 580, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      true,
    );
  }, [showGuide, roundActive, arrowX]);

  const twinkleStyle = useAnimatedStyle(() => ({ opacity: 0.35 + twinkle.value * 0.5 }));
  const bagGlowStyle = useAnimatedStyle(() => ({ opacity: 0.25 + bagGlow.value * 0.5 }));
  const nebulaStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: nebulaDrift.value }],
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowX.value }],
    opacity: showGuide && roundActive && !isDragging ? 0.92 : 0,
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={[T.spaceDark, '#1E1B4B', '#312E81']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.nebulaCloud, styles.nebulaLeft, nebulaStyle]} />
      <Animated.View style={[styles.nebulaCloud, styles.nebulaRight, nebulaStyle]} />

      {BG_STARS.map((st, i) => (
        <Animated.View
          key={`bg-star-${i}`}
          style={[
            styles.bgStar,
            twinkleStyle,
            {
              top: st.top,
              left: st.left,
              width: st.s,
              height: st.s,
              opacity: 0.4 + (i % 3) * 0.2,
            },
          ]}
        />
      ))}

      <View style={styles.milkyBand} />

      <View style={styles.constellation}>
        {['·', '✦', '·', '✦', '·', '✦'].map((c, i) => (
          <Text key={`const-${i}`} style={[styles.constDot, { opacity: 0.25 + (i % 2) * 0.2 }]}>
            {c}
          </Text>
        ))}
      </View>

      <View style={styles.bagZone}>
        <Animated.View style={[styles.bagGlow, bagGlowStyle]} />
        <View style={styles.cosmicBag}>
          <Text style={styles.bagEmoji}>🎒</Text>
          <View style={styles.collectedRow}>
            {Array.from({ length: Math.min(6, collectedCount) }).map((_, i) => (
              <Text key={`cstar-${i}`} style={styles.collectedStar}>
                {i % 2 === 0 ? '⭐' : '✨'}
              </Text>
            ))}
          </View>
        </View>
        <Text style={styles.bagLabel}>COSMIC BAG</Text>
      </View>

      <View style={styles.nebulaCradle}>
        <Text style={styles.cradleLabel}>STAR</Text>
        {!isDragging && <Text style={styles.cradleStar}>{starEmoji}</Text>}
        <View style={styles.cradleRing} />
      </View>

      <Animated.View style={[styles.sweepArrow, arrowStyle]}>
        <Text style={styles.sweepArrowText}>⬅</Text>
        <Text style={styles.sweepArrowHint}>Sweep to bag</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  nebulaCloud: {
    position: 'absolute',
    width: '45%',
    height: '38%',
    borderRadius: 999,
    opacity: 0.22,
  },
  nebulaLeft: {
    left: '-8%',
    top: '8%',
    backgroundColor: T.nebulaPink,
  },
  nebulaRight: {
    right: '-10%',
    bottom: '10%',
    backgroundColor: T.accentViolet,
  },
  bgStar: {
    position: 'absolute',
    borderRadius: 99,
    backgroundColor: '#fff',
  },
  milkyBand: {
    position: 'absolute',
    left: '-10%',
    right: '-10%',
    top: '38%',
    height: '18%',
    backgroundColor: 'rgba(196,181,253,0.06)',
    transform: [{ rotate: '-8deg' }],
  },
  constellation: {
    position: 'absolute',
    left: '28%',
    right: '28%',
    top: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  constDot: { fontSize: 14, color: T.accent },
  bagZone: {
    position: 'absolute',
    left: '5%',
    top: '28%',
    width: '26%',
    height: '52%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: T.accent,
    transform: [{ scale: 1.08 }],
  },
  cosmicBag: {
    width: '88%',
    height: '72%',
    borderWidth: 2,
    borderColor: T.accentViolet,
    borderRadius: 16,
    backgroundColor: 'rgba(91,33,182,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  bagEmoji: { fontSize: 34 },
  collectedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 2,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  collectedStar: { fontSize: 10 },
  bagLabel: {
    marginTop: 6,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: T.accent,
  },
  nebulaCradle: {
    position: 'absolute',
    right: '6%',
    top: '30%',
    width: '24%',
    height: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(196,181,253,0.35)',
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: 'rgba(30,16,51,0.6)',
  },
  cradleLabel: {
    position: 'absolute',
    top: 10,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    color: T.accentViolet,
  },
  cradleStar: { fontSize: 36, marginTop: 8 },
  cradleRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(252,211,77,0.25)',
  },
  sweepArrow: {
    position: 'absolute',
    right: '30%',
    top: '46%',
    alignItems: 'center',
  },
  sweepArrowText: {
    fontSize: 30,
    color: T.accent,
    fontWeight: '900',
    textShadowColor: T.accentViolet,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sweepArrowHint: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(226,232,240,0.88)',
  },
});
