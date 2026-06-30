/**
 * Level 7 Reader — Session 10, Game 4: Logic Forge
 * square, triangle, square, triangle, ? → square (alternating).
 */
import { ReaderGameShell } from '@/components/reader-session/shared/ReaderGameShell';
import { RD } from '@/components/reader-session/shared/readerTheme';
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

const PATTERN = ['square', 'triangle', 'square', 'triangle'] as const;
type ShapeId = 'square' | 'triangle' | 'circle';

const CORRECT_ID: ShapeId = 'square';
const OPTIONS: { id: ShapeId; label: string; emoji: string; glow: string }[] = [
  { id: 'square', label: 'Square', emoji: '⬜', glow: '#C4B5FD' },
  { id: 'triangle', label: 'Triangle', emoji: '🔺', glow: '#FDE68A' },
  { id: 'circle', label: 'Circle', emoji: '⭕', glow: '#67E8F9' },
];

const VOICE =
  'Complete the pattern. Square, triangle, square, triangle. What comes next?';
const FORGE = { accent: '#EAB308', glow: '#FDE047', violet: '#A855F7' } as const;

const SHAPE_STYLE: Record<'square' | 'triangle', { color: string; emoji: string }> = {
  square: { color: '#C4B5FD', emoji: '⬜' },
  triangle: { color: '#FDE68A', emoji: '🔺' },
};

function SequenceCell({ shape, index }: { shape: 'square' | 'triangle'; index: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 950 + index * 100 }),
        withTiming(0, { duration: 950 + index * 100 }),
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
        <Text style={styles.cellEmoji}>{s.emoji}</Text>
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
    borderColor: `rgba(234,179,8,${0.4 + pulse.value * 0.5})`,
    transform: [{ scale: 1 + pulse.value * 0.06 }],
  }));

  return (
    <Animated.View style={[styles.voidSlot, anim]}>
      <LinearGradient colors={[`${FORGE.accent}55`, 'rgba(11,10,26,0.6)']} style={styles.voidGrad} />
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
      ? RD.good
      : feedback === 'wrong' && selected
        ? RD.warn
        : selected
          ? FORGE.glow
          : RD.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={option.label}
      >
        <View style={[styles.orbHalo, { backgroundColor: `${option.glow}22` }]} />
        <Text style={styles.orbEmoji}>{option.emoji}</Text>
        <Text style={styles.orbLabel}>{option.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface LogicPatternReaderSession10GameProps {
  onComplete: () => void;
}

export function LogicPatternReaderSession10Game({ onComplete }: LogicPatternReaderSession10GameProps) {
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
        speak('Correct! Square comes next!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          id === 'triangle'
            ? 'Triangle was just before. The pattern alternates!'
            : 'Circle does not fit. Square and triangle repeat!',
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
      ? 'Square and triangle alternate — what follows triangle?'
      : 'Say it aloud: ⬜ 🔺 ⬜ 🔺 — ?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Logic Forge!"
        subtitle="You completed the alternating sequence!"
        badgeEmoji="⬜"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="LOGIC FORGE · GAME 4"
      title="Complete the pattern"
      instruction="Square, triangle, square, triangle — what comes next?"
      mascot="⬜"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.railWrap}>
        <LinearGradient
          colors={[`${FORGE.accent}44`, 'transparent', `${FORGE.violet}33`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.railGlow}
        />
        <Text style={styles.railLabel}>LOGIC RAIL</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((shape, i) => (
            <SequenceCell key={i} shape={shape} index={i} />
          ))}
          <VoidSlot />
        </View>
        <View style={styles.altRow}>
          <Text style={styles.altTag}>⬜</Text>
          <Text style={styles.altArrow}>↔</Text>
          <Text style={styles.altTag}>🔺</Text>
          <Text style={styles.altArrow}>↔</Text>
          <Text style={styles.altTag}>⬜</Text>
          <Text style={styles.altArrow}>↔</Text>
          <Text style={styles.altTag}>🔺</Text>
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
        <Text style={styles.legendTxt}>Pattern rule: ⬜ and 🔺 alternate in orbit</Text>
      </View>
    </ReaderGameShell>
  );
}

const styles = StyleSheet.create({
  railWrap: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${FORGE.accent}55`,
    backgroundColor: 'rgba(40,20,60,0.55)',
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
    color: FORGE.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  patternRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  altRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  altTag: { fontSize: 12, fontWeight: '900', color: FORGE.glow },
  altArrow: { fontSize: 11, fontWeight: '900', color: FORGE.violet, opacity: 0.9 },
  cellWrap: { alignItems: 'center' },
  cellGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  cell: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'rgba(11,10,26,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmoji: { fontSize: 26 },
  cellIdx: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 8,
    fontWeight: '900',
    color: RD.textMuted,
  },
  voidSlot: {
    width: 58,
    height: 58,
    borderRadius: 16,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  voidGrad: { ...StyleSheet.absoluteFillObject },
  voidQ: { fontSize: 26, fontWeight: '900', color: FORGE.glow },
  voidLbl: { fontSize: 7, fontWeight: '900', color: RD.textMuted, letterSpacing: 0.8, marginTop: 2 },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: RD.textLight,
    textAlign: 'center',
    marginBottom: 18,
  },
  choicesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  orb: {
    width: 96,
    height: 110,
    borderRadius: 20,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbHalo: { ...StyleSheet.absoluteFillObject },
  orbEmoji: { fontSize: 42 },
  orbLabel: { fontSize: 13, fontWeight: '800', color: RD.textMuted, marginTop: 6 },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(234,179,8,0.12)',
    borderWidth: 1,
    borderColor: `${FORGE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: FORGE.glow, textAlign: 'center' },
});
