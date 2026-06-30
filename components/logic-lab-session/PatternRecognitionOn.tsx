/**
 * Game 3 — Sun-Sky Loom: complete the yellow-blue alternating pattern.
 * Logic Lab · Section 6 · Session 2 (Preposition ON)
 */
import { LogicLabGameShell } from '@/components/logic-lab-session/shared/LogicLabGameShell';
import { LL } from '@/components/logic-lab-session/shared/logicLabTheme';
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

const PATTERN = ['yellow', 'blue', 'yellow', 'blue'] as const;
type Color = 'yellow' | 'blue' | 'red';

const CORRECT: Color = 'yellow';
const CHOICES: { id: Color; emoji: string; label: string; glow: string }[] = [
  { id: 'yellow', emoji: '🟡', label: 'Yellow', glow: '#FACC15' },
  { id: 'blue', emoji: '🔵', label: 'Blue', glow: '#60A5FA' },
  { id: 'red', emoji: '🔴', label: 'Red', glow: '#F87171' },
];

const VOICE = 'Look at the pattern. Tap the shape that comes next.';
const LOOM = { gold: '#EAB308', goldGlow: '#FDE047', sky: '#3B82F6', skyGlow: '#93C5FD' } as const;

const EMOJI: Record<'yellow' | 'blue', string> = { yellow: '🟡', blue: '🔵' };

function LoomCell({ color, index }: { color: 'yellow' | 'blue'; index: number }) {
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(
      withSequence(withTiming(1, { duration: 850 + index * 100 }), withTiming(0, { duration: 850 + index * 100 })),
      -1,
      true,
    );
  }, [drift, index]);

  const glow = useAnimatedStyle(() => ({
    opacity: 0.22 + drift.value * 0.32,
    transform: [{ scale: 1 + drift.value * 0.05 }],
  }));

  const bg = color === 'yellow' ? '#FACC1544' : '#60A5FA44';

  return (
    <View style={styles.cellWrap}>
      <Animated.View style={[styles.cellGlow, glow, { backgroundColor: bg }]} />
      <View style={[styles.cell, color === 'yellow' ? styles.cellSun : styles.cellSky]}>
        <Text style={styles.cellEmoji}>{EMOJI[color]}</Text>
        <Text style={styles.cellIdx}>{index + 1}</Text>
      </View>
    </View>
  );
}

function BlankSlot() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 680 }), withTiming(0, { duration: 680 })),
      -1,
      true,
    );
  }, [pulse]);

  const anim = useAnimatedStyle(() => ({
    borderColor: `rgba(234,179,8,${0.4 + pulse.value * 0.45})`,
    transform: [{ scale: 1 + pulse.value * 0.05 }],
  }));

  return (
    <Animated.View style={[styles.blankSlot, anim]}>
      <LinearGradient colors={[`${LOOM.gold}55`, 'rgba(15,23,42,0.5)']} style={styles.blankGrad} />
      <Text style={styles.blankQ}>?</Text>
      <Text style={styles.blankLbl}>NEXT</Text>
    </Animated.View>
  );
}

function ChoiceOrb({
  choice,
  selected,
  feedback,
  onPress,
}: {
  choice: (typeof CHOICES)[number];
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (feedback === 'wrong' && selected) {
      shake.value = withSequence(
        withTiming(10, { duration: 45 }),
        withTiming(-10, { duration: 45 }),
        withTiming(0, { duration: 45 }),
      );
    }
  }, [feedback, selected, shake]);

  useEffect(() => {
    if (feedback === 'correct' && selected) {
      scale.value = withSpring(1.1, { damping: 7 }, () => {
        scale.value = withSpring(1);
      });
    }
  }, [feedback, selected, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  const border =
    feedback === 'correct' && selected
      ? LL.good
      : feedback === 'wrong' && selected
        ? LL.warn
        : selected
          ? LOOM.goldGlow
          : LL.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={choice.label}
      >
        <View style={[styles.orbHalo, { backgroundColor: `${choice.glow}22` }]} />
        <Text style={styles.orbEmoji}>{choice.emoji}</Text>
        <Text style={styles.orbLabel}>{choice.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function PatternRecognitionOn({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<Color | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleChoice = useCallback(
    (color: Color) => {
      if (feedback === 'correct') return;
      setSelected(color);
      setAttempts((a) => a + 1);

      if (color === CORRECT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Yellow comes next!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          color === 'blue'
            ? 'Blue was just before. The pattern alternates yellow and blue!'
            : 'Red is not in this pattern. Try yellow or blue!',
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
      ? 'Yellow and blue take turns — what shape comes next?'
      : 'Say it: Yellow — Blue — Yellow — Blue — ?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Sun-Sky Loom!"
        subtitle="You wove the pattern perfectly!"
        badgeEmoji="🔶"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="SUN-SKY LOOM · GAME 3"
      title="Complete the pattern"
      instruction="Tap the shape that comes next in the sequence."
      mascot="🔶"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 2 · ON</Text>
      </View>

      <View style={styles.loomWrap}>
        <LinearGradient
          colors={[`${LOOM.gold}22`, 'transparent', `${LOOM.sky}22`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.loomGlow}
        />
        <Text style={styles.loomLabel}>WEAVE RAIL</Text>
        <View style={styles.patternRow}>
          {PATTERN.map((c, i) => (
            <LoomCell key={i} color={c} index={i} />
          ))}
          <BlankSlot />
        </View>
      </View>

      <Text style={styles.prompt}>What comes next?</Text>

      <View style={styles.choicesRow}>
        {CHOICES.map((c) => (
          <ChoiceOrb
            key={c.id}
            choice={c}
            selected={selected === c.id}
            feedback={feedback}
            onPress={() => handleChoice(c.id)}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>Rule: 🟡 and 🔵 alternate back and forth</Text>
      </View>
    </LogicLabGameShell>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(234,179,8,0.12)',
    borderWidth: 1,
    borderColor: `${LOOM.gold}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: LOOM.goldGlow },
  loomWrap: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${LOOM.gold}44`,
    backgroundColor: 'rgba(30,27,75,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 18,
    overflow: 'hidden',
  },
  loomGlow: { ...StyleSheet.absoluteFillObject },
  loomLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    color: LOOM.goldGlow,
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
  cellWrap: { alignItems: 'center' },
  cellGlow: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  cell: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSun: { borderColor: `${LOOM.gold}88`, backgroundColor: 'rgba(234,179,8,0.15)' },
  cellSky: { borderColor: `${LOOM.sky}88`, backgroundColor: 'rgba(59,130,246,0.15)' },
  cellEmoji: { fontSize: 26 },
  cellIdx: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 8,
    fontWeight: '900',
    color: LL.textMuted,
  },
  blankSlot: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blankGrad: { ...StyleSheet.absoluteFillObject },
  blankQ: { fontSize: 24, fontWeight: '900', color: LOOM.goldGlow },
  blankLbl: { fontSize: 7, fontWeight: '900', color: LL.textMuted, letterSpacing: 0.8, marginTop: 2 },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: LL.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  choicesRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, flexWrap: 'wrap' },
  orb: {
    width: 96,
    height: 108,
    borderRadius: 20,
    borderWidth: 2.5,
    backgroundColor: 'rgba(15,23,42,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbHalo: { ...StyleSheet.absoluteFillObject },
  orbEmoji: { fontSize: 40 },
  orbLabel: { fontSize: 13, fontWeight: '800', color: LL.textMuted, marginTop: 6 },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderWidth: 1,
    borderColor: `${LOOM.sky}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: LOOM.skyGlow, textAlign: 'center' },
});
