/**
 * Game 1 — Side Scout: find the dog NEXT TO the boy.
 * Logic Lab · Section 6 · Session 4 (Preposition NEXT TO)
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

type Position = 'nextto' | 'under' | 'on';

const OPTIONS: { id: Position; label: string; short: string; hint: string }[] = [
  { id: 'nextto', label: 'Dog next to boy', short: 'NEXT TO', hint: 'Side by side' },
  { id: 'under', label: 'Dog under boy', short: 'UNDER', hint: 'Below (not beside)' },
  { id: 'on', label: 'Dog on boy', short: 'ON', hint: 'On top (not beside)' },
];

const CORRECT: Position = 'nextto';
const VOICE = 'Tap the picture where the dog is NEXT TO the boy.';

const SIDE = { coral: '#F97316', glow: '#FDBA74', mint: '#34D399', path: '#FEF3C7' } as const;

function PairGlow() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 700 })),
      -1,
      true,
    );
  }, [pulse]);

  const anim = useAnimatedStyle(() => ({
    opacity: 0.2 + pulse.value * 0.35,
    transform: [{ scaleX: 0.85 + pulse.value * 0.15 }],
  }));

  return <Animated.View style={[scene.pairGlow, anim]} />;
}

function BoyDogScene({ position }: { position: Position }) {
  return (
    <View style={scene.wrap}>
      <LinearGradient colors={[`${SIDE.mint}22`, 'transparent']} style={scene.sky} />
      <View style={scene.path} />
      {position === 'nextto' && (
        <>
          <PairGlow />
          <Text style={[scene.emoji, scene.boyNext]}>👦</Text>
          <Text style={[scene.emoji, scene.dogNext]}>🐕</Text>
          <Text style={scene.arrow}>↔</Text>
        </>
      )}
      {position === 'under' && (
        <>
          <Text style={[scene.emoji, scene.boyStack]}>👦</Text>
          <Text style={[scene.emoji, scene.dogUnder]}>🐕</Text>
        </>
      )}
      {position === 'on' && (
        <>
          <Text style={[scene.emoji, scene.boyStack]}>👦</Text>
          <Text style={[scene.emoji, scene.dogOn]}>🐕</Text>
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
          ? SIDE.glow
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
        <BoyDogScene position={opt.id} />
        <Text style={styles.short}>{opt.short}</Text>
        <Text style={styles.hint}>{opt.hint}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function PositionChoiceNextTo({ onComplete }: { onComplete: () => void }) {
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
        speak('Correct! The dog is NEXT TO the boy!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          position === 'under'
            ? 'That dog is UNDER the boy. Look for side by side!'
            : 'That dog is ON the boy. NEXT TO means beside, not on top!',
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
      ? 'NEXT TO means beside — the dog stands at the boy\'s side.'
      : 'Look for side by side, not above or below.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Side Scout!"
        subtitle="You found NEXT TO — dog beside the boy!"
        badgeEmoji="🐕"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="SIDE SCOUT · GAME 1"
      title="Where is the dog?"
      instruction="Tap the scene where the dog is NEXT TO the boy."
      mascot="🐕"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 4 · PREPOSITION NEXT TO</Text>
      </View>

      <Text style={styles.prompt}>Which scene shows NEXT TO?</Text>

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
  path: {
    position: 'absolute',
    bottom: 4,
    width: 88,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(249,115,22,0.2)',
    borderWidth: 1,
    borderColor: `${SIDE.coral}44`,
  },
  pairGlow: {
    position: 'absolute',
    bottom: 18,
    width: 72,
    height: 28,
    borderRadius: 14,
    backgroundColor: SIDE.mint,
  },
  emoji: { fontSize: 30, position: 'absolute' },
  boyNext: { left: 8, bottom: 14 },
  dogNext: { right: 8, bottom: 14 },
  arrow: {
    position: 'absolute',
    bottom: 22,
    fontSize: 14,
    fontWeight: '900',
    color: SIDE.glow,
  },
  boyStack: { bottom: 28, alignSelf: 'center' },
  dogUnder: { bottom: 2, alignSelf: 'center', fontSize: 24 },
  dogOn: { bottom: 52, alignSelf: 'center', fontSize: 24 },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(249,115,22,0.15)',
    borderWidth: 1,
    borderColor: `${SIDE.coral}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: SIDE.glow },
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
    backgroundColor: 'rgba(249,115,22,0.1)',
  },
  short: { fontSize: 14, fontWeight: '900', color: SIDE.glow, letterSpacing: 0.8, marginTop: 8 },
  hint: { fontSize: 10, fontWeight: '600', color: LL.textMuted, marginTop: 2, textAlign: 'center' },
});
