/**
 * Builder Session 4 — Game 3: Rhythm Pattern Row
 * Complete the pattern: circle, square, circle → ?
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
import { BUILDER_SESSION, RHYTHM_ROW_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const PATTERN = ['circle', 'square', 'circle'] as const;
const OPTIONS = [
  { id: 'circle', label: 'Circle', emoji: '⭕' },
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺' },
];
const CORRECT_ID = 'square';
const PATTERN_EMOJI: Record<string, string> = { circle: '⭕', square: '⬜', triangle: '🔺' };

function OptionTile({
  label,
  emoji,
  onPress,
  state,
  disabled,
}: {
  label: string;
  emoji: string;
  onPress: () => void;
  state: 'idle' | 'wrong' | 'correct';
  disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);

  useEffect(() => {
    if (state === 'wrong') {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
    if (state === 'correct') {
      scale.value = withSequence(withSpring(1.1, { damping: 6 }), withSpring(1, { damping: 10 }));
    }
  }, [state, scale, shake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  const borderColor =
    state === 'correct' ? T.tileCorrect : state === 'wrong' ? T.tileWrong : T.panelBorder;
  const bg =
    state === 'correct'
      ? 'rgba(220, 252, 231, 0.95)'
      : state === 'wrong'
        ? 'rgba(254, 226, 226, 0.9)'
        : T.strip;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.optionCard,
          { backgroundColor: bg, borderColor },
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel={label}
      >
        <Text style={styles.optionEmoji}>{emoji}</Text>
        <Text style={styles.optionLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface PatternCompletionGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function PatternCompletionGame({
  onComplete,
  onBack,
  currentStep = 3,
  totalSteps = 5,
  sessionTitle,
}: PatternCompletionGameProps) {
  const [tileState, setTileState] = useState<Record<string, 'idle' | 'wrong' | 'correct'>>({});
  const [celebrating, setCelebrating] = useState(false);
  const [locked, setLocked] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint('Complete the pattern. Circle, square, circle. What comes next?');
    return () => stopBuilderSpeech();
  }, []);

  const handleTap = useCallback(
    (id: string) => {
      if (locked) return;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }

      if (id === CORRECT_ID) {
        setLocked(true);
        setTileState((s) => ({ ...s, [id]: 'correct' }));
        speakBuilderHint('Correct! Square comes next!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
        return;
      }

      setTileState((s) => ({ ...s, [id]: 'wrong' }));
      speakBuilderHint('Try again. Look at the pattern: circle, square, circle.');
      setTimeout(() => setTileState((s) => ({ ...s, [id]: 'idle' })), 500);
    },
    [locked, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Pattern Complete!"
          subtitle="You finished the rhythm row!"
          badgeEmoji="🔁"
          variant="indigo"
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
        </View>

        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Pressable
              onPress={() =>
                speakBuilderHint('Circle, square, circle. What shape comes next?')
              }
            >
              <Text style={styles.prompt}>What comes next? 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Pattern Strip</Text>
          <View style={styles.strip}>
            {PATTERN.map((p, i) => (
              <Text key={i} style={styles.patternItem}>
                {PATTERN_EMOJI[p]}
              </Text>
            ))}
            <View style={styles.questionBox}>
              <Text style={styles.question}>?</Text>
            </View>
          </View>

          <Text style={styles.chooseLabel}>Tap what comes next</Text>
          <View style={styles.optionsRow}>
            {OPTIONS.map((opt) => (
              <OptionTile
                key={opt.id}
                label={opt.label}
                emoji={opt.emoji}
                onPress={() => handleTap(opt.id)}
                state={tileState[opt.id] ?? 'idle'}
                disabled={locked}
              />
            ))}
          </View>
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
  playArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  panel: {
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 20,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.card,
  },
  panelLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: T.strip,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: T.stripBorder,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  patternItem: { fontSize: 40 },
  questionBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderWidth: 2,
    borderColor: T.accentSoft,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: { fontSize: 28, fontWeight: '900', color: T.accentDeep },
  chooseLabel: { fontSize: 14, fontWeight: '700', color: T.inkMuted, marginBottom: 14 },
  optionsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  optionCard: {
    width: 88,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
  },
  optionEmoji: { fontSize: 36, marginBottom: 4 },
  optionLabel: { fontSize: 12, fontWeight: '800', color: T.ink },
});
