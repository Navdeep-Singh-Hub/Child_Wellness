import { TF, TF_CHIPS, TF_INTRO_STEPS } from './thunderForgeTokens';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

type Props = {
  errorText?: string;
  cameraSupported: boolean;
  permissionGranted: boolean;
  hasCamera: boolean;
  onStart: () => void;
  onRetry: () => void;
  onGuided: () => void;
};

export function ThunderForgeIntro({
  errorText,
  cameraSupported,
  permissionGranted,
  hasCamera,
  onStart,
  onRetry,
  onGuided,
}: Props) {
  const [step, setStep] = useState(0);
  const fade = useSharedValue(0);

  useEffect(() => {
    fade.value = 0;
    fade.value = withTiming(1, { duration: 400 });
  }, [step, fade]);

  const cardAnim = useAnimatedStyle(() => ({ opacity: fade.value }));

  const current = TF_INTRO_STEPS[step]!;

  if (errorText) {
    return (
      <View style={[styles.card, styles.cardBorder]}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={styles.err}>{errorText}</Text>
        <View style={styles.btnRow}>
          <Pressable style={styles.primary} onPress={onRetry}>
            <LinearGradient colors={[TF.accent, TF.molten]} style={styles.primaryGrad}>
              <Text style={styles.primaryTxt}>Retry Camera</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.secondary} onPress={onGuided}>
            <Text style={styles.secondaryTxt}>Guided Mode</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!cameraSupported) {
    return (
      <View style={[styles.card, styles.cardBorder]}>
        <Text style={styles.heroEmoji}>🦸</Text>
        <Text style={styles.title}>Thunder Forge</Text>
        <Text style={styles.body}>Camera tracking is not available here. Guided mode still charges the reactor!</Text>
        <Pressable style={styles.primary} onPress={onGuided}>
          <LinearGradient colors={[TF.accent, TF.molten]} style={styles.primaryGrad}>
            <Text style={styles.primaryTxt}>🦸 Start Guided Mission</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.card, styles.cardBorder, cardAnim]}>
      <View style={styles.stepDots}>
        {TF_INTRO_STEPS.map((_, i) => (
          <View key={i} style={[styles.stepDot, i === step && styles.stepDotActive, i < step && styles.stepDotDone]} />
        ))}
      </View>
      <Text style={styles.stepIcon}>{current.icon}</Text>
      <Text style={styles.stepTitle}>{current.title}</Text>
      <Text style={styles.body}>{current.body}</Text>
      {step === 0 && (
        <View style={styles.chips}>
          {TF_CHIPS.map((c) => (
            <View key={c} style={styles.chip}>
              <Text style={styles.chipTxt}>{c}</Text>
            </View>
          ))}
        </View>
      )}
      {step < TF_INTRO_STEPS.length - 1 ? (
        <Pressable style={styles.primary} onPress={() => setStep((s) => s + 1)}>
          <LinearGradient colors={[TF.accent, TF.molten]} style={styles.primaryGrad}>
            <Text style={styles.primaryTxt}>Next →</Text>
          </LinearGradient>
        </Pressable>
      ) : (
        <>
          <Text style={styles.camHint}>
            {!permissionGranted
              ? 'Tap Ignite — you will be asked to allow camera access.'
              : hasCamera
                ? 'Sit where the camera can see your head and shoulders.'
                : 'Loading body tracking…'}
          </Text>
          <Pressable style={styles.primary} onPress={onStart}>
            <LinearGradient colors={[TF.accent, TF.molten]} style={styles.primaryGrad}>
              <Text style={styles.primaryTxt}>⚡ Ignite Reactor</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={onGuided}>
            <Text style={styles.link}>No camera? Play guided mode</Text>
          </Pressable>
        </>
      )}
      {step > 0 && step < TF_INTRO_STEPS.length - 1 ? (
        <Pressable onPress={() => setStep((s) => s - 1)}>
          <Text style={styles.link}>← Back</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: TF.glass,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardBorder: { borderWidth: 1.5, borderColor: TF.glassBorder },
  stepDots: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  stepDotActive: { width: 22, backgroundColor: TF.accentBright },
  stepDotDone: { backgroundColor: TF.good },
  stepIcon: { fontSize: 44 },
  stepTitle: { fontSize: 20, fontWeight: '900', color: TF.textLight },
  heroEmoji: { fontSize: 48 },
  title: { fontSize: 24, fontWeight: '900', color: TF.textLight },
  body: { fontSize: 14, fontWeight: '600', color: TF.textMuted, textAlign: 'center', lineHeight: 21 },
  camHint: { fontSize: 13, fontWeight: '600', color: TF.textMuted, textAlign: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${TF.accent}44`,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  chipTxt: { fontSize: 11, fontWeight: '700', color: TF.textMuted },
  primary: { borderRadius: 18, overflow: 'hidden', width: '100%' },
  primaryGrad: { paddingVertical: 15, alignItems: 'center' },
  primaryTxt: { color: '#FFF', fontSize: 16, fontWeight: '900' },
  secondary: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  secondaryTxt: { color: TF.textLight, fontSize: 14, fontWeight: '800' },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  link: { fontSize: 13, fontWeight: '700', color: TF.accentBright, textDecorationLine: 'underline', paddingVertical: 4 },
  emoji: { fontSize: 36 },
  err: { color: '#FCA5A5', fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
