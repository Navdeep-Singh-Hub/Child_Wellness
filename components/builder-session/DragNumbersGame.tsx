/**
 * Builder Session 5 — Game 3: Number Ledge Row
 * Tap numbers 1, 2, 3 in order to fill slots.
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
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { BUILDER_SESSION, NUMBER_LEDGE_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

const NUMBERS = ['1', '2', '3'];
const TARGET = ['1', '2', '3'];

function NumTile({
  num,
  onPress,
  wrong,
}: {
  num: string;
  onPress: () => void;
  wrong: boolean;
}) {
  const shake = useSharedValue(0);

  useEffect(() => {
    if (wrong) {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [wrong, shake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.tile,
          wrong && styles.tileWrong,
          pressed && styles.pressed,
        ]}
        accessibilityLabel={`Number ${num}`}
      >
        <Text style={styles.tileNum}>{num}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface DragNumbersGameProps {
  onComplete: () => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}

export function DragNumbersGame({
  onComplete,
  onBack,
  currentStep = 3,
  totalSteps = 5,
  sessionTitle,
}: DragNumbersGameProps) {
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const [usedNums, setUsedNums] = useState<Set<string>>(() => new Set());
  const [celebrating, setCelebrating] = useState(false);
  const [wrongNum, setWrongNum] = useState<string | null>(null);

  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const filledCount = slots.filter(Boolean).length;

  useEffect(() => {
    speakBuilderHint('Arrange the numbers in order: 1, then 2, then 3.');
    return () => stopBuilderSpeech();
  }, []);

  const nextIndex = slots.findIndex((s) => s === null);
  const expected = nextIndex >= 0 ? TARGET[nextIndex] : null;

  const handleTap = useCallback(
    (num: string) => {
      if (celebrating || usedNums.has(num)) return;
      if (num !== expected) {
        setWrongNum(num);
        speakBuilderHint('Tap 1 first, then 2, then 3.');
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {
          /* ignore */
        }
        setTimeout(() => setWrongNum(null), 500);
        return;
      }

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }

      const next = [...slots];
      next[nextIndex] = num;
      setSlots(next);
      setUsedNums((prev) => new Set(prev).add(num));
      speakBuilderHint(num);

      if (nextIndex === 2) {
        speakBuilderHint('One, two, three! Great job!');
        setCelebrating(true);
        setTimeout(() => onComplete(), 2200);
      }
    },
    [celebrating, nextIndex, onComplete, slots, usedNums, expected]
  );

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Numbers Arranged!"
          subtitle="You lined up 1, 2, 3 on the ledge!"
          badgeEmoji="🔢"
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
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{filledCount}/3 placed</Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.speechBubble}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Pressable onPress={() => speakBuilderHint('Tap numbers one, two, three in order.')}>
              <Text style={styles.prompt}>Arrange 1, 2, 3 🔊</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        <View style={styles.desk}>
          <Text style={styles.deskLabel}>Number Ledge</Text>
          <View style={styles.slotsRow}>
            {slots.map((val, i) => (
              <View key={i} style={[styles.slot, val && styles.slotFilled]}>
                <Text style={styles.slotText}>{val ?? '?'}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.hint}>Tap numbers below in order</Text>

        <View style={styles.tilesRow}>
          {NUMBERS.map((num) =>
            usedNums.has(num) ? (
              <View key={num} style={styles.tileGhost} />
            ) : (
              <NumTile key={num} num={num} onPress={() => handleTap(num)} wrong={wrongNum === num} />
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
    borderColor: T.deskBorder,
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
    borderColor: T.deskBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  countPill: {
    backgroundColor: 'rgba(224, 231, 255, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.accentSoft,
  },
  countPillText: { fontSize: 12, fontWeight: '800', color: T.ink },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
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
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20 },
  playArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', gap: 16 },
  desk: {
    backgroundColor: T.desk,
    borderRadius: BUILDER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.deskBorder,
    padding: 18,
    alignItems: 'center',
    ...BUILDER_SESSION.shadow.card,
  },
  deskLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  slotsRow: { flexDirection: 'row', gap: 12 },
  slot: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: T.slot,
    borderWidth: 3,
    borderColor: T.slotBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: { backgroundColor: T.slotFilled, borderColor: T.accentSoft },
  slotText: { fontSize: 32, fontWeight: '900', color: T.accentDeep },
  hint: { fontSize: 13, fontWeight: '700', color: T.inkMuted, textAlign: 'center' },
  tilesRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  tile: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: T.tile,
    borderWidth: 3,
    borderColor: T.tileBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...BUILDER_SESSION.shadow.soft,
  },
  tileWrong: { borderColor: T.tileWrong, backgroundColor: 'rgba(254, 226, 226, 0.9)' },
  tileGhost: { width: 72, height: 72 },
  tileNum: { fontSize: 36, fontWeight: '900', color: T.accentDeep },
});
