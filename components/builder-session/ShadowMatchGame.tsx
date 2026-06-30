/**
 * Builder Session 1 — Game 3: Silhouette Gallery
 * Match objects to their shadows — tap object, then tap its shadow.
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
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { BUILDER_SESSION, SHADOW_GALLERY_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const PAIRS = [
  { id: 'apple', emoji: '🍎', label: 'Apple' },
  { id: 'ball', emoji: '⚽', label: 'Ball' },
  { id: 'star', emoji: '⭐', label: 'Star' },
];

function shuffleArray<T>(arr: T[]): T[] {
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

export interface ShadowMatchGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function ShadowMatchGame({
  onComplete,
  onBack,
  currentStep = 3,
  totalSteps = 5,
  sessionTitle,
}: ShadowMatchGameProps) {
  const [objectOrder] = useState(() => shuffleArray(PAIRS));
  const [shadowOrder] = useState(() => shuffleWithoutSameColumn(objectOrder, PAIRS));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [celebrating, setCelebrating] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);

  const shake = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const matchCount = matched.size;

  useEffect(() => {
    speakBuilderHint('Match each object to its shadow. Tap an object, then tap its shadow.');
    return () => stopBuilderSpeech();
  }, []);

  const triggerWrong = useCallback(() => {
    setWrongFlash(true);
    shake.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    speakBuilderHint('Try again. Match the object to its shadow.');
    setTimeout(() => setWrongFlash(false), 400);
  }, [shake]);

  const handleObjectTap = useCallback(
    (id: string) => {
      if (matched.has(id)) return;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }
      setSelectedId(id);
      speakBuilderHint(PAIRS.find((p) => p.id === id)?.label ?? id);
    },
    [matched]
  );

  const handleShadowTap = useCallback(
    (id: string) => {
      if (matched.has(id)) return;
      if (selectedId !== id) {
        triggerWrong();
        setSelectedId(null);
        return;
      }
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        /* ignore */
      }
      speakBuilderHint(`Correct! ${PAIRS.find((p) => p.id === id)?.label} matches!`);
      const next = new Set(matched).add(id);
      setMatched(next);
      setSelectedId(null);
      if (next.size >= objectOrder.length) {
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [selectedId, matched, onComplete, triggerWrong, objectOrder.length]
  );

  const rowShake = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Gallery Complete!"
          subtitle="You matched every object to its shadow!"
          badgeEmoji="🌓"
          variant="indigo"
        />
      </View>
    );
  }

  const selectedLabel = PAIRS.find((p) => p.id === selectedId)?.label;

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
          <View style={styles.matchPill}>
            <Text style={styles.matchPillText}>
              {matchCount}/{PAIRS.length} paired
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
                speakBuilderHint('Match each object to its shadow. Tap an object, then tap its shadow.')
              }
            >
              <Text style={styles.prompt}>Tap object → tap shadow 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.gallery}>
        <View style={[styles.panel, wrongFlash && styles.panelWrong]}>
          <Text style={styles.panelLabel}>Bright Objects</Text>
          <Animated.View style={[styles.cardRow, rowShake]}>
            {objectOrder.map((p) => {
              const isSelected = selectedId === p.id;
              const isMatched = matched.has(p.id);
              return (
                <Pressable
                  key={p.id}
                  onPress={() => handleObjectTap(p.id)}
                  style={[
                    styles.objectCard,
                    isSelected && styles.objectSelected,
                    isMatched && styles.objectMatched,
                  ]}
                  accessibilityLabel={p.label}
                >
                  <Text style={styles.objectEmoji}>{p.emoji}</Text>
                  <Text style={styles.objectLabel}>{p.label}</Text>
                  {isMatched ? <Text style={styles.checkMark}>✓</Text> : null}
                </Pressable>
              );
            })}
          </Animated.View>
        </View>

        <View style={styles.connector}>
          <Ionicons name="arrow-down" size={22} color={T.accent} />
        </View>

        <View style={styles.shadowPanel}>
          <Text style={styles.shadowPanelLabel}>Shadow Wall</Text>
          <View style={styles.cardRow}>
            {shadowOrder.map((p) => {
              const isMatched = matched.has(p.id);
              const isTarget = selectedId === p.id;
              return (
                <Pressable
                  key={`shadow-${p.id}`}
                  onPress={() => handleShadowTap(p.id)}
                  style={[
                    styles.shadowCard,
                    isMatched && styles.shadowMatched,
                    isTarget && styles.shadowTarget,
                  ]}
                  accessibilityLabel={`Shadow of ${p.label}`}
                >
                  <View style={styles.silhouette}>
                    <Text style={styles.shadowEmoji}>{p.emoji}</Text>
                  </View>
                  {isMatched ? <Text style={styles.shadowCheck}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        {selectedId ? (
          <Text style={styles.hint}>Now tap the shadow for {selectedLabel}</Text>
        ) : (
          <Text style={styles.hint}>Pick an object above to begin</Text>
        )}
      </View>

      <View style={styles.meterRow}>
        {PAIRS.map((p) => (
          <View
            key={p.id}
            style={[styles.meterDot, matched.has(p.id) && styles.meterDotDone]}
          >
            <Text style={styles.meterEmoji}>{matched.has(p.id) ? '✓' : p.emoji}</Text>
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
    borderColor: T.panelBorder,
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
    borderColor: T.panelBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  matchPill: {
    backgroundColor: T.shadowPanel,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.shadowBorder,
  },
  matchPillText: { fontSize: 12, fontWeight: '800', color: '#E2E8F0' },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 14, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
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
  mascotName: { fontSize: 12, fontWeight: '800', color: T.accentDeep, textTransform: 'uppercase' },
  prompt: { fontSize: 16, fontWeight: '800', color: T.ink },
  gallery: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', gap: 8 },
  panel: {
    backgroundColor: T.panel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 2,
    borderColor: T.objectBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.soft,
  },
  panelWrong: { borderColor: T.wrong },
  panelLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    textAlign: 'center',
  },
  cardRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  objectCard: {
    width: 96,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: T.objectBorder,
    alignItems: 'center',
    position: 'relative',
  },
  objectSelected: { borderColor: T.objectSelected, backgroundColor: '#ECFDF5' },
  objectMatched: { borderColor: '#22C55E', backgroundColor: T.objectMatched, opacity: 0.92 },
  objectEmoji: { fontSize: 38, marginBottom: 4 },
  objectLabel: { fontSize: 12, fontWeight: '800', color: T.ink },
  checkMark: {
    position: 'absolute',
    top: 4,
    right: 8,
    fontSize: 14,
    fontWeight: '900',
    color: '#16A34A',
  },
  connector: { alignItems: 'center', paddingVertical: 2 },
  shadowPanel: {
    backgroundColor: T.shadowPanel,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 2,
    borderColor: T.shadowBorder,
    padding: 14,
    ...BUILDER_SESSION.shadow.card,
  },
  shadowPanelLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    textAlign: 'center',
  },
  shadowCard: {
    width: 96,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: T.shadowBorder,
    alignItems: 'center',
    position: 'relative',
  },
  shadowTarget: { borderColor: T.accentSoft, backgroundColor: 'rgba(99, 102, 241, 0.2)' },
  shadowMatched: { borderColor: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  silhouette: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: T.shadowBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowEmoji: { fontSize: 30, opacity: 0.35 },
  shadowCheck: {
    position: 'absolute',
    top: 4,
    right: 8,
    fontSize: 14,
    fontWeight: '900',
    color: '#86EFAC',
  },
  hint: { fontSize: 14, fontWeight: '700', color: T.inkMuted, textAlign: 'center', marginTop: 4 },
  meterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  meterDot: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: T.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meterDotDone: { backgroundColor: 'rgba(220, 252, 231, 0.9)', borderColor: '#22C55E' },
  meterEmoji: { fontSize: 20 },
});
