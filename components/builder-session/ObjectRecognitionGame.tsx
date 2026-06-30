/**
 * Builder Session 1 — Game 1: Alpine Toy Shelf
 * Tap the correct object (CAT) among shelf tiles. Full mountain-workshop shell.
 */
import React, { useCallback, useEffect, useState } from 'react';
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
import { BUILDER_SESSION, OBJECT_SHELF_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const OBJECTS = [
  { id: 'cat', label: 'CAT', emoji: '🐱' },
  { id: 'dog', label: 'DOG', emoji: '🐕' },
  { id: 'sun', label: 'SUN', emoji: '☀️' },
] as const;

const CORRECT_ID = 'cat';
const PROMPT = 'Tap the CAT';

function ShelfTile({
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
      scale.value = withSequence(
        withSpring(1.1, { damping: 6 }),
        withSpring(1, { damping: 10 })
      );
    }
  }, [state, scale, shake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  const borderColor =
    state === 'correct' ? T.shelfCorrect : state === 'wrong' ? T.shelfWrong : T.shelfBorder;
  const bg =
    state === 'correct'
      ? 'rgba(220, 252, 231, 0.95)'
      : state === 'wrong'
        ? 'rgba(254, 226, 226, 0.9)'
        : T.shelf;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.tile,
          { backgroundColor: bg, borderColor },
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel={label}
      >
        <View style={styles.woodLip} />
        <Text style={styles.tileEmoji}>{emoji}</Text>
        <Text style={styles.tileLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface ObjectRecognitionGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function ObjectRecognitionGame({
  onComplete,
  onBack,
  currentStep = 1,
  totalSteps = 5,
  sessionTitle,
}: ObjectRecognitionGameProps) {
  const [tileState, setTileState] = useState<Record<string, 'idle' | 'wrong' | 'correct'>>({});
  const [found, setFound] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [locked, setLocked] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const targetFound = found >= 1;

  useEffect(() => {
    speakBuilderHint(`${PROMPT}. Find the cat on the toy shelf!`);
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
        setFound(1);
        speakBuilderHint('Correct! You found the cat!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
        return;
      }

      setTileState((s) => ({ ...s, [id]: 'wrong' }));
      speakBuilderHint('Try again. Tap the cat!');
      setTimeout(() => setTileState((s) => ({ ...s, [id]: 'idle' })), 500);
    },
    [locked, onComplete]
  );

  const replayPrompt = () => {
    speakBuilderHint(PROMPT);
  };

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Shelf Spotter!"
          subtitle="You found the cat on the toy shelf!"
          badgeEmoji="🐱"
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
          <View style={styles.foundPill}>
            <Text style={styles.foundPillText}>{targetFound ? '✓' : '0'}/1 found</Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Pressable onPress={replayPrompt}>
              <Text style={styles.prompt}>{PROMPT} 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.shelfArea}>
        <View style={styles.shelfFrame}>
          <Text style={styles.shelfLabel}>Toy Shelf</Text>
          <View style={styles.tileRow}>
            {OBJECTS.map((obj) => (
              <ShelfTile
                key={obj.id}
                label={obj.label}
                emoji={obj.emoji}
                onPress={() => handleTap(obj.id)}
                state={tileState[obj.id] ?? 'idle'}
                disabled={locked}
              />
            ))}
          </View>
        </View>
        <Text style={styles.hint}>Tap the picture that matches the word</Text>
      </View>

      <View style={styles.toolkit}>
        {OBJECTS.map((obj) => (
          <View
            key={obj.id}
            style={[
              styles.toolSlot,
              obj.id === CORRECT_ID && targetFound && styles.toolSlotDone,
            ]}
          >
            <Text style={styles.toolEmoji}>{obj.id === CORRECT_ID && targetFound ? '✓' : obj.emoji}</Text>
          </View>
        ))}
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
    borderColor: T.shelfBorder,
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
    borderColor: T.shelfBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  foundPill: {
    backgroundColor: T.wood,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.woodBorder,
  },
  foundPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.shelf,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.shelfBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 12, fontWeight: '800', color: T.accentDeep, textTransform: 'uppercase' },
  prompt: { fontSize: 18, fontWeight: '800', color: T.ink },
  shelfArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, gap: 12 },
  shelfFrame: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 2,
    borderColor: T.woodBorder,
    padding: 18,
    ...BUILDER_SESSION.shadow.card,
  },
  shelfLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
    textAlign: 'center',
  },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  tile: {
    width: 108,
    minHeight: 118,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    overflow: 'hidden',
    ...BUILDER_SESSION.shadow.soft,
  },
  woodLip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: T.wood,
    borderBottomWidth: 1,
    borderBottomColor: T.woodBorder,
  },
  tileEmoji: { fontSize: 48, marginBottom: 6 },
  tileLabel: { fontSize: 14, fontWeight: '900', color: T.ink },
  hint: { fontSize: 13, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  toolkit: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  toolSlot: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: T.shelfBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolSlotDone: { backgroundColor: 'rgba(220, 252, 231, 0.9)', borderColor: T.shelfCorrect },
  toolEmoji: { fontSize: 22 },
});
