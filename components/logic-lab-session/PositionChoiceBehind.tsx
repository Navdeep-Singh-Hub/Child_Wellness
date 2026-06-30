/**
 * Game 1 — Trail Scout: find the boy BEHIND the tree.
 * Logic Lab · Section 6 · Session 5 (Preposition BEHIND)
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

type Position = 'behind' | 'under' | 'on';

const OPTIONS: { id: Position; label: string; short: string; hint: string }[] = [
  { id: 'behind', label: 'Boy behind tree', short: 'BEHIND', hint: 'Hidden at the back' },
  { id: 'under', label: 'Boy under tree', short: 'UNDER', hint: 'Below (not behind)' },
  { id: 'on', label: 'Boy on tree', short: 'ON', hint: 'On top (not behind)' },
];

const CORRECT: Position = 'behind';
const VOICE = 'Tap the picture where the boy is BEHIND the tree.';

const TRAIL = { deep: '#14532D', glow: '#4ADE80', bark: '#A16207', mist: '#94A3B8' } as const;

function TreeScene({ position }: { position: Position }) {
  return (
    <View style={scene.wrap}>
      <LinearGradient colors={[`${TRAIL.glow}18`, 'transparent']} style={scene.sky} />
      <View style={scene.ground} />
      {position === 'behind' && (
        <>
          <Text style={[scene.emoji, scene.boyBehind]}>👦</Text>
          <View style={scene.treeFront}>
            <Text style={scene.treeEmoji}>🌳</Text>
          </View>
          <View style={scene.peekGlow} pointerEvents="none" />
        </>
      )}
      {position === 'under' && (
        <>
          <Text style={[scene.emoji, scene.treeCenter]}>🌳</Text>
          <Text style={[scene.emoji, scene.boyUnder]}>👦</Text>
        </>
      )}
      {position === 'on' && (
        <>
          <Text style={[scene.emoji, scene.treeCenter]}>🌳</Text>
          <Text style={[scene.emoji, scene.boyOn]}>👦</Text>
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
          ? TRAIL.glow
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
        <TreeScene position={opt.id} />
        <Text style={styles.short}>{opt.short}</Text>
        <Text style={styles.hint}>{opt.hint}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function PositionChoiceBehind({ onComplete }: { onComplete: () => void }) {
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
        speak('Correct! The boy is BEHIND the tree!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          position === 'under'
            ? 'That boy is UNDER the tree. Look for BEHIND — at the back!'
            : 'That boy is ON the tree. BEHIND means hidden at the back!',
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
      ? 'BEHIND means at the back — the boy hides behind the tree trunk.'
      : 'Look for the boy peeking from the back, not above or below.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="mint"
        title="Trail Scout!"
        subtitle="You found BEHIND — boy at the back of the tree!"
        badgeEmoji="🌳"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="TRAIL SCOUT · GAME 1"
      title="Where is the boy?"
      instruction="Tap the scene where the boy is BEHIND the tree."
      mascot="🌳"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 5 · PREPOSITION BEHIND</Text>
      </View>

      <Text style={styles.prompt}>Which scene shows BEHIND?</Text>

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
  wrap: { width: 96, height: 90, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' },
  sky: { ...StyleSheet.absoluteFillObject },
  ground: {
    position: 'absolute',
    bottom: 4,
    width: 88,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(20,83,45,0.35)',
    borderWidth: 1,
    borderColor: `${TRAIL.glow}44`,
  },
  emoji: { position: 'absolute', fontSize: 30 },
  boyBehind: { left: 6, bottom: 12, zIndex: 1 },
  treeFront: { bottom: 10, zIndex: 2 },
  treeEmoji: { fontSize: 44 },
  peekGlow: {
    position: 'absolute',
    left: 4,
    bottom: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74,222,128,0.15)',
  },
  treeCenter: { bottom: 10, alignSelf: 'center' },
  boyUnder: { bottom: 0, alignSelf: 'center', fontSize: 24 },
  boyOn: { bottom: 58, alignSelf: 'center', fontSize: 24 },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(20,83,45,0.2)',
    borderWidth: 1,
    borderColor: `${TRAIL.glow}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: TRAIL.glow },
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
    backgroundColor: 'rgba(74,222,128,0.1)',
  },
  short: { fontSize: 14, fontWeight: '900', color: TRAIL.glow, letterSpacing: 0.8, marginTop: 8 },
  hint: { fontSize: 10, fontWeight: '600', color: LL.textMuted, marginTop: 2, textAlign: 'center' },
});
