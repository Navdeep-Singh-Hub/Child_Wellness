/**
 * Game 1 — Surface Scout: find the cup ON the table.
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Position = 'on' | 'under' | 'in';

const OPTIONS: { id: Position; label: string; short: string; hint: string }[] = [
  { id: 'on', label: 'Cup ON the table', short: 'ON', hint: 'Resting on top' },
  { id: 'under', label: 'Cup under the table', short: 'UNDER', hint: 'Below surface' },
  { id: 'in', label: 'Cup in the table', short: 'IN', hint: 'Inside (not ON)' },
];

const CORRECT: Position = 'on';
const VOICE = 'Tap the picture where the cup is ON the table.';

const SURFACE = { sky: '#38BDF8', skyGlow: '#7DD3FC', wood: '#D97706', woodDark: '#92400E' } as const;

function TableScene({ position }: { position: Position }) {
  return (
    <View style={scene.wrap}>
      <View style={scene.floor} />
      {position === 'under' && <View style={[scene.cup, scene.cupUnder]} />}
      <View style={scene.table}>
        <LinearGradient colors={['#FCD34D', '#D97706', '#92400E']} style={scene.tableGrad} />
        {position === 'in' && <View style={[scene.cup, scene.cupIn]} />}
      </View>
      {position === 'on' && (
        <>
          <View style={[scene.cup, scene.cupOn]} />
          <View style={scene.onGlow} pointerEvents="none" />
        </>
      )}
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
          ? SURFACE.skyGlow
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
        <TableScene position={opt.id} />
        <Text style={styles.short}>{opt.short}</Text>
        <Text style={styles.hint}>{opt.hint}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function PositionChoiceOn({ onComplete }: { onComplete: () => void }) {
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
        speak('Correct! The cup is ON the table!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          position === 'under'
            ? 'That cup is UNDER the table. Look for ON top!'
            : 'That cup is IN the table. ON means on top of the surface!',
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
      ? 'ON means on top of the surface — the cup sits on the table.'
      : 'Think: resting on top, not below or inside.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="ocean"
        title="Surface Scout!"
        subtitle="You found ON — the cup sits on the table!"
        badgeEmoji="🫙"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="SURFACE SCOUT · GAME 1"
      title="Where is the cup?"
      instruction="Tap the scene where the cup is ON the table."
      mascot="🫙"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 2 · PREPOSITION ON</Text>
      </View>

      <Text style={styles.prompt}>Which scene shows ON?</Text>

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
  wrap: { width: 96, height: 88, alignItems: 'center', justifyContent: 'flex-end' },
  floor: {
    position: 'absolute',
    bottom: 2,
    width: 84,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(56,189,248,0.2)',
  },
  table: {
    width: 72,
    height: 22,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: SURFACE.woodDark,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableGrad: { ...StyleSheet.absoluteFillObject },
  cup: {
    width: 20,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  cupOn: { position: 'absolute', bottom: 34, zIndex: 2 },
  cupUnder: { position: 'absolute', bottom: 22, zIndex: 0 },
  cupIn: { width: 16, height: 20 },
  onGlow: {
    position: 'absolute',
    bottom: 30,
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(56,189,248,0.2)',
  },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(56,189,248,0.15)',
    borderWidth: 1,
    borderColor: `${SURFACE.sky}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: SURFACE.skyGlow },
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
    backgroundColor: 'rgba(56,189,248,0.1)',
  },
  short: { fontSize: 15, fontWeight: '900', color: SURFACE.skyGlow, letterSpacing: 1, marginTop: 8 },
  hint: { fontSize: 10, fontWeight: '600', color: LL.textMuted, marginTop: 2 },
});
