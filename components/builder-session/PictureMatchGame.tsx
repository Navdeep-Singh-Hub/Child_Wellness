/**
 * Builder Session 2 — Game 2: Orchard Picture Row
 * Tap the APPLE among picture tiles.
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
import { BUILDER_SESSION, PICTURE_PICK_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const ITEMS = [
  { id: 'apple', label: 'APPLE', emoji: '🍎' },
  { id: 'banana', label: 'BANANA', emoji: '🍌' },
  { id: 'ball', label: 'BALL', emoji: '⚽' },
] as const;

const CORRECT_ID = 'apple';
const PROMPT = 'Tap the APPLE';

function PictureTile({
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
    state === 'correct' ? T.tileCorrect : state === 'wrong' ? T.tileWrong : T.stallBorder;
  const bg =
    state === 'correct'
      ? 'rgba(220, 252, 231, 0.95)'
      : state === 'wrong'
        ? 'rgba(254, 226, 226, 0.9)'
        : T.stall;

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
        <Text style={styles.tileEmoji}>{emoji}</Text>
        <Text style={styles.tileLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface PictureMatchGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function PictureMatchGame({
  onComplete,
  onBack,
  currentStep = 2,
  totalSteps = 5,
  sessionTitle,
}: PictureMatchGameProps) {
  const [tileState, setTileState] = useState<Record<string, 'idle' | 'wrong' | 'correct'>>({});
  const [found, setFound] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [locked, setLocked] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint(`${PROMPT}. Look at the pictures on the orchard row!`);
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
        setFound(true);
        setTileState((s) => ({ ...s, [id]: 'correct' }));
        speakBuilderHint('Correct! You found the apple!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
        return;
      }

      setTileState((s) => ({ ...s, [id]: 'wrong' }));
      speakBuilderHint('Try again. Tap the apple!');
      setTimeout(() => setTileState((s) => ({ ...s, [id]: 'idle' })), 500);
    },
    [locked, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Picture Picked!"
          subtitle="You found the apple on the orchard row!"
          badgeEmoji="🍎"
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

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>
              Build {currentStep} · {progressPct}%
            </Text>
          </View>
          <View style={styles.targetPill}>
            <Text style={styles.targetPillText}>{found ? '✓' : '🍎'} target</Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Pressable onPress={() => speakBuilderHint(PROMPT)}>
              <Text style={styles.prompt}>{PROMPT} 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.stallArea}>
        <View style={styles.stallFrame}>
          <Text style={styles.stallLabel}>Orchard Row</Text>
          <View style={styles.targetBanner}>
            <Text style={styles.targetEmoji}>🍎</Text>
            <Text style={styles.targetText}>Find: APPLE</Text>
          </View>
          <View style={styles.tileRow}>
            {ITEMS.map((item) => (
              <PictureTile
                key={item.id}
                label={item.label}
                emoji={item.emoji}
                onPress={() => handleTap(item.id)}
                state={tileState[item.id] ?? 'idle'}
                disabled={locked}
              />
            ))}
          </View>
        </View>
        <Text style={styles.hint}>Which picture matches the word?</Text>
      </View>

      <View style={styles.footerRow}>
        {ITEMS.map((item) => (
          <View
            key={item.id}
            style={[
              styles.footerDot,
              item.id === CORRECT_ID && found && styles.footerDotDone,
            ]}
          >
            <Text style={styles.footerEmoji}>
              {item.id === CORRECT_ID && found ? '✓' : item.emoji}
            </Text>
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
    borderColor: T.stallBorder,
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
    borderColor: T.stallBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  targetPill: {
    backgroundColor: 'rgba(254, 226, 226, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.targetRing,
  },
  targetPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.stall,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.stallBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 12, fontWeight: '800', color: T.accentDeep, textTransform: 'uppercase' },
  prompt: { fontSize: 18, fontWeight: '800', color: T.ink },
  stallArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, gap: 12 },
  stallFrame: {
    backgroundColor: T.stall,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 2,
    borderColor: T.stallBorder,
    padding: 18,
    ...BUILDER_SESSION.shadow.card,
  },
  stallLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    textAlign: 'center',
  },
  targetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(254, 226, 226, 0.55)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: T.targetRing,
    paddingVertical: 8,
    marginBottom: 14,
  },
  targetEmoji: { fontSize: 28 },
  targetText: { fontSize: 16, fontWeight: '900', color: T.accentDeep, letterSpacing: 1 },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  tile: {
    width: 108,
    minHeight: 118,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    ...BUILDER_SESSION.shadow.soft,
  },
  tileEmoji: { fontSize: 48, marginBottom: 6 },
  tileLabel: { fontSize: 12, fontWeight: '900', color: T.ink },
  hint: { fontSize: 13, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  footerDot: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: T.stallBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerDotDone: { backgroundColor: 'rgba(220, 252, 231, 0.9)', borderColor: T.tileCorrect },
  footerEmoji: { fontSize: 22 },
});
