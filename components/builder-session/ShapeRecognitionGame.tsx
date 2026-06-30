/**
 * Builder Session 1 — Game 2: Blueprint Shape Bench
 * Tap the circle among blueprint shape blocks.
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
import { BUILDER_SESSION, SHAPE_BENCH_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const SHAPES = [
  { id: 'circle', label: 'Circle', kind: 'circle' as const },
  { id: 'square', label: 'Square', kind: 'square' as const },
  { id: 'triangle', label: 'Triangle', kind: 'triangle' as const },
];

const CORRECT_ID = 'circle';
const PROMPT = 'Tap the circle';
const SHAPE_SIZE = 72;

function ShapeGlyph({ kind }: { kind: 'circle' | 'square' | 'triangle' }) {
  if (kind === 'circle') {
    return (
      <View
        style={{
          width: SHAPE_SIZE,
          height: SHAPE_SIZE,
          borderRadius: SHAPE_SIZE / 2,
          backgroundColor: T.circle,
        }}
      />
    );
  }
  if (kind === 'square') {
    return (
      <View
        style={{
          width: SHAPE_SIZE,
          height: SHAPE_SIZE,
          borderRadius: 14,
          backgroundColor: T.square,
        }}
      />
    );
  }
  return (
    <View
      style={{
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderLeftWidth: SHAPE_SIZE / 2,
        borderRightWidth: SHAPE_SIZE / 2,
        borderBottomWidth: SHAPE_SIZE,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: T.triangle,
      }}
    />
  );
}

function BlockTile({
  label,
  kind,
  onPress,
  state,
  disabled,
}: {
  label: string;
  kind: 'circle' | 'square' | 'triangle';
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
    state === 'correct' ? T.blockCorrect : state === 'wrong' ? T.blockWrong : T.matBorder;
  const bg =
    state === 'correct'
      ? 'rgba(220, 252, 231, 0.95)'
      : state === 'wrong'
        ? 'rgba(254, 226, 226, 0.9)'
        : T.mat;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.block,
          { backgroundColor: bg, borderColor },
          pressed && !disabled && styles.pressed,
        ]}
        accessibilityLabel={label}
      >
        <View style={styles.glyphWrap}>
          <ShapeGlyph kind={kind} />
        </View>
        <Text style={styles.blockLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface ShapeRecognitionGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function ShapeRecognitionGame({
  onComplete,
  onBack,
  currentStep = 2,
  totalSteps = 5,
  sessionTitle,
}: ShapeRecognitionGameProps) {
  const [tileState, setTileState] = useState<Record<string, 'idle' | 'wrong' | 'correct'>>({});
  const [celebrating, setCelebrating] = useState(false);
  const [locked, setLocked] = useState(false);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakBuilderHint(`${PROMPT}. Find the round shape on the blueprint bench!`);
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
        speakBuilderHint('Correct! You found the circle!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
        return;
      }

      setTileState((s) => ({ ...s, [id]: 'wrong' }));
      speakBuilderHint('Try again. Tap the circle!');
      setTimeout(() => setTileState((s) => ({ ...s, [id]: 'idle' })), 500);
    },
    [locked, onComplete]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Shape Spotted!"
          subtitle="You found the circle on the blueprint bench!"
          badgeEmoji="⭕"
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
          <View style={styles.shapePill}>
            <Text style={styles.shapePillText}>⭕ target</Text>
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

      <View style={styles.benchArea}>
        <View style={styles.blueprintMat}>
          <View style={styles.gridRow}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View key={`g-${i}`} style={styles.gridLineV} />
            ))}
          </View>
          <Text style={styles.matLabel}>Drafting Bench</Text>
          <View style={styles.blockRow}>
            {SHAPES.map((s) => (
              <BlockTile
                key={s.id}
                label={s.label}
                kind={s.kind}
                onPress={() => handleTap(s.id)}
                state={tileState[s.id] ?? 'idle'}
                disabled={locked}
              />
            ))}
          </View>
        </View>
        <Text style={styles.hint}>Which shape is perfectly round?</Text>
      </View>

      <View style={styles.legend}>
        {SHAPES.map((s) => (
          <View key={s.id} style={styles.legendItem}>
            <View style={styles.legendMini}>
              <ShapeGlyph kind={s.kind} />
            </View>
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const miniScale = 0.35;

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
    borderColor: T.matBorder,
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
    borderColor: T.matBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  shapePill: {
    backgroundColor: 'rgba(199, 210, 254, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.matBorder,
  },
  shapePillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: T.mat,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.matBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  bubbleBody: { flex: 1, gap: 2 },
  mascotName: { fontSize: 12, fontWeight: '800', color: T.accentDeep, textTransform: 'uppercase' },
  prompt: { fontSize: 18, fontWeight: '800', color: T.ink },
  benchArea: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, gap: 12 },
  blueprintMat: {
    backgroundColor: T.mat,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 2,
    borderColor: T.matBorder,
    padding: 18,
    overflow: 'hidden',
    ...BUILDER_SESSION.shadow.card,
  },
  gridRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    opacity: 0.5,
  },
  gridLineV: {
    width: 1,
    backgroundColor: T.grid,
    height: '100%',
  },
  matLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    textAlign: 'center',
  },
  blockRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  block: {
    width: 118,
    minHeight: 130,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    ...BUILDER_SESSION.shadow.soft,
  },
  glyphWrap: {
    height: SHAPE_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  blockLabel: { fontSize: 14, fontWeight: '900', color: T.ink },
  hint: { fontSize: 13, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  legendItem: { alignItems: 'center', gap: 4 },
  legendMini: {
    transform: [{ scale: miniScale }],
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: { fontSize: 11, fontWeight: '700', color: T.inkMuted },
});
