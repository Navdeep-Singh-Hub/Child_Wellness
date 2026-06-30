/**
 * Game 1 — Mid Scout: find the cat BETWEEN two dogs.
 * Logic Lab · Section 6 · Session 6 (Preposition BETWEEN)
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

type Position = 'between' | 'under' | 'on';

const OPTIONS: { id: Position; label: string; short: string; hint: string }[] = [
  { id: 'between', label: 'Cat between two dogs', short: 'BETWEEN', hint: 'In the middle' },
  { id: 'under', label: 'Cat under a dog', short: 'UNDER', hint: 'Below (not middle)' },
  { id: 'on', label: 'Cat on a dog', short: 'ON', hint: 'On top (not middle)' },
];

const CORRECT: Position = 'between';
const VOICE = 'Tap the picture where the cat is BETWEEN the two dogs.';

const MID = { rose: '#F472B6', glow: '#FBCFE8', violet: '#8B5CF6', bridge: '#6366F1' } as const;

function PetScene({ position }: { position: Position }) {
  return (
    <View style={scene.wrap}>
      <LinearGradient colors={[`${MID.violet}22`, 'transparent']} style={scene.sky} />
      <View style={scene.ground} />
      {position === 'between' && (
        <>
          <View style={scene.bridgeGlow} pointerEvents="none" />
          <Text style={[scene.emoji, scene.dogLeft]}>🐕</Text>
          <Text style={[scene.emoji, scene.catMid]}>🐱</Text>
          <Text style={[scene.emoji, scene.dogRight]}>🐕</Text>
        </>
      )}
      {position === 'under' && (
        <>
          <Text style={[scene.emoji, scene.dogSingle]}>🐕</Text>
          <Text style={[scene.emoji, scene.catUnder]}>🐱</Text>
        </>
      )}
      {position === 'on' && (
        <>
          <Text style={[scene.emoji, scene.dogSingle]}>🐕</Text>
          <Text style={[scene.emoji, scene.catOn]}>🐱</Text>
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
          ? MID.glow
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
        <PetScene position={opt.id} />
        <Text style={styles.short}>{opt.short}</Text>
        <Text style={styles.hint}>{opt.hint}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function PositionChoiceBetween({ onComplete }: { onComplete: () => void }) {
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
        speak('Correct! The cat is BETWEEN the two dogs!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          position === 'under'
            ? 'That cat is UNDER the dog. Look for BETWEEN — in the middle!'
            : 'That cat is ON the dog. BETWEEN means in the middle of two!',
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
      ? 'BETWEEN means in the middle — the cat sits between two dogs.'
      : 'Look for the cat sandwiched in the middle, not above or below.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Mid Scout!"
        subtitle="You found BETWEEN — cat in the middle!"
        badgeEmoji="🐱"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="MID SCOUT · GAME 1"
      title="Where is the cat?"
      instruction="Tap the scene where the cat is BETWEEN two dogs."
      mascot="🐱"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 6 · PREPOSITION BETWEEN</Text>
      </View>

      <Text style={styles.prompt}>Which scene shows BETWEEN?</Text>

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
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderWidth: 1,
    borderColor: `${MID.bridge}44`,
  },
  bridgeGlow: {
    position: 'absolute',
    bottom: 16,
    width: 56,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(244,114,182,0.18)',
  },
  emoji: { position: 'absolute', fontSize: 28 },
  dogLeft: { left: 4, bottom: 12 },
  catMid: { bottom: 14, alignSelf: 'center', fontSize: 26, zIndex: 2 },
  dogRight: { right: 4, bottom: 12 },
  dogSingle: { bottom: 12, alignSelf: 'center', fontSize: 32 },
  catUnder: { bottom: 0, alignSelf: 'center', fontSize: 22 },
  catOn: { bottom: 54, alignSelf: 'center', fontSize: 22 },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1,
    borderColor: `${MID.violet}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: MID.glow },
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
    backgroundColor: 'rgba(244,114,182,0.1)',
  },
  short: { fontSize: 14, fontWeight: '900', color: MID.glow, letterSpacing: 0.8, marginTop: 8 },
  hint: { fontSize: 10, fontWeight: '600', color: LL.textMuted, marginTop: 2, textAlign: 'center' },
});
