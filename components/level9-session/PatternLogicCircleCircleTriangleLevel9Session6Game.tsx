/**
 * Level 9 (Clockwise) — Session 6, Game 3: Pattern Logic
 * circle, circle, triangle, square, circle, circle, ? → triangle (repeating block: circle, circle, triangle, square).
 */
import { ClockwiseGameShell } from '@/components/level9-session/shared/ClockwiseGameShell';
import { CW } from '@/components/level9-session/shared/clockwiseTheme';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { speak } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const PATTERN = ['circle', 'circle', 'triangle', 'square', 'circle', 'circle'] as const;
type ShapeId = 'circle' | 'triangle' | 'square';

const CORRECT_ID: ShapeId = 'triangle';
const OPTIONS: { id: ShapeId; label: string; emoji: string; glyph: string; glow: string }[] = [
  { id: 'circle', label: 'Circle', emoji: '⭕', glyph: '●', glow: '#6EE7B7' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺', glyph: '▲', glow: '#67E8F9' },
  { id: 'square', label: 'Square', emoji: '⬜', glyph: '◆', glow: '#FCD34D' },
];

const VOICE =
  'Complete the pattern. Circle, circle, triangle, square, circle, circle. What comes next?';
const PALETTE = { accent: '#10B981', glow: '#6EE7B7', mint: '#34D399' } as const;

const SHAPE_STYLE: Record<ShapeId, { color: string; glyph: string }> = {
  circle: { color: '#6EE7B7', glyph: '●' },
  triangle: { color: '#67E8F9', glyph: '▲' },
  square: { color: '#FCD34D', glyph: '◆' },
};

function RelayCell({ shape, index }: { shape: ShapeId; index: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 950 + index * 80 }),
        withTiming(0, { duration: 950 + index * 80 }),
      ),
      -1,
      true,
    );
  }, [drift, index]);

  const glow = useAnimatedStyle(() => ({
    opacity: 0.2 + drift.value * 0.35,
    transform: [{ scale: 1 + drift.value * 0.07 }],
  }));

  const s = SHAPE_STYLE[shape];

  return (
    <View style={styles.cellWrap}>
      <Animated.View style={[styles.cellGlow, glow, { backgroundColor: `${s.color}44` }]} />
      <View style={[styles.cell, { borderColor: `${s.color}88` }]}>
        <Text style={[styles.cellGlyph, { color: s.color }]}>{s.glyph}</Text>
        <Text style={styles.cellIdx}>{index + 1}</Text>
      </View>
    </View>
  );
}

function VoidSlot() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 700 })),
      -1,
      true,
    );
  }, [pulse]);

  const anim = useAnimatedStyle(() => ({
    borderColor: `rgba(16,185,129,${0.4 + pulse.value * 0.5})`,
    transform: [{ scale: 1 + pulse.value * 0.06 }],
  }));

  return (
    <Animated.View style={[styles.voidSlot, anim]}>
      <LinearGradient colors={[`${PALETTE.accent}55`, 'rgba(8,12,40,0.6)']} style={styles.voidGrad} />
      <Text style={styles.voidQ}>?</Text>
      <Text style={styles.voidLbl}>NEXT</Text>
    </Animated.View>
  );
}

