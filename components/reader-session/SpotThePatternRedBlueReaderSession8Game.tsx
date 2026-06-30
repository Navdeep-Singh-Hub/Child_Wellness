/**
 * Level 7 Reader — Session 8, Game 1: Chromatic Pulse
 * Red, blue, red, blue, ? → Red.
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

const PATTERN = ['red', 'blue', 'red', 'blue'] as const;
type ColorId = 'red' | 'blue' | 'green';

const CORRECT_ID: ColorId = 'red';
const OPTIONS: { id: ColorId; label: string; color: string; glow: string }[] = [
  { id: 'red', label: 'Red', color: '#EF4444', glow: '#FCA5A5' },
  { id: 'blue', label: 'Blue', color: '#3B82F6', glow: '#93C5FD' },
  { id: 'green', label: 'Green', color: '#22C55E', glow: '#86EFAC' },
];

const VOICE = 'What comes next? Red, blue, red, blue. Tap the next color.';
const PULSE = { accent: '#0EA5E9', glow: '#38BDF8', red: '#EF4444', blue: '#3B82F6' } as const;

const COLOR_STYLE: Record<'red' | 'blue', { color: string; glow: string }> = {
  red: { color: '#EF4444', glow: '#FCA5A5' },
  blue: { color: '#3B82F6', glow: '#93C5FD' },
};

function ColorCell({ id, index }: { id: 'red' | 'blue'; index: number }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 + index * 100 }),
        withTiming(0, { duration: 900 + index * 100 }),
      ),
      -1,
      true,
    );
  }, [drift, index]);

  const glow = useAnimatedStyle(() => ({
    opacity: 0.2 + drift.value * 0.35,
    transform: [{ scale: 1 + drift.value * 0.07 }],
  }));

  const s = COLOR_STYLE[id];

  return (
    <View style={styles.cellWrap}>
      <Animated.View style={[styles.cellGlow, glow, { backgroundColor: `${s.glow}44` }]} />
      <View style={[styles.colorOrb, { backgroundColor: s.color, borderColor: `${s.glow}88` }]}>
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
    borderColor: `rgba(14,165,233,${0.4 + pulse.value * 0.5})`,
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

function ColorChoice({
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
          ? PULSE.glow
          : RD.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.choice, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={option.label}
      >
        <View style={[styles.choiceHalo, { backgroundColor: `${option.glow}22` }]} />
        <View style={[styles.choiceDot, { backgroundColor: option.color }]} />
        <Text style={styles.choiceLabel}>{option.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface SpotThePatternRedBlueReaderSession8GameProps {
  onComplete: () => void;
}

export function SpotThePatternRedBlueReaderSession8Game({
  onComplete,
}: SpotThePatternRedBlueReaderSession8GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<ColorId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (id: ColorId) => {
      if (feedback === 'correct') return;
      setSelected(id);
      setAttempts((a) => a + 1);

      if (id === CORRECT_ID) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Red comes next!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          id === 'blue'
            ? 'Blue was just before. Red and blue alternate!'
            : 'Green does not fit. The pattern is red and blue!',
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
      ? 'Red and blue alternate — what follows blue?'
      : 'Say it aloud: red — blue — red — blue — ?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Chromatic Pulse!"
        subtitle="You spotted the red-blue pattern!"
        badgeEmoji="🔴"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="CHROMATIC PULSE · GAME 1"
      title="What comes next?"
      instruction="Red, blue, red, blue — tap the color that continues the pattern."
      mascot="🔴"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.railWrap}>
        <LinearGradient
          colors={[`${PULSE.accent}44`, 'transparent', `${PULSE.red}33`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.railGlow}
        />
        <Text style={styles.railLabel}>COLOR RAIL</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((id, i) => (
            <ColorCell key={i} id={id} index={i} />
          ))}
          <VoidSlot />
        </View>
        <View style={styles.altRow}>
          <Text style={[styles.altDot, { color: PULSE.red }]}>●</Text>
          <Text style={styles.altArrow}>↔</Text>
          <Text style={[styles.altDot, { color: PULSE.blue }]}>●</Text>
          <Text style={styles.altArrow}>↔</Text>
          <Text style={[styles.altDot, { color: PULSE.red }]}>●</Text>
          <Text style={styles.altArrow}>↔</Text>
          <Text style={[styles.altDot, { color: PULSE.blue }]}>●</Text>
        </View>
      </View>

      <Text style={styles.prompt}>Tap the next color</Text>

      <View style={styles.choicesRow}>
        {OPTIONS.map((opt) => (
          <ColorChoice
            key={opt.id}
            option={opt}
            selected={selected === opt.id}
            feedback={feedback}
            onPress={() => handleTap(opt.id)}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>Pattern rule: red and blue alternate in orbit</Text>
      </View>
    </ReaderGameShell>
  );
}

const styles = StyleSheet.create({
  railWrap: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PULSE.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.55)',
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
    color: PULSE.glow,
    textAlign: 'center',
    marginBottom: 12,
  },
  patternRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  altRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  altDot: { fontSize: 14, fontWeight: '900' },
  altArrow: { fontSize: 11, fontWeight: '900', color: PULSE.glow, opacity: 0.85 },
  cellWrap: { alignItems: 'center' },
  cellGlow: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  colorOrb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellIdx: {
    position: 'absolute',
    bottom: -14,
    fontSize: 8,
    fontWeight: '900',
    color: RD.textMuted,
  },
  voidSlot: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  voidGrad: { ...StyleSheet.absoluteFillObject },
  voidQ: { fontSize: 24, fontWeight: '900', color: PULSE.glow },
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
  choice: {
    width: 96,
    height: 110,
    borderRadius: 20,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  choiceHalo: { ...StyleSheet.absoluteFillObject },
  choiceDot: { width: 40, height: 40, borderRadius: 20, marginBottom: 8 },
  choiceLabel: { fontSize: 13, fontWeight: '800', color: RD.textMuted },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(14,165,233,0.12)',
    borderWidth: 1,
    borderColor: `${PULSE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: PULSE.glow, textAlign: 'center' },
});
