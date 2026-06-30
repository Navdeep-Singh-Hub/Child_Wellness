/**
 * Thunder Forge atmospheric scene — animated forge core, coils, sparks, steam.
 */
import { TF } from './thunderForgeTokens';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = { reduceMotion?: boolean; charging?: boolean };

export function ThunderForgeBackdrop({ reduceMotion = false, charging = false }: Props) {
  const corePulse = useSharedValue(0);
  const sparkDrift = useSharedValue(0);
  const steamRise = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      corePulse.value = charging ? 0.7 : 0.35;
      return;
    }
    corePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: charging ? 900 : 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: charging ? 900 : 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    sparkDrift.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1, false);
    steamRise.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.linear }), -1, false);
  }, [reduceMotion, charging, corePulse, sparkDrift, steamRise]);

  const coreStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + corePulse.value * (charging ? 0.45 : 0.25),
    transform: [{ scale: 1 + corePulse.value * (charging ? 0.18 : 0.08) }],
  }));

  const sparkStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -sparkDrift.value * 24 }],
    opacity: 0.3 + (1 - sparkDrift.value) * 0.5,
  }));

  const steamStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -steamRise.value * 40 }],
    opacity: 0.15 + (1 - steamRise.value) * 0.25,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={[...TF.bg]} style={StyleSheet.absoluteFillObject} />
      {/* Floor glow */}
      <View style={styles.floorGlow} />
      {/* Reactor coils */}
      {[0.12, 0.38, 0.64].map((left, i) => (
        <View key={i} style={[styles.coil, { left: `${left * 100}%`, borderColor: `${TF.accentBright}33` }]} />
      ))}
      {/* Core */}
      <Animated.View style={[styles.coreOuter, coreStyle]}>
        <View style={styles.coreInner} />
      </Animated.View>
      {/* Sparks */}
      {!reduceMotion &&
        [0.18, 0.52, 0.78].map((left, i) => (
          <Animated.View key={`s${i}`} style={[styles.spark, sparkStyle, { left: `${left * 100}%`, top: `${22 + i * 8}%` }]} />
        ))}
      {/* Steam wisps */}
      {!reduceMotion && (
        <>
          <Animated.View style={[styles.steam, steamStyle, { left: '28%' }]} />
          <Animated.View style={[styles.steam, steamStyle, { left: '62%', width: 48, height: 48 }]} />
        </>
      )}
      {/* Vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.35)']}
        style={styles.vignette}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  floorGlow: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: '28%',
    backgroundColor: TF.accent,
    opacity: 0.08,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
  },
  coil: {
    position: 'absolute',
    top: '18%',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: 'rgba(245,158,11,0.06)',
  },
  coreOuter: {
    position: 'absolute',
    alignSelf: 'center',
    top: '6%',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: TF.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: TF.molten,
    borderWidth: 3,
    borderColor: TF.accentBright,
  },
  spark: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TF.accentGlow,
  },
  steam: {
    position: 'absolute',
    bottom: '32%',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: TF.steam,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
  },
});
