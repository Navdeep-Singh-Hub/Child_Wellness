/**
 * Game 4 — Sort by size. Small ball, Medium ball, Large ball. Child picks correct size for each. Session 6: Story Understanding.
 */
import { GraduateGameShell } from '@/components/graduate-session/shared/GraduateGameShell';
import { GR } from '@/components/graduate-session/shared/graduateTheme';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { speak } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type BallSize = 'small' | 'medium' | 'large';

const BALLS: { id: string; label: string; size: BallSize; emojiSize: number }[] = [
  { id: 'small', label: 'Small ball', size: 'small', emojiSize: 28 },
  { id: 'medium', label: 'Medium ball', size: 'medium', emojiSize: 44 },
  { id: 'large', label: 'Large ball', size: 'large', emojiSize: 64 },
];

const VOICE = 'Sort the objects by size. Tap Small, Medium, or Large.';

const PALETTE = { accent: '#EC4899', glow: '#F9A8D4', secondary: '#F472B6' } as const;

const SIZE_META: Record<
  BallSize,
  { label: string; previewSize: number; accent: string; glow: string }
> = {
  small: { label: 'Small', previewSize: 22, accent: '#38BDF8', glow: '#7DD3FC' },
  medium: { label: 'Medium', previewSize: 34, accent: '#F472B6', glow: '#F9A8D4' },
  large: { label: 'Large', previewSize: 48, accent: '#A78BFA', glow: '#C4B5FD' },
};

const COACH: Record<string, string> = {
  small: 'This ball is tiny — tap Small!',
  medium: 'Not too big, not too small — tap Medium!',
  large: 'This is the biggest ball — tap Large!',
};

function SizeChip({
  size,
  shake,
  onPress,
}: {
  size: BallSize;
  shake: boolean;
  onPress: () => void;
}) {
  const meta = SIZE_META[size];
  const shakeX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (shake) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [shake, shakeX]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.chipWrap, anim]}>
      <Pressable
        onPress={() => {
          scale.value = withSpring(0.96, { damping: 10 });
          setTimeout(() => {
            scale.value = withSpring(1, { damping: 10 });
          }, 120);
          onPress();
        }}
        style={({ pressed }) => [
          styles.sizeChip,
          { borderColor: `${meta.accent}88`, backgroundColor: `${meta.accent}22` },
          pressed && styles.pressed,
        ]}
        accessibilityLabel={meta.label}
      >
        <LinearGradient colors={[`${meta.accent}33`, 'rgba(11,10,26,0.55)']} style={styles.chipGrad} />
        <Text style={[styles.chipBall, { fontSize: meta.previewSize }]}>⚽</Text>
        <Text style={[styles.chipLabel, { color: meta.glow }]}>{meta.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function SizeSortingGame({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongSize, setWrongSize] = useState<BallSize | null>(null);
  const [sortedIds, setSortedIds] = useState<string[]>([]);

  const current = BALLS[index];
  const progressPct = (index / BALLS.length) * 100;

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleSize = useCallback(
    (size: BallSize) => {
      if (size !== current.size) {
        setWrongSize(size);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again.', 0.65);
        setTimeout(() => setWrongSize(null), 700);
        return;
      }

      const sizeLabel = SIZE_META[size].label;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speak(`Correct! This is a ${sizeLabel} ball!`, 0.7);
      setSortedIds((prev) => [...prev, current.id]);

      if (index >= BALLS.length - 1) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [current, index, onComplete],
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You sorted by size!"
        badgeEmoji="📐"
      />
    );
  }

  return (
    <GraduateGameShell
      studio="SIZE SORT · GAME 4"
      title="Sort by size"
      instruction="Sort the objects by size."
      mascot="📐"
      coachLine={COACH[current.id] ?? 'Compare the ball — is it Small, Medium, or Large?'}
      onReplayVoice={playVoice}
    >
      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>SIZE ROUNDS</Text>
          <Text style={styles.progressCount}>
            {index + 1} / {BALLS.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[PALETTE.accent, PALETTE.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.sortFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.sortGlow}
        />
        <Text style={styles.frameLabel}>ACTIVE BALL</Text>
        <Text style={styles.prompt}>What size is this ball?</Text>

        <View style={styles.ballDisplay}>
          <Text style={[styles.ballEmoji, { fontSize: current.emojiSize }]}>⚽</Text>
          <Text style={styles.ballLabel}>{current.label}</Text>
        </View>

        <View style={styles.sizesRow}>
          {(['small', 'medium', 'large'] as const).map((size) => (
            <SizeChip
              key={size}
              size={size}
              shake={wrongSize === size}
              onPress={() => handleSize(size)}
            />
          ))}
        </View>

        {sortedIds.length > 0 ? (
          <View style={styles.sortedTray}>
            <Text style={styles.sortedLabel}>SORTED</Text>
            <View style={styles.sortedRow}>
              {sortedIds.map((id) => {
                const ball = BALLS.find((b) => b.id === id)!;
                return (
                  <View key={id} style={styles.sortedChip}>
                    <Text style={[styles.sortedBall, { fontSize: ball.emojiSize * 0.45 }]}>⚽</Text>
                    <Text style={styles.sortedTag}>{SIZE_META[ball.size].label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}
      </View>
    </GraduateGameShell>
  );
}

const styles = StyleSheet.create({
  progressWrap: { marginBottom: 14 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: PALETTE.glow },
  progressCount: { fontSize: 14, fontWeight: '900', color: GR.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  sortFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(15,10,30,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
    alignItems: 'center',
  },
  sortGlow: { ...StyleSheet.absoluteFillObject },
  frameLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    marginBottom: 8,
    textAlign: 'center',
  },
  prompt: {
    fontSize: 18,
    fontWeight: '900',
    color: GR.textLight,
    marginBottom: 14,
    textAlign: 'center',
  },
  ballDisplay: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}88`,
    backgroundColor: 'rgba(236,72,153,0.22)',
    paddingVertical: 24,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginBottom: 18,
    minWidth: 180,
  },
  ballEmoji: { marginBottom: 8 },
  ballLabel: { fontSize: 18, fontWeight: '900', color: PALETTE.glow },
  sizesRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  chipWrap: { flex: 1, minWidth: 92, maxWidth: 120 },
  sizeChip: {
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    overflow: 'hidden',
  },
  chipGrad: { ...StyleSheet.absoluteFillObject },
  chipBall: { marginBottom: 4 },
  chipLabel: { fontSize: 14, fontWeight: '900' },
  sortedTray: {
    marginTop: 16,
    width: '100%',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: `${PALETTE.glow}44`,
    backgroundColor: 'rgba(11,10,26,0.45)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  sortedLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: GR.textMuted,
    marginBottom: 8,
  },
  sortedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  sortedChip: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderWidth: 1,
    borderColor: GR.good,
    minWidth: 64,
  },
  sortedBall: { marginBottom: 2 },
  sortedTag: { fontSize: 10, fontWeight: '800', color: GR.good },
  pressed: { opacity: 0.88 },
});
