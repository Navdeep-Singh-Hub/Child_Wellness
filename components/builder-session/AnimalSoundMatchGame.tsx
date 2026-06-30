/**
 * Builder Session 3 — Game 4: Echo Barn Stage
 * Match each animal to its sound.
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
import { BUILDER_SESSION, BARN_ECHO_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const ANIMALS = [
  { id: 'dog', emoji: '🐕', label: 'Dog', sound: 'Woof woof!', soundId: 'woof' },
  { id: 'cat', emoji: '🐱', label: 'Cat', sound: 'Meow!', soundId: 'meow' },
  { id: 'cow', emoji: '🐄', label: 'Cow', sound: 'Moo!', soundId: 'moo' },
];

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function shuffleWithoutSameColumn<T extends { id: string }>(base: T[], source: T[]): T[] {
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

export interface AnimalSoundMatchGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function AnimalSoundMatchGame({
  onComplete,
  onBack,
  currentStep = 4,
  totalSteps = 5,
  sessionTitle,
}: AnimalSoundMatchGameProps) {
  const [shuffledAnimals] = useState(() => shuffleArray(ANIMALS));
  const [shuffledSounds] = useState(() => shuffleWithoutSameColumn(shuffledAnimals, ANIMALS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [celebrating, setCelebrating] = useState(false);
  const shake = useSharedValue(0);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint('Match each animal to its sound. Tap an animal, then tap its sound.');
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
    speakBuilderHint('Try again. Match the animal to its sound.');
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
      const animal = ANIMALS.find((x) => x.id === id);
      speakBuilderHint(animal?.label ?? id);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }
    },
    [matched]
  );

  const handleSoundTap = useCallback(
    (soundId: string) => {
      if (!selectedId) return;
      const animal = ANIMALS.find((x) => x.id === selectedId);
      if (!animal || animal.soundId !== soundId) {
        triggerWrong();
        setSelectedId(null);
        return;
      }

      speakBuilderHint(animal.sound);
      const nextMatched = new Set(matched).add(selectedId);
      setMatched(nextMatched);
      setSelectedId(null);

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        /* ignore */
      }

      if (nextMatched.size >= shuffledAnimals.length) {
        speakBuilderHint('All animals matched!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [matched, onComplete, selectedId, shuffledAnimals.length, triggerWrong]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Echo Complete!"
          subtitle="You matched every animal and sound!"
          badgeEmoji="🔊"
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
                {matched.size}/{shuffledAnimals.length} matched
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
                  speakBuilderHint('Tap an animal, then tap the sound it makes.')
                }
              >
                <Text style={styles.prompt}>Match animals to sounds 🔊</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.stage, shakeStyle]}>
          <Text style={styles.sectionLabel}>Animals</Text>
          <View style={styles.row}>
            {shuffledAnimals.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => handleAnimalTap(a.id)}
                style={[
                  styles.animalCard,
                  selectedId === a.id && styles.animalSelected,
                  matched.has(a.id) && styles.animalMatched,
                ]}
                accessibilityLabel={a.label}
              >
                <Text style={styles.emoji}>{a.emoji}</Text>
                <Text style={styles.animalLabel}>{a.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Sounds</Text>
          <View style={styles.row}>
            {shuffledSounds.map((a) => (
              <Pressable
                key={a.soundId}
                onPress={() => handleSoundTap(a.soundId)}
                style={[
                  styles.soundCard,
                  matched.has(a.id) && styles.soundMatched,
                  selectedId && !matched.has(a.id) && styles.soundReady,
                ]}
                accessibilityLabel={a.sound}
              >
                <Text style={styles.soundText}>{a.sound}</Text>
              </Pressable>
            ))}
          </View>

          {selectedId ? (
            <Text style={styles.hint}>
              Now tap the sound for {ANIMALS.find((x) => x.id === selectedId)?.label}
            </Text>
          ) : (
            <Text style={styles.hint}>Tap an animal first, then its sound</Text>
          )}
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
    backgroundColor: 'rgba(220, 252, 231, 0.55)',
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
  stage: {
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
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: T.animalCard,
    borderWidth: 3,
    borderColor: T.animalBorder,
    alignItems: 'center',
  },
  animalSelected: { borderColor: T.accent, backgroundColor: T.selected },
  animalMatched: { borderColor: '#22C55E', backgroundColor: T.matched, opacity: 0.92 },
  emoji: { fontSize: 38, marginBottom: 4 },
  animalLabel: { fontSize: 13, fontWeight: '800', color: T.ink },
  soundCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: T.soundCard,
    borderWidth: 3,
    borderColor: T.soundBorder,
    minWidth: 92,
    alignItems: 'center',
  },
  soundReady: { borderColor: T.accentSoft },
  soundMatched: { borderColor: '#22C55E', backgroundColor: T.matched },
  soundText: { fontSize: 14, fontWeight: '800', color: T.ink, textAlign: 'center' },
  hint: { marginTop: 4, fontSize: 14, color: T.inkMuted, fontWeight: '700', textAlign: 'center' },
});
