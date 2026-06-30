/**
 * Builder Session 6 — Game 3: Letter Mirror Bridge
 * Match uppercase letters to their lowercase pairs.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { BUILDER_SESSION, LETTER_MIRROR_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const PAIRS = [
  { id: 'a', upper: 'A', lower: 'a' },
  { id: 'b', upper: 'B', lower: 'b' },
  { id: 'c', upper: 'C', lower: 'c' },
];

function shuffleArray<U>(arr: U[]): U[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function shuffleWithoutSameColumn<U extends { id: string }>(base: U[], source: U[]): U[] {
  if (source.length <= 1) return [...source];
  let candidate = shuffleArray(source);
  let tries = 0;
  while (candidate.some((item, i) => item.id === base[i]?.id) && tries < 20) {
    candidate = shuffleArray(source);
    tries += 1;
  }
  if (candidate.some((item, i) => item.id === base[i]?.id)) {
    return [...source.slice(1), source[0]];
  }
  return candidate;
}

export interface LetterCaseMatchGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function LetterCaseMatchGame({
  onComplete,
  onBack,
  currentStep = 3,
  totalSteps = 5,
  sessionTitle,
}: LetterCaseMatchGameProps) {
  const [upperOrder] = useState(() => shuffleArray(PAIRS));
  const [lowerOrder] = useState(() => shuffleWithoutSameColumn(upperOrder, PAIRS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint(
      'Match the big letter with the small letter. Tap a big letter, then tap its small letter.'
    );
    return () => stopBuilderSpeech();
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  const triggerWrong = useCallback(() => {
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakBuilderHint('Try again. Match the big letter to the small letter.');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleUpperTap = useCallback(
    (id: string) => {
      if (matched.has(id)) return;
      setSelectedId(id);
      speakBuilderHint(PAIRS.find((x) => x.id === id)?.upper ?? id);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }
    },
    [matched]
  );

  const handleLowerTap = useCallback(
    (id: string) => {
      if (!selectedId) return;
      if (selectedId !== id) {
        triggerWrong();
        setSelectedId(null);
        return;
      }

      const p = PAIRS.find((x) => x.id === id);
      speakBuilderHint(`${p?.upper} and ${p?.lower}!`);
      const nextMatched = new Set(matched).add(id);
      setMatched(nextMatched);
      setSelectedId(null);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        /* ignore */
      }

      if (nextMatched.size >= upperOrder.length) {
        speakBuilderHint('All letters matched!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [matched, onComplete, selectedId, triggerWrong, upperOrder.length]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Mirror Complete!"
          subtitle="You matched A, B, and C!"
          badgeEmoji="🔤"
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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>
                Build {currentStep} · {progressPct}%
              </Text>
            </View>
            <View style={styles.matchPill}>
              <Text style={styles.matchPillText}>
                {matched.size}/{upperOrder.length} matched
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
                  speakBuilderHint('Match big letters to small letters across the mirror bridge.')
                }
              >
                <Text style={styles.prompt}>Big ↔ small letters 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.bridge, shakeStyle]}>
          <Text style={styles.sectionLabel}>Big letters</Text>
          <View style={styles.row}>
            {upperOrder.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => handleUpperTap(p.id)}
                style={[
                  styles.letterBtn,
                  styles.upperBtn,
                  selectedId === p.id && styles.selected,
                  matched.has(p.id) && styles.matched,
                ]}
                accessibilityLabel={`Letter ${p.upper}`}
              >
                <Text style={styles.upperText}>{p.upper}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Small letters</Text>
          <View style={styles.row}>
            {lowerOrder.map((p) => (
              <Pressable
                key={`lower-${p.id}`}
                onPress={() => handleLowerTap(p.id)}
                style={[styles.letterBtn, styles.lowerBtn, matched.has(p.id) && styles.matched]}
                accessibilityLabel={`Letter ${p.lower}`}
              >
                <Text style={styles.lowerText}>{p.lower}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.hint}>
            {selectedId
              ? `Tap the small letter for ${PAIRS.find((x) => x.id === selectedId)?.upper}`
              : 'Tap a big letter first, then its small match'}
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: Platform.OS === 'ios' ? 32 : 20 },
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
  matchPill: {
    backgroundColor: 'rgba(237, 233, 254, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.accentSoft,
  },
  matchPillText: { fontSize: 12, fontWeight: '800', color: T.ink },
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
  bridge: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: BUILDER_SESSION.radius.card,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.panelBorder,
    ...BUILDER_SESSION.shadow.card,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  row: { flexDirection: 'row', gap: 16, marginBottom: 18, justifyContent: 'center' },
  letterBtn: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upperBtn: { backgroundColor: T.upperCard, borderColor: T.upperBorder },
  lowerBtn: { backgroundColor: T.lowerCard, borderColor: T.lowerBorder },
  upperText: { fontSize: 36, fontWeight: '900', color: T.accentDeep },
  lowerText: { fontSize: 32, fontWeight: '900', color: T.accentDeep },
  selected: { borderColor: T.accent, backgroundColor: T.selected },
  matched: { borderColor: '#22C55E', backgroundColor: T.matched, opacity: 0.92 },
  hint: { fontSize: 14, fontWeight: '700', color: T.inkMuted, textAlign: 'center' },
});
