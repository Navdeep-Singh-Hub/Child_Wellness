/**
 * Game 1 — Shade Scout: find the cat UNDER the table.
 * Logic Lab · Section 6 · Session 3 (Preposition UNDER)
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Position = 'under' | 'on' | 'in';

const OPTIONS: { id: Position; label: string; short: string; hint: string }[] = [
  { id: 'under', label: 'Cat under table', short: 'UNDER', hint: 'Below the table' },
  { id: 'on', label: 'Cat on table', short: 'ON', hint: 'On top (not under)' },
  { id: 'in', label: 'Cat in box', short: 'IN', hint: 'Inside a box' },
];

const CORRECT: Position = 'under';
const VOICE = 'Tap the picture where the cat is UNDER the table.';

const SHADE = { violet: '#7C3AED', glow: '#A78BFA', shadow: '#4C1D95', dusk: '#312E81' } as const;

function CatScene({ position }: { position: Position }) {
  if (position === 'in') {
    return (
      <View style={scene.wrap}>
        <View style={scene.box}>
          <LinearGradient colors={['#C4B5FD', '#7C3AED', '#5B21B6']} style={scene.boxGrad} />
          <Text style={scene.catEmoji}>🐱</Text>
        </View>
        <Text style={scene.floorHint}>in box</Text>
      </View>
    );
  }

  return (
    <View style={scene.wrap}>
      <View style={scene.floor} />
      {position === 'under' && (
        <>
          <View style={scene.shadowZone} />
          <Text style={[scene.catEmoji, scene.catUnder]}>🐱</Text>
        </>
      )}
      <View style={scene.table}>
        <LinearGradient colors={['#D4A574', '#92400E']} style={scene.tableGrad} />
      </View>
      {position === 'on' && <Text style={[scene.catEmoji, scene.catOn]}>🐱</Text>}
    </View>
  );
}

function ChoiceCard({
  opt,
  selected,
  feedback,
  onPress,
}: {
  opt: (typeof OPTIONS)[number];
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (feedback === 'wrong' && selected) {
      shake.value = withSequence(
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [feedback, selected, shake]);

  useEffect(() => {
    if (feedback === 'correct' && selected) {
      scale.value = withSpring(1.05, { damping: 8 }, () => {
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
          ? SHADE.glow
          : LL.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={opt.label}
        accessibilityState={{ selected }}
      >
        <View style={styles.spotlight} />
        <CatScene position={opt.id} />
        <Text style={styles.short}>{opt.short}</Text>
        <Text style={styles.hint}>{opt.hint}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function PositionChoiceUnder({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<Position | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (position: Position) => {
      if (feedback === 'correct') return;
      setSelected(position);
      setAttempts((a) => a + 1);

      if (position === CORRECT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! The cat is UNDER the table!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          position === 'on'
            ? 'That cat is ON the table. Look below for UNDER!'
            : 'That cat is IN the box. Find UNDER the table!',
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
      ? 'UNDER means below — the cat hides beneath the table.'
      : 'Look under the surface, not on top or inside.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Shade Scout!"
        subtitle="You found UNDER — below the table!"
        badgeEmoji="🐱"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="SHADE SCOUT · GAME 1"
      title="Where is the cat?"
      instruction="Tap the scene where the cat is UNDER the table."
      mascot="🐱"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 3 · PREPOSITION UNDER</Text>
      </View>

      <Text style={styles.prompt}>Which scene shows UNDER?</Text>

      <View style={styles.options}>
        {OPTIONS.map((opt) => (
          <ChoiceCard
            key={opt.id}
            opt={opt}
            selected={selected === opt.id}
            feedback={feedback}
            onPress={() => handleTap(opt.id)}
          />
        ))}
      </View>
    </LogicLabGameShell>
  );
}

const scene = StyleSheet.create({
  wrap: { width: 96, height: 90, alignItems: 'center', justifyContent: 'flex-end' },
  floor: {
    position: 'absolute',
    bottom: 2,
    width: 84,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(76,29,149,0.35)',
  },
  table: {
    width: 72,
    height: 22,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#78350F',
    marginBottom: 14,
  },
  tableGrad: { ...StyleSheet.absoluteFillObject },
  shadowZone: {
    position: 'absolute',
    bottom: 34,
    width: 68,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(76,29,149,0.45)',
    borderWidth: 1,
    borderColor: `${SHADE.glow}44`,
  },
  catEmoji: { fontSize: 28 },
  catUnder: { position: 'absolute', bottom: 36, zIndex: 1 },
  catOn: { position: 'absolute', bottom: 34, zIndex: 2 },
  box: {
    width: 64,
    height: 54,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: SHADE.glow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  boxGrad: { ...StyleSheet.absoluteFillObject },
  floorHint: { fontSize: 9, fontWeight: '700', color: LL.textMuted },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderWidth: 1,
    borderColor: `${SHADE.violet}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: SHADE.glow },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: LL.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  card: {
    width: 128,
    backgroundColor: 'rgba(30,27,75,0.72)',
    borderRadius: 20,
    borderWidth: 2.5,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  pressed: { opacity: 0.88 },
  spotlight: {
    position: 'absolute',
    top: -16,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(167,139,250,0.1)',
  },
  short: { fontSize: 15, fontWeight: '900', color: SHADE.glow, letterSpacing: 1, marginTop: 8 },
  hint: { fontSize: 10, fontWeight: '600', color: LL.textMuted, marginTop: 2, textAlign: 'center' },
});
