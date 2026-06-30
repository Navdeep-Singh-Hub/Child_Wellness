/**
 * Builder Session 8 — Game 4: Habitat Trail Map
 * Match animals to their habitats: fish→water, bird→sky, dog→home.
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
import { BUILDER_SESSION, HABITAT_TRAIL_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const PAIRS = [
  { id: 'fish', animal: 'Fish', animalEmoji: '🐟', habitatId: 'water', habitat: 'Water', habitatEmoji: '🌊' },
  { id: 'bird', animal: 'Bird', animalEmoji: '🐦', habitatId: 'sky', habitat: 'Sky', habitatEmoji: '☁️' },
  { id: 'dog', animal: 'Dog', animalEmoji: '🐕', habitatId: 'home', habitat: 'Home', habitatEmoji: '🏠' },
];

const HABITATS = [
  { id: 'water', label: 'Water', emoji: '🌊' },
  { id: 'sky', label: 'Sky', emoji: '☁️' },
  { id: 'home', label: 'Home', emoji: '🏠' },
];

function shuffleArray<U>(arr: U[]): U[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function shuffleWithoutSameColumn<U extends { id: string }>(
  base: { habitatId: string }[],
  source: U[]
): U[] {
  if (source.length <= 1) return [...source];
  let candidate = shuffleArray(source);
  let tries = 0;
  while (candidate.some((item, i) => item.id === base[i]?.habitatId) && tries < 20) {
    candidate = shuffleArray(source);
    tries += 1;
  }
  if (candidate.some((item, i) => item.id === base[i]?.habitatId)) {
    return [...source.slice(1), source[0]];
  }
  return candidate;
}

export interface AnimalHabitatGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function AnimalHabitatGame({
  onComplete,
  onBack,
  currentStep = 4,
  totalSteps = 5,
  sessionTitle,
}: AnimalHabitatGameProps) {
  const [animalOrder] = useState(() => shuffleArray(PAIRS));
  const [habitatOrder] = useState(() => shuffleWithoutSameColumn(animalOrder, HABITATS));
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint('Match each animal to its home. Tap an animal, then tap where it lives.');
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
    speakBuilderHint('Try again. Where does this animal live?');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      /* ignore */
    }
  }, [shake]);

  const handleAnimalTap = useCallback(
    (id: string) => {
      if (matched.has(id)) return;
      setSelectedId(id);
      speakBuilderHint(PAIRS.find((p) => p.id === id)?.animal ?? id);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }
    },
    [matched]
  );

  const handleHabitatTap = useCallback(
    (habitatId: string) => {
      if (!selectedId) return;
      const pair = PAIRS.find((p) => p.id === selectedId);
      if (!pair || pair.habitatId !== habitatId) {
        triggerWrong();
        setSelectedId(null);
        return;
      }

      speakBuilderHint(`Correct! ${pair.animal} lives in ${pair.habitat}!`);
      const nextMatched = new Set(matched).add(selectedId);
      setMatched(nextMatched);
      setSelectedId(null);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        /* ignore */
      }

      if (nextMatched.size >= animalOrder.length) {
        speakBuilderHint('All animals matched to their homes!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [animalOrder.length, matched, onComplete, selectedId, triggerWrong]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Trail Complete!"
          subtitle="You matched every animal to its home!"
          badgeEmoji="🐾"
          variant="mint"
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
                {matched.size}/{animalOrder.length} matched
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
                onPress={() => speakBuilderHint('Tap an animal, then tap where it lives.')}
              >
                <Text style={styles.prompt}>Match animals to homes 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.trailMap, shakeStyle]}>
          <Text style={styles.sectionLabel}>Animals</Text>
          <View style={styles.row}>
            {animalOrder.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => handleAnimalTap(p.id)}
                style={[
                  styles.animalCard,
                  selectedId === p.id && styles.animalSelected,
                  matched.has(p.id) && styles.animalMatched,
                ]}
                accessibilityLabel={p.animal}
              >
                <Text style={styles.emoji}>{p.animalEmoji}</Text>
                <Text style={styles.animalLabel}>{p.animal}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Habitats</Text>
          <View style={styles.row}>
            {habitatOrder.map((h) => {
              const matchedPair = PAIRS.find((p) => p.habitatId === h.id && matched.has(p.id));
              return (
                <Pressable
                  key={h.id}
                  onPress={() => handleHabitatTap(h.id)}
                  style={[
                    styles.habitatCard,
                    matchedPair && styles.habitatMatched,
                    selectedId && !matchedPair && styles.habitatReady,
                  ]}
                  accessibilityLabel={`${h.label} habitat`}
                >
                  <Text style={styles.habitatEmoji}>{h.emoji}</Text>
                  <Text style={styles.habitatLabel}>{h.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.hint}>
            {selectedId
              ? `Where does the ${PAIRS.find((p) => p.id === selectedId)?.animal.toLowerCase()} live?`
              : 'Tap an animal first, then its habitat'}
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
    backgroundColor: 'rgba(209, 250, 229, 0.55)',
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
  trailMap: {
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
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  animalCard: {
    width: 92,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: T.animalCard,
    borderWidth: 3,
    borderColor: T.animalBorder,
    alignItems: 'center',
  },
  animalSelected: { borderColor: T.accent, backgroundColor: T.selected },
  animalMatched: { borderColor: '#22C55E', backgroundColor: T.matched, opacity: 0.92 },
  emoji: { fontSize: 36, marginBottom: 4 },
  animalLabel: { fontSize: 13, fontWeight: '800', color: T.ink },
  habitatCard: {
    width: 92,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: T.habitatCard,
    borderWidth: 3,
    borderColor: T.habitatBorder,
    alignItems: 'center',
  },
  habitatReady: { borderColor: T.accentSoft },
  habitatMatched: { borderColor: '#22C55E', backgroundColor: T.matched },
  habitatEmoji: { fontSize: 32, marginBottom: 4 },
  habitatLabel: { fontSize: 13, fontWeight: '800', color: T.ink },
  hint: { fontSize: 14, fontWeight: '700', color: T.inkMuted, textAlign: 'center' },
});
