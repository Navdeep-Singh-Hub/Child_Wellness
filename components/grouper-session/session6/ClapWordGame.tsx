/**
 * Grouper Session 6 — Game 3: Trail Clap Echo
 * Clap once for each one-syllable -AN word: fan, man
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { AN_CLAP_THEME as T, GROUPER_SESSION } from '../grouperSessionTheme';
import { speakGrouperHint, speakGrouperWord, stopGrouperSpeech } from '../grouperSessionSpeech';
import { TerracottaTrailBackground } from '../TerracottaTrailBackground';

const WORDS = [
  { word: 'fan', emoji: '🪭' },
  { word: 'man', emoji: '👨' },
];

export interface ClapWordGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function ClapWordGame({
  onComplete,
  onBack,
  currentStep = 3,
  totalSteps = 5,
  sessionTitle,
}: ClapWordGameProps) {
  const [round, setRound] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const clapScale = useSharedValue(1);
  const starScale = useSharedValue(0);

  const current = WORDS[round] ?? WORDS[0];
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakGrouperWord(current.word);
    return () => stopGrouperSpeech();
  }, [current.word]);

  const handleClap = useCallback(() => {
    clapScale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withSpring(1, { damping: 8 })
    );
    starScale.value = withSequence(withSpring(1.15, { damping: 6 }), withSpring(1, { damping: 10 }));
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      /* ignore */
    }
    speakGrouperHint('Clap!');

    if (round + 1 >= WORDS.length) {
      speakGrouperHint('Great job clapping every word!');
      setCelebrating(true);
      setTimeout(() => onComplete(), 2200);
    } else {
      setRound((r) => r + 1);
    }
  }, [clapScale, onComplete, round, starScale]);

  const clapStyle = useAnimatedStyle(() => ({ transform: [{ scale: clapScale.value }] }));
  const starStyle = useAnimatedStyle(() => ({ transform: [{ scale: starScale.value }] }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Beat Complete!"
          subtitle="You clapped for every -AN word!"
          badgeEmoji="👏"
          variant="sunset"
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
      <TerracottaTrailBackground />

      {onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Build {currentStep} · {progressPct}%
            </Text>
          </View>
          <View style={styles.roundPill}>
            <Text style={styles.roundPillText}>
              {round + 1}/{WORDS.length}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}
        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Pressable onPress={() => speakGrouperHint('Clap once for each word.')}>
              <Text style={styles.prompt}>Clap once per word 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <Pressable
          onPress={() => speakGrouperWord(current.word)}
          style={({ pressed }) => [styles.wordCard, pressed && styles.pressed]}
        >
          <Text style={styles.wordEmoji}>{current.emoji}</Text>
          <Text style={styles.wordText}>{current.word}</Text>
          <Text style={styles.tapHint}>🔊 Tap to hear</Text>
        </Pressable>

        <Text style={styles.clapHint}>Tap CLAP once:</Text>
        <Animated.View style={clapStyle}>
          <Pressable
            onPress={handleClap}
            style={({ pressed }) => [styles.clapBtn, pressed && styles.pressed]}
            accessibilityLabel="Clap"
          >
            <Text style={styles.clapEmoji}>👏</Text>
            <Text style={styles.clapLabel}>CLAP</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.starWrap, starStyle]}>
          <Text style={styles.star}>⭐</Text>
        </Animated.View>
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
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: GROUPER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
    ...GROUPER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: GROUPER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  roundPill: {
    backgroundColor: 'rgba(255, 237, 213, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: GROUPER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.clapBorder,
  },
  roundPillText: { fontSize: 12, fontWeight: '800', color: T.ink },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.panel,
    borderRadius: GROUPER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    ...GROUPER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  playArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, gap: 16 },
  wordCard: {
    backgroundColor: T.panel,
    borderRadius: GROUPER_SESSION.radius.card,
    borderWidth: 3,
    borderColor: T.panelBorder,
    paddingVertical: 24,
    paddingHorizontal: 48,
    alignItems: 'center',
    ...GROUPER_SESSION.shadow.card,
  },
  wordEmoji: { fontSize: 52, marginBottom: 8 },
  wordText: { fontSize: 36, fontWeight: '900', color: T.accentDeep },
  tapHint: { fontSize: 12, fontWeight: '600', color: T.inkMuted, marginTop: 6 },
  clapHint: { fontSize: 16, fontWeight: '700', color: T.inkMuted },
  clapBtn: {
    backgroundColor: T.clapBtn,
    paddingVertical: 24,
    paddingHorizontal: 52,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: T.clapBorder,
    alignItems: 'center',
    ...GROUPER_SESSION.shadow.card,
  },
  clapEmoji: { fontSize: 48, marginBottom: 6 },
  clapLabel: { fontSize: 22, fontWeight: '900', color: T.ink },
  starWrap: { marginTop: 8 },
  star: { fontSize: 40 },
});