function ShapeOrb({
  option,
  selected,
  feedback,
  onPress,
}: {
  option: (typeof OPTIONS)[number];
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (feedback === 'wrong' && selected) {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    } else if (feedback === 'correct' && selected) {
      scale.value = withSpring(1.08, { damping: 8 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [feedback, selected, shake, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  const border =
    feedback === 'correct' && selected
      ? CW.good
      : feedback === 'wrong' && selected
        ? CW.warn
        : selected
          ? PALETTE.glow
          : CW.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={option.label}
      >
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'rgba(8,12,40,0.55)']}
          style={styles.orbGrad}
        />
        <Text style={styles.orbEmoji}>{option.emoji}</Text>
        <Text style={[styles.orbGlyph, { color: option.glow }]}>{option.glyph}</Text>
        <Text style={styles.orbLabel}>{option.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface PatternLogicCircleCircleTriangleLevel9Session6GameProps {
  onComplete: () => void;
}

export function PatternLogicCircleCircleTriangleLevel9Session6Game({
  onComplete,
}: PatternLogicCircleCircleTriangleLevel9Session6GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<ShapeId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (id: ShapeId) => {
      if (feedback === 'correct') return;
      setSelected(id);
      setAttempts((a) => a + 1);

      if (id === CORRECT_ID) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Triangle comes next!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          id === 'circle'
            ? 'Two circles, then triangle, then square — you already have two circles!'
            : 'Square comes after the triangle. The next shape is triangle!',
          0.7,
        );
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
      }
    },
    [feedback, onComplete],
  );

  const coachLine =
    attempts === 0
      ? 'The block repeats: circle, circle, triangle, square — what follows the last pair?'
      : 'Say it aloud: ● ● ▲ ◆ ● ● — ?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Pattern Relay!"
        subtitle="Triangle completes the pattern!"
        badgeEmoji="🔺"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="PATTERN RELAY · GAME 3"
      title="Complete the pattern"
      instruction="Circle, circle, triangle, square, circle, circle — what comes next?"
      mascot="🔺"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.railWrap}>
        <LinearGradient
          colors={[`${PALETTE.accent}44`, 'transparent', `${PALETTE.mint}33`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.railGlow}
        />
        <Text style={styles.railLabel}>RELAY RAIL</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((shape, i) => (
            <RelayCell key={i} shape={shape} index={i} />
          ))}
          <VoidSlot />
        </View>
        <View style={styles.groupRow}>
          <Text style={styles.groupTag}>● ● ▲ ◆</Text>
          <Text style={styles.groupArrow}>↻</Text>
          <Text style={styles.groupTag}>● ● ▲ ◆</Text>
          <Text style={styles.groupArrow}>→</Text>
          <Text style={styles.groupTag}>?</Text>
        </View>
      </View>

      <Text style={styles.prompt}>Tap the next shape</Text>

      <View style={styles.choicesRow}>
        {OPTIONS.map((opt) => (
          <ShapeOrb
            key={opt.id}
            option={opt}
            selected={selected === opt.id}
            feedback={feedback}
            onPress={() => handleTap(opt.id)}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>
          Pattern rule: circle, circle, triangle, square — then repeat!
        </Text>
      </View>
    </ClockwiseGameShell>
  );
}

const styles = StyleSheet.create({
  railWrap: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.55)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  railGlow: { ...StyleSheet.absoluteFillObject },
  railLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  patternRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  groupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  groupTag: { fontSize: 12, fontWeight: '900', color: PALETTE.glow },
  groupArrow: { fontSize: 11, fontWeight: '900', color: PALETTE.mint, opacity: 0.85 },
  cellWrap: { alignItems: 'center' },
  cellGlow: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  cell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(8,12,40,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellGlyph: { fontSize: 20, fontWeight: '900' },
  cellIdx: {
    position: 'absolute',
    bottom: 1,
    right: 3,
    fontSize: 7,
    fontWeight: '900',
    color: CW.textMuted,
  },
  voidSlot: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  voidGrad: { ...StyleSheet.absoluteFillObject },
  voidQ: { fontSize: 22, fontWeight: '900', color: PALETTE.glow },
  voidLbl: { fontSize: 7, fontWeight: '900', color: CW.textMuted, letterSpacing: 0.8, marginTop: 2 },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: CW.textLight,
    textAlign: 'center',
    marginBottom: 18,
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  orb: {
    minWidth: 96,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2.5,
    alignItems: 'center',
    overflow: 'hidden',
  },
  orbGrad: { ...StyleSheet.absoluteFillObject },
  orbEmoji: { fontSize: 32, marginBottom: 2 },
  orbGlyph: { fontSize: 16, fontWeight: '900', marginBottom: 4 },
  orbLabel: { fontSize: 13, fontWeight: '800', color: CW.textMuted },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: PALETTE.glow, textAlign: 'center' },
});
