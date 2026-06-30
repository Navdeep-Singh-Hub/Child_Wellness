/**
 * Level 7 Reader — Session 3, Game 4: Pattern Pulse
 * Complete pattern: triangle, square, triangle, square, ? → triangle.
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

const PATTERN = ['triangle', 'square', 'triangle', 'square'] as const;
type ShapeId = 'triangle' | 'square' | 'circle';

const CORRECT_ID: ShapeId = 'triangle';
const OPTIONS: { id: ShapeId; label: string; glyph: string; glow: string }[] = [
  { id: 'triangle', label: 'Triangle', glyph: '▲', glow: '#FDE68A' },
  { id: 'square', label: 'Square', glyph: '◆', glow: '#D8B4FE' },
  { id: 'circle', label: 'Circle', glyph: '●', glow: '#67E8F9' },
];

const VOICE =
  'Complete the pattern. Triangle, square, triangle, square. What comes next?';
const PULSE = { accent: '#A855F7', accentBright: '#D8B4FE', rose: '#EC4899' } as const;

const SHAPE_STYLE: Record<'triangle' | 'square', { color: string; glyph: string }> = {
  triangle: { color: '#FDE68A', glyph: '▲' },
  square: { color: '#D8B4FE', glyph: '◆' },
};

function PulseCell({ shape, index }: { shape: 'triangle' | 'square'; index: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 950 + index * 110 }),
        withTiming(0, { duration: 950 + index * 110 }),
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
    borderColor: `rgba(168,85,247,${0.4 + pulse.value * 0.5})`,
    transform: [{ scale: 1 + pulse.value * 0.06 }],
  }));

  return (
    <Animated.View style={[styles.voidSlot, anim]}>
      <LinearGradient colors={[`${PULSE.accent}55`, 'rgba(11,10,26,0.6)']} style={styles.voidGrad} />
      <Text style={styles.voidQ}>?</Text>
      <Text style={styles.voidLbl}>NEXT</Text>
    </Animated.View>
  );
}

function GlyphOrb({
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
          ? PULSE.accentBright
          : RD.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={option.label}
      >
        <View style={[styles.orbHalo, { backgroundColor: `${option.glow}22` }]} />
        <Text style={[styles.orbGlyph, { color: option.glow }]}>{option.glyph}</Text>
        <Text style={styles.orbLabel}>{option.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface PatternBuilderReaderSession3GameProps {
  onComplete: () => void;
}

export function PatternBuilderReaderSession3Game({ onComplete }: PatternBuilderReaderSession3GameProps) {
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
          id === 'square'
            ? 'Square was just before. The pattern alternates!'
            : 'Circle does not fit. Triangle and square repeat!',
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
      ? 'Triangle and square alternate — what follows square?'
      : 'Say it aloud: ▲ ◆ ▲ ◆ — ?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Pattern Pulse!"
        subtitle="You completed the alternating sequence!"
        badgeEmoji="🔷"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="PATTERN PULSE · GAME 4"
      title="Complete the pattern"
      instruction="Triangle, square, triangle, square — what comes next?"
      mascot="🔷"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.railWrap}>
        <LinearGradient
          colors={[`${PULSE.accent}44`, 'transparent', `${PULSE.rose}33`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.railGlow}
        />
        <Text style={styles.railLabel}>PULSE RAIL</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((shape, i) => (
            <PulseCell key={i} shape={shape} index={i} />
          ))}
          <VoidSlot />
        </View>
        <View style={styles.altRow}>
          <Text style={styles.altTag}>▲</Text>
          <Text style={styles.altArrow}>↔</Text>
          <Text style={styles.altTag}>◆</Text>
          <Text style={styles.altArrow}>↔</Text>
          <Text style={styles.altTag}>▲</Text>
          <Text style={styles.altArrow}>↔</Text>
          <Text style={styles.altTag}>◆</Text>
        </View>
      </View>

      <Text style={styles.prompt}>Tap the next shape</Text>

      <View style={styles.choicesRow}>
        {OPTIONS.map((opt) => (
          <GlyphOrb
            key={opt.id}
            option={opt}
            selected={selected === opt.id}
            feedback={feedback}
            onPress={() => handleTap(opt.id)}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>Pattern rule: ▲ and ◆ alternate in orbit</Text>
      </View>
    </ReaderGameShell>
  );
}

const styles = StyleSheet.create({
  railWrap: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PULSE.accent}55`,
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
    color: PULSE.accentBright,
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
  altTag: { fontSize: 12, fontWeight: '900', color: PULSE.accentBright },
  altArrow: { fontSize: 11, fontWeight: '900', color: PULSE.rose, opacity: 0.85 },
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
  cellGlyph: { fontSize: 26, fontWeight: '900' },
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
  voidQ: { fontSize: 26, fontWeight: '900', color: PULSE.accentBright },
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
  orbGlyph: { fontSize: 42, fontWeight: '900' },
  orbLabel: { fontSize: 13, fontWeight: '800', color: RD.textMuted, marginTop: 6 },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(168,85,247,0.12)',
    borderWidth: 1,
    borderColor: `${PULSE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: PULSE.accentBright, textAlign: 'center' },
});
