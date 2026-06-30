/**
 * Builder Session 8 — Game 3: Sun Spell Loft
 * Tap letters in order to spell SUN.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { BUILDER_SESSION, SUN_SPELL_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const TARGET_WORD = 'SUN';

type LetterOption = { letter: string; id: number };

function shuffleLetters(word: string): LetterOption[] {
  const items = word.split('').map((letter, id) => ({ letter, id }));
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function LetterTile({
  letter,
  onPress,
  disabled,
  wrong,
}: {
  letter: string;
  onPress: () => void;
  disabled: boolean;
  wrong: boolean;
}) {
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (wrong) {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    } else if (!disabled) {
      scale.value = withSpring(1, { damping: 10 });
    }
  }, [wrong, disabled, scale, shake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.tile,
          wrong && styles.tileWrong,
          disabled && styles.tileUsed,
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel={`Letter ${letter}`}
      >
        <Text style={styles.tileLetter}>{letter}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface LetterPuzzleGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function LetterPuzzleGame({
  onComplete,
  onBack,
  currentStep = 3,
  totalSteps = 5,
  sessionTitle,
}: LetterPuzzleGameProps) {
  const letters = useMemo(() => TARGET_WORD.split(''), []);
  const [pool] = useState(() => shuffleLetters(TARGET_WORD));
  const [nextIndex, setNextIndex] = useState(0);
  const [usedIds, setUsedIds] = useState<Set<number>>(() => new Set());
  const [celebrating, setCelebrating] = useState(false);
  const [wrongId, setWrongId] = useState<number | null>(null);

  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const spellHint = letters.join(', ');

  useEffect(() => {
    speakBuilderHint(`Spell SUN in the loft. Tap the letters in order: ${spellHint}.`);
    return () => stopBuilderSpeech();
  }, [spellHint]);

  const handleLetterTap = useCallback(
    (letter: string, id: number) => {
      if (usedIds.has(id) || celebrating) return;
      const expected = letters[nextIndex];
      if (letter !== expected) {
        setWrongId(id);
        speakBuilderHint(`Try again. Next letter is ${expected}.`);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {
          /* ignore */
        }
        setTimeout(() => setWrongId(null), 500);
        return;
      }

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }

      speakBuilderHint(letter);
      const newIndex = nextIndex + 1;
      setNextIndex(newIndex);
      setUsedIds((prev) => new Set(prev).add(id));

      if (newIndex >= letters.length) {
        speakBuilderHint('Sun! You spelled SUN!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [celebrating, letters, nextIndex, onComplete, usedIds]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Sun Spell Complete!"
          subtitle="You spelled SUN!"
          badgeEmoji="☀️"
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
      <MountainWorkshopBackground />

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
          <View style={styles.wordPill}>
            <Text style={styles.wordPillText}>
              {nextIndex}/{letters.length} letters
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Pressable onPress={() => speakBuilderHint(`Spell SUN. Order: ${spellHint}`)}>
              <Text style={styles.prompt}>Spell SUN ☀️ 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.loftArea}>
        <View style={styles.desk}>
          <Text style={styles.deskLabel}>Sun Blueprint</Text>
          <View style={styles.slotsRow}>
            {letters.map((letter, i) => (
              <View key={`slot-${i}`} style={[styles.slot, i < nextIndex && styles.slotFilled]}>
                <Text style={styles.slotLetter}>{i < nextIndex ? letter : '?'}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.targetWord}>SUN</Text>
        </View>

        <Text style={styles.hint}>Tap letters below in the right order</Text>

        <View style={styles.tilesRow}>
          {pool.map(({ letter, id }) =>
            usedIds.has(id) ? (
              <View key={id} style={styles.tileGhost} />
            ) : (
              <LetterTile
                key={id}
                letter={letter}
                onPress={() => handleLetterTap(letter, id)}
                disabled={false}
                wrong={wrongId === id}
              />
            )
          )}
        </View>
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
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
    zIndex: 10,
    ...BUILDER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  wordPill: {
    backgroundColor: 'rgba(254, 243, 199, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.accentSoft,
  },
  wordPillText: { fontSize: 12, fontWeight: '800', color: T.ink },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  loftArea: { flex: 1, paddingHorizontal: 20, paddingTop: 12, alignItems: 'center' },
  desk: {
    width: '100%',
    padding: 16,
    borderRadius: BUILDER_SESSION.radius.card,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.panelBorder,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.card,
  },
  deskLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  slotsRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  slot: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: T.slot,
    borderWidth: 3,
    borderColor: T.slotBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: { backgroundColor: T.slotFilled, borderColor: T.accentSoft },
  slotLetter: { fontSize: 28, fontWeight: '900', color: T.accentDeep },
  targetWord: { fontSize: 14, fontWeight: '800', color: T.inkMuted, letterSpacing: 4 },
  hint: { marginTop: 16, fontSize: 14, fontWeight: '700', color: T.inkMuted },
  tilesRow: { flexDirection: 'row', gap: 16, marginTop: 16 },
  tile: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: T.tile,
    borderWidth: 4,
    borderColor: T.tileBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...BUILDER_SESSION.shadow.soft,
  },
  tileWrong: { borderColor: T.tileWrong, backgroundColor: 'rgba(254, 226, 226, 0.9)' },
  tileUsed: { opacity: 0.35, backgroundColor: T.tileUsed },
  tileGhost: { width: 64, height: 64 },
  tileLetter: { fontSize: 32, fontWeight: '900', color: T.accentDeep },
});
