/**
 * Memory chain backdrop for Arrow Chain (OT L4 S7 Game 4).
 */
import { ARROW_CHAIN_THEME as T } from '@/components/game/occupational/level4/session7/session7Theme';
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
  chainKey: number;
  revealedCount: number;
  sequenceLength: number;
  stepIndex: number;
  inputReady: boolean;
};

export const ArrowChainPlayArea: React.FC<Props> = ({
  roundActive,
  showGuide,
  chainKey,
  revealedCount,
  sequenceLength,
  stepIndex,
  inputReady,
}) => {
  const linkPulse = useSharedValue(0.2);
  const flowAnim = useSharedValue(0);
  const guideScale = useSharedValue(1);
  const chainBurst = useSharedValue(0);

  useEffect(() => {
    if (!roundActive) return;
    linkPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 700, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    flowAnim.value = withRepeat(
      withSequence(withTiming(1, { duration: 1000 }), withTiming(0, { duration: 100 })),
      -1,
      false,
    );
  }, [roundActive, flowAnim, linkPulse]);

  useEffect(() => {
    if (!chainKey) return;
    chainBurst.value = withSequence(
      withSpring(1, { damping: 5, stiffness: 200 }),
      withTiming(0, { duration: 450 }),
    );
  }, [chainKey, chainBurst]);

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

  const linkStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + linkPulse.value * 0.55,
    transform: [{ scaleX: 0.9 + linkPulse.value * 0.1 }],
  }));
  const flowStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + flowAnim.value * 0.6,
    transform: [{ translateX: -20 + flowAnim.value * 40 }],
  }));
  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guideScale.value }],
    opacity: showGuide && roundActive && inputReady ? 0.95 : 0,
  }));
  const burstStyle = useAnimatedStyle(() => ({
    opacity: chainBurst.value,
    transform: [{ scale: 0.85 + chainBurst.value * 0.35 }],
  }));

  if (!roundActive) return null;

  return (
    <>
      <LinearGradient
        colors={['#022C22', '#064E3B', '#047857']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.chainLink, styles.linkTop, linkStyle]} />
      <Animated.View style={[styles.chainLink, styles.linkBot, linkStyle]} />

      <Animated.View style={[styles.flowDots, flowStyle]}>
        <Text style={styles.flowText}>● ━ ● ━ ●</Text>
      </Animated.View>

      <View style={styles.stepDots}>
        {Array.from({ length: sequenceLength }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.stepDot,
              revealedCount > i && styles.stepDotLit,
              inputReady && stepIndex > i && styles.stepDotDone,
              inputReady && stepIndex === i && styles.stepDotActive,
            ]}
          />
        ))}
      </View>

      <Animated.View style={[styles.chainGuide, guideStyle]} pointerEvents="none">
        <Text style={styles.guideText}>🔗 WATCH → TAP</Text>
        <Text style={styles.guideSub}>Opposite hand, in order!</Text>
      </Animated.View>

      <Animated.View style={[styles.chainBurst, burstStyle]} pointerEvents="none">
        <Text style={styles.burstText}>✦ CHAIN ✦</Text>
      </Animated.View>

      {!inputReady && (
        <Text style={styles.revealHint}>
          {revealedCount > 0 ? `Linking… (${revealedCount}/${sequenceLength})` : 'Watch the chain…'}
        </Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  chainLink: {
    position: 'absolute',
    alignSelf: 'center',
    height: 3,
    borderRadius: 2,
    backgroundColor: T.linkGlow,
  },
  linkTop: { top: '28%', left: '18%', right: '18%' },
  linkBot: { top: '34%', left: '22%', right: '22%', height: 2, opacity: 0.6 },
  flowDots: { position: 'absolute', alignSelf: 'center', top: '30%' },
  flowText: { fontSize: 14, fontWeight: '800', color: T.accentDark, letterSpacing: 3 },
  stepDots: {
    position: 'absolute',
    alignSelf: 'center',
    top: '52%',
    flexDirection: 'row',
    gap: 12,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(52,211,153,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.35)',
  },
  stepDotLit: { backgroundColor: 'rgba(52,211,153,0.45)' },
  stepDotDone: { backgroundColor: T.accent },
  stepDotActive: {
    borderColor: '#FDE047',
    borderWidth: 2,
    transform: [{ scale: 1.25 }],
  },
  chainGuide: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 130,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(2,44,34,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.45)',
  },
  guideText: { fontSize: 16, fontWeight: '900', color: '#ECFDF5' },
  guideSub: { fontSize: 11, fontWeight: '700', color: T.subtitleColor, marginTop: 2 },
  chainBurst: {
    position: 'absolute',
    alignSelf: 'center',
    top: '44%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(52,211,153,0.35)',
  },
  burstText: { fontSize: 16, fontWeight: '900', color: '#ECFDF5', letterSpacing: 1 },
  revealHint: {
    position: 'absolute',
    alignSelf: 'center',
    top: '58%',
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(167,243,208,0.75)',
  },
});
