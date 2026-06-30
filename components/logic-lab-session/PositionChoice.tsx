/**
 * Game 1 — Inside Scout: find the ball IN the box.
 * Logic Lab · Section 6 · Session 1 (Preposition IN)
 */
import { LogicLabGameShell } from '@/components/logic-lab-session/shared/LogicLabGameShell';
import { LL } from '@/components/logic-lab-session/shared/logicLabTheme';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { speak } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Position = 'in' | 'on' | 'under';

const OPTIONS: { id: Position; label: string; short: string; hint: string }[] = [
  { id: 'in', label: 'Ball IN the box', short: 'IN', hint: 'Hidden inside' },
  { id: 'on', label: 'Ball on the box', short: 'ON', hint: 'Sitting on top' },
  { id: 'under', label: 'Ball under the box', short: 'UNDER', hint: 'Below the box' },
];

const CORRECT: Position = 'in';
const VOICE = 'Tap the picture where the ball is IN the box.';

function PositionScene({ position }: { position: Position }) {
  return (
    <View style={scene.wrap}>
      <View style={scene.floor} />
      {position === 'under' && <View style={[scene.ball, scene.ballUnder]} />}
      <View style={scene.box}>
        <LinearGradient colors={['#A78BFA', '#7C3AED', '#5B21B6']} style={scene.boxGrad} />
        {position === 'in' && (
          <View style={scene.ballIn}>
            <View style={scene.ballShine} />
          </View>
        )}
      </View>
      {position === 'on' && <View style={[scene.ball, scene.ballOn]} />}
      {position === 'in' && <View style={scene.inGlow} pointerEvents="none" />}
    </View>
  );
}

type CardProps = {
  opt: (typeof OPTIONS)[number];
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
  reduceMotion: boolean;
};

function ChoiceCard({ opt, selected, feedback, onPress, reduceMotion }: CardProps) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (feedback !== 'wrong' || !selected) return;
    if (reduceMotion) return;
    shake.value = withSequence(
      withTiming(8, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  }, [feedback, selected, reduceMotion, shake]);

  useEffect(() => {
    if (feedback === 'correct' && selected) {
      scale.value = withSpring(1.04, { damping: 8 }, () => {
        scale.value = withSpring(1);
      });
    }
  }, [feedback, selected, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  const borderColor =
    feedback === 'correct' && selected
      ? LL.good
      : feedback === 'wrong' && selected
        ? LL.warn
        : selected
          ? LL.accentBright
          : LL.glassBorder;

  const glow =
    feedback === 'correct' && selected ? styles.cardCorrect : feedback === 'wrong' && selected ? styles.cardWrong : null;

  return (
    <Animated.View style={[styles.cardOuter, animStyle, glow]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, { borderColor }, pressed && styles.cardPressed]}
        accessibilityLabel={opt.label}
        accessibilityState={{ selected }}
      >
        <View style={styles.spotlight} />
        <PositionScene position={opt.id} />
        <View style={styles.labelRow}>
          <Text style={styles.labelShort}>{opt.short}</Text>
          <Text style={styles.labelHint}>{opt.hint}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function PositionChoice({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<Position | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => setReduceMotion(!!v))
      .catch(() => {});
  }, [playVoice]);

  const handleTap = useCallback(
    (position: Position) => {
      if (feedback === 'correct') return;
      setSelected(position);
      setAttempts((a) => a + 1);

      if (position === CORRECT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! The ball is IN the box!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(position === 'on' ? 'That ball is ON the box. Look for IN!' : 'That ball is UNDER the box. Look for IN!');
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
      }
    },
    [feedback, onComplete],
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Inside Scout!"
        subtitle="You found IN — the ball is inside the box!"
        badgeEmoji="📦"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="INSIDE SCOUT · GAME 1"
      title="Where is the ball?"
      instruction="Tap the scene where the ball is IN the box."
      mascot="📦"
      coachLine={
        attempts === 0
          ? 'IN means inside — the ball is hidden within the box walls.'
          : 'Remember: IN = inside the container, not on top or below.'
      }
      onReplayVoice={playVoice}
    >
      <Text style={styles.prompt}>Which scene shows IN?</Text>
      <View style={styles.options}>
        {OPTIONS.map((opt) => (
          <ChoiceCard
            key={opt.id}
            opt={opt}
            selected={selected === opt.id}
            feedback={feedback}
            onPress={() => handleTap(opt.id)}
            reduceMotion={reduceMotion}
          />
        ))}
      </View>
      {attempts > 0 && feedback === 'idle' && (
        <Text style={styles.tryHint}>Take your time — look inside each box.</Text>
      )}
    </LogicLabGameShell>
  );
}

const scene = StyleSheet.create({
  wrap: { width: 96, height: 96, alignItems: 'center', justifyContent: 'flex-end' },
  floor: {
    position: 'absolute',
    bottom: 4,
    width: 80,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(129,140,248,0.25)',
  },
  box: {
    width: 64,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#C4B5FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  boxGrad: { ...StyleSheet.absoluteFillObject },
  ball: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F87171',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  ballIn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F87171',
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  ballShine: {
    position: 'absolute',
    top: 3,
    left: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  ballOn: { position: 'absolute', top: 18, zIndex: 2 },
  ballUnder: { position: 'absolute', bottom: 20, zIndex: 0 },
  inGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(52,211,153,0.12)',
    bottom: 10,
  },
});

const styles = StyleSheet.create({
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: LL.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  cardOuter: { borderRadius: 20 },
  card: {
    width: 128,
    backgroundColor: 'rgba(30,27,75,0.75)',
    borderRadius: 20,
    borderWidth: 2.5,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.88 },
  cardCorrect: {
    shadowColor: LL.good,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  cardWrong: {
    shadowColor: LL.warn,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  spotlight: {
    position: 'absolute',
    top: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(165,180,252,0.08)',
  },
  labelRow: { alignItems: 'center', marginTop: 8, gap: 2 },
  labelShort: { fontSize: 16, fontWeight: '900', color: LL.accentGlow, letterSpacing: 1 },
  labelHint: { fontSize: 11, fontWeight: '600', color: LL.textMuted },
  tryHint: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '600',
    color: LL.cyanGlow,
    textAlign: 'center',
  },
});
