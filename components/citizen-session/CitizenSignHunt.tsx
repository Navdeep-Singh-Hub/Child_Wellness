/**
 * Game 1 — Sign Hunt: Find the EXIT sign. EXIT, STOP, TOILET. Answer: EXIT.
 */
import { CitizenGameShell } from '@/components/citizen-session/shared/CitizenGameShell';
import { CZ } from '@/components/citizen-session/shared/citizenTheme';
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

const SIGNS = [
  { id: 'EXIT', label: 'EXIT', color: '#166534', glow: '#86EFAC', icon: '🚪' },
  { id: 'STOP', label: 'STOP', color: '#991B1B', glow: '#FCA5A5', icon: '🛑' },
  { id: 'TOILET', label: 'TOILET', color: '#1E40AF', glow: '#93C5FD', icon: '🚻' },
] as const;

type SignId = (typeof SIGNS)[number]['id'];
const CORRECT: SignId = 'EXIT';
const VOICE = 'Tap the signs you find. Find the EXIT sign.';
const MASTER = { accent: '#FBBF24', glow: '#FEF3C7', violet: '#7C3AED' } as const;

function SignPlate({
  sign,
  selected,
  feedback,
  onPress,
}: {
  sign: (typeof SIGNS)[number];
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
      scale.value = withSpring(1.06, { damping: 8 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [feedback, selected, shake, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  const border =
    feedback === 'correct' && selected
      ? CZ.good
      : feedback === 'wrong' && selected
        ? CZ.warn
        : selected
          ? sign.glow
          : `${sign.color}88`;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.plate, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={sign.label}
      >
        <LinearGradient
          colors={[`${sign.color}44`, 'rgba(11,10,26,0.75)']}
          style={styles.plateGrad}
        />
        <Text style={styles.plateIcon}>{sign.icon}</Text>
        <Text style={[styles.plateText, { color: sign.color }]}>{sign.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function CitizenSignHunt({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<SignId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (id: SignId) => {
      if (feedback === 'correct') return;
      setSelected(id);
      setAttempts((a) => a + 1);

      if (id === CORRECT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! You found EXIT!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Find the EXIT sign.', 0.7);
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
      ? 'Three signs in the scene — hunt for EXIT!'
      : 'Not STOP or TOILET — find the green EXIT sign!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Sign Hunt!"
        subtitle="You found the EXIT sign!"
        badgeEmoji="🔍"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="SIGN HUNT · GAME 1"
      title="Find the signs in the scene"
      instruction="Tap the EXIT sign."
      mascot="🔍"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.sceneFrame}>
        <LinearGradient
          colors={[`${MASTER.accent}33`, 'transparent', `${MASTER.violet}22`]}
          style={styles.sceneGlow}
        />
        <Text style={styles.sceneLabel}>CIVIC SCENE HUNT</Text>
        <Text style={styles.prompt}>Tap the EXIT sign.</Text>
        <View style={styles.signsRow}>
          {SIGNS.map((sign) => (
            <SignPlate
              key={sign.id}
              sign={sign}
              selected={selected === sign.id}
              feedback={feedback}
              onPress={() => handleTap(sign.id)}
            />
          ))}
        </View>
        <Text style={styles.hint}>🚪 green EXIT · safe way out of the building</Text>
      </View>
    </CitizenGameShell>
  );
}

const styles = StyleSheet.create({
  sceneFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${MASTER.accent}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  sceneGlow: { ...StyleSheet.absoluteFillObject },
  sceneLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: MASTER.glow,
    marginBottom: 12,
  },
  prompt: {
    fontSize: 18,
    fontWeight: '800',
    color: CZ.textLight,
    textAlign: 'center',
    marginBottom: 18,
  },
  signsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  plate: {
    minWidth: 108,
    minHeight: 112,
    borderRadius: 18,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 10,
  },
  plateGrad: { ...StyleSheet.absoluteFillObject },
  plateIcon: { fontSize: 28, marginBottom: 4 },
  plateText: { fontSize: 13, fontWeight: '900', letterSpacing: 0.3, textAlign: 'center' },
  pressed: { opacity: 0.88 },
  hint: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '700',
    color: MASTER.glow,
    textAlign: 'center',
  },
});
