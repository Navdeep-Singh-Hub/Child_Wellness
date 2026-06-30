/**
 * Game 1: Ocean Letter Lagoon — meet each lowercase letter with voice, bubble UI, and gentle motion.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { LETTER_LAGOON_THEME as T, MATCHER_SESSION } from './matcherSessionTheme';
import { speakLetter, speakMatcherHint, stopMatcherSpeech } from './matcherSessionSpeech';
import { OceanReefBackground } from './OceanReefBackground';

export function MatcherIntroGame({
  letters,
  sessionTitle,
  currentStep,
  totalSteps,
  onBack,
  onComplete,
}: {
  letters: string[];
  sessionTitle?: string;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const current = letters[idx] ?? letters[0];
  const isLast = idx >= letters.length - 1;
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  const letterScale = useSharedValue(0.85);
  const bubbleFloat = useSharedValue(0);
  const bubbleScale = useSharedValue(0.92);
  const shimmer = useSharedValue(0);

  const playLetter = useCallback((letter: string) => {
    setIsSpeaking(true);
    speakLetter(letter);
    letterScale.value = withSequence(
      withSpring(1.08, { damping: 8, stiffness: 180 }),
      withSpring(1, { damping: 10, stiffness: 140 })
    );
    setTimeout(() => setIsSpeaking(false), 1400);
  }, [letterScale]);

  useEffect(() => {
    bubbleScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    bubbleFloat.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800 }),
        withTiming(0.3, { duration: 1800 })
      ),
      -1,
      false
    );
    return () => stopMatcherSpeech();
  }, [bubbleFloat, bubbleScale, shimmer]);

  useEffect(() => {
    letterScale.value = withSpring(1, { damping: 11, stiffness: 130 });
    playLetter(current);
  }, [current, letterScale, playLetter]);

  const handleTapLetter = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      /* ignore */
    }
    playLetter(current);
  };

  const handleNext = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      /* ignore */
    }
    if (!isLast) {
      setIdx((v) => v + 1);
      letterScale.value = 0.85;
      return;
    }
    setCelebrating(true);
    speakMatcherHint('Wonderful! You met all the letters!');
    setTimeout(() => onComplete(), 2200);
  };

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: bubbleScale.value },
      { translateY: bubbleFloat.value * -10 },
    ],
  }));

  const letterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: letterScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + shimmer.value * 0.4,
  }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Letters Discovered!"
          subtitle="You're ready for the next quest!"
          badgeEmoji="🐚"
          variant="ocean"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...T.gradient]}
        locations={[...T.gradientLocations]}
        style={StyleSheet.absoluteFill}
      />
      <OceanReefBackground />

      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>Quest {currentStep} · {progressPct}%</Text>
          </View>
          <View style={styles.letterPill}>
            <Text style={styles.letterPillText}>
              {idx + 1} / {letters.length}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Text style={styles.prompt}>Tap the bubble to hear the letter again!</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <Animated.View style={[styles.glowRing, glowStyle]} pointerEvents="none" />

        <Animated.View style={[styles.letterBubbleWrap, bubbleStyle]}>
          <Pressable onPress={handleTapLetter} style={styles.letterBubblePress}>
            <LinearGradient
              colors={['rgba(255,255,255,0.98)', 'rgba(224, 242, 254, 0.95)']}
              style={styles.letterBubble}
            >
              <Animated.Text style={[styles.bigLetter, letterStyle]}>{current}</Animated.Text>
              {isSpeaking && (
                <View style={styles.speakingRow}>
                  <ActivityIndicator size="small" color={T.accent} />
                  <Text style={styles.speakingText}>Listening…</Text>
                </View>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <View style={styles.pearlRow}>
          {letters.map((l, i) => (
            <View
              key={`${l}-${i}`}
              style={[
                styles.pearl,
                i === idx && styles.pearlActive,
                i < idx && styles.pearlDone,
              ]}
            >
              <Text style={[styles.pearlText, i <= idx && styles.pearlTextActive]}>
                {i < idx ? '✓' : l}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.hintLabel}>lowercase letter</Text>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [pressed && styles.pressed]}
          accessibilityLabel={isLast ? 'Finish introduction' : 'Next letter'}
        >
          <LinearGradient
            colors={[...T.doneGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>{isLast ? "Let's Go! →" : 'Next Letter →'}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Platform.OS === 'web' ? 12 : 48,
    marginLeft: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.bubbleBorder,
    zIndex: 10,
    ...MATCHER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '800', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.bubbleBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.inkMuted },
  letterPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1.5,
    borderColor: T.accentSoft,
  },
  letterPillText: { fontSize: 14, fontWeight: '900', color: T.accent },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: T.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: T.inkMuted,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.bubble,
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: T.bubbleBorder,
    marginBottom: 8,
    ...MATCHER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 36 },
  bubbleBody: { flex: 1 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 15, fontWeight: '700', color: T.ink, lineHeight: 22, marginTop: 2 },
  playArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 5,
  },
  glowRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: T.bubbleGlow,
  },
  letterBubbleWrap: { alignItems: 'center', justifyContent: 'center' },
  letterBubblePress: { borderRadius: 999 },
  letterBubble: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: T.bubbleBorder,
    ...MATCHER_SESSION.shadow.card,
  },
  bigLetter: {
    fontSize: 130,
    fontWeight: '900',
    color: T.letterColor,
    lineHeight: 140,
  },
  speakingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  speakingText: { fontSize: 12, fontWeight: '600', color: T.inkMuted },
  pearlRow: { flexDirection: 'row', gap: 12, marginTop: 28 },
  pearl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: T.pearlInactive,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pearlActive: {
    backgroundColor: '#FFFFFF',
    borderColor: T.accentSoft,
    transform: [{ scale: 1.1 }],
    ...MATCHER_SESSION.shadow.soft,
  },
  pearlDone: { backgroundColor: 'rgba(186, 230, 253, 0.95)' },
  pearlText: { fontSize: 18, fontWeight: '800', color: T.inkMuted },
  pearlTextActive: { color: T.accentDeep },
  hintLabel: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: '700',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  footer: { paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 28 : 20, zIndex: 5 },
  nextBtn: {
    paddingVertical: 16,
    borderRadius: MATCHER_SESSION.radius.button,
    alignItems: 'center',
    ...MATCHER_SESSION.shadow.card,
  },
  nextBtnText: { fontSize: 17, fontWeight: '900', color: '#FFFFFF' },
});
