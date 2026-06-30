/**
 * Builder — Letter Loft: tap letters in order to spell a word.
 * Session 2: CAT · Session 10: BALL (via props)
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
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
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { BUILDER_SESSION, BALL_FORGE_THEME, WORD_LOFT_THEME } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

type LetterOption = { letter: string; id: number };

function shuffleLetters(word: string): LetterOption[] {
  const items = word.split('').map((letter, id) => ({ letter, id }));
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function defaultEmoji(word: string): string {
  if (word === 'CAT') return '🐱';
  if (word === 'BALL') return '⚽';
  return '📝';
}

type WordTheme = typeof WORD_LOFT_THEME;

function LetterTile({
  letter,
  onPress,
  disabled,
  wrong,
  tileStyles,
}: {
  letter: string;
  onPress: () => void;
  disabled: boolean;
  wrong: boolean;
  tileStyles: ReturnType<typeof createStyles>;
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
          tileStyles.tile,
          wrong && tileStyles.tileWrong,
          disabled && tileStyles.tileUsed,
          pressed && !disabled && tileStyles.pressed,
        ]}
        accessibilityLabel={`Letter ${letter}`}
      >
        <Text style={tileStyles.tileLetter}>{letter}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface WordBuilderGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
  targetWord?: string;
  badgeEmoji?: string;
}

export function WordBuilderGame({
  onComplete,
  onBack,
  currentStep = 1,
  totalSteps = 5,
  sessionTitle,
  targetWord = 'CAT',
  badgeEmoji,
}: WordBuilderGameProps) {
  const word = targetWord.toUpperCase();
  const theme: WordTheme = word === 'BALL' ? BALL_FORGE_THEME : WORD_LOFT_THEME;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const letters = useMemo(() => word.split(''), [word]);
  const emoji = badgeEmoji ?? defaultEmoji(word);
  const [pool] = useState(() => shuffleLetters(word));
  const [nextIndex, setNextIndex] = useState(0);
  const [usedIds, setUsedIds] = useState<Set<number>>(() => new Set());
  const [celebrating, setCelebrating] = useState(false);
  const [wrongId, setWrongId] = useState<number | null>(null);

  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const spellHint = letters.join(', ');

  useEffect(() => {
    speakBuilderHint(`Spell the word ${word}. Tap the letters in order: ${spellHint}.`);
    return () => stopBuilderSpeech();
  }, [word, spellHint]);

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
        speakBuilderHint(`You spelled ${word}! Great job!`);
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [celebrating, letters, nextIndex, onComplete, usedIds, word]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title={word === 'BALL' ? 'Ball Forged!' : 'Word Built!'}
          subtitle={`You spelled ${word}!`}
          badgeEmoji={emoji}
          variant="mint"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...theme.gradient]}
        locations={[...theme.gradientLocations]}
        style={StyleSheet.absoluteFill}
      />
      <MountainWorkshopBackground />

      {onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={theme.accentDeep} />
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

        <Text style={styles.title}>{theme.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{theme.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{theme.mascotName} says:</Text>
            <Pressable onPress={() => speakBuilderHint(`Spell ${word}. Order: ${spellHint}`)}>
              <Text style={styles.prompt}>
                Spell {word} {emoji} 🔊
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.loftArea}>
        <View style={styles.desk}>
          <Text style={styles.deskLabel}>Word Blueprint</Text>
          <View style={styles.slotsRow}>
            {letters.map((letter, i) => (
              <View
                key={`slot-${i}`}
                style={[styles.slot, i < nextIndex && styles.slotFilled]}
              >
                <Text style={styles.slotLetter}>{i < nextIndex ? letter : '?'}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.targetWord}>{word}</Text>
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
                tileStyles={styles}
              />
            )
          )}
        </View>
      </View>

      <View style={styles.footerMeter}>
        {letters.map((l, i) => (
          <View key={`m-${i}`} style={[styles.meterDot, i < nextIndex && styles.meterDotDone]}>
            <Text style={styles.meterText}>{i < nextIndex ? '✓' : l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (T: WordTheme) =>
  StyleSheet.create({
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
    borderColor: T.deskBorder,
    zIndex: 10,
    ...BUILDER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, gap: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.deskBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  wordPill: {
    backgroundColor: T.slot,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.slotBorder,
  },
  wordPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.desk,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.deskBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 12, fontWeight: '800', color: T.accentDeep, textTransform: 'uppercase' },
  prompt: { fontSize: 18, fontWeight: '800', color: T.ink },
  loftArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, gap: 14 },
  desk: {
    backgroundColor: T.desk,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 2,
    borderColor: T.deskBorder,
    padding: 18,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.card,
  },
  deskLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  slotsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  slot: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: T.slot,
    borderWidth: 3,
    borderColor: T.slotBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: { backgroundColor: T.slotFilled, borderColor: T.accentSoft },
  slotLetter: { fontSize: 26, fontWeight: '900', color: T.ink },
  targetWord: { fontSize: 14, fontWeight: '700', color: T.inkMuted, letterSpacing: 4 },
  hint: { fontSize: 13, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  tilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  tile: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: T.tile,
    borderWidth: 3,
    borderColor: T.tileBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...BUILDER_SESSION.shadow.soft,
  },
  tileWrong: { borderColor: T.tileWrong, backgroundColor: 'rgba(254, 226, 226, 0.9)' },
  tileUsed: { opacity: 0 },
  tileGhost: { width: 58, height: 58 },
  tileLetter: { fontSize: 28, fontWeight: '900', color: T.accentDeep },
  footerMeter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  meterDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: T.deskBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterDotDone: { backgroundColor: T.slotFilled, borderColor: T.accentSoft },
  meterText: { fontSize: 16, fontWeight: '900', color: T.accentDeep },
  });
