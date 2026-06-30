/**
 * Game 1 — Sign Scan: Tap the correct restaurant sign. MENU, ORDER, PAY. Answer: MENU.
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
  { id: 'MENU', label: 'MENU', color: '#1E40AF', glow: '#93C5FD', icon: '🍽️' },
  { id: 'ORDER', label: 'ORDER', color: '#166534', glow: '#86EFAC', icon: '📝' },
  { id: 'PAY', label: 'PAY', color: '#831843', glow: '#F9A8D4', icon: '💳' },
] as const;

type SignId = (typeof SIGNS)[number]['id'];
const CORRECT: SignId = 'MENU';
const VOICE = 'Tap the MENU sign.';
const DINING = { accent: '#F59E0B', glow: '#FDE68A' } as const;

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

export function RestaurantSignRecognition({ onComplete }: { onComplete: () => void }) {
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
        speak('Correct!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Tap the MENU sign.', 0.7);
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
      ? 'MENU shows the food list — find that sign!'
      : 'Look for MENU — not order or pay.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Sign Scan!"
        subtitle="You found MENU!"
        badgeEmoji="🍽️"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="SIGN SCAN · GAME 1"
      title="Tap the correct sign"
      instruction="Tap the MENU sign."
      mascot="🍽️"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.diningFrame}>
        <LinearGradient
          colors={[`${DINING.accent}33`, 'transparent', `${CZ.amber}22`]}
          style={styles.diningGlow}
        />
        <Text style={styles.diningLabel}>DINING DISTRICT</Text>
        <Text style={styles.prompt}>Which one is MENU?</Text>
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
        <Text style={styles.hint}>🍽️ blue · the list of food you can choose</Text>
      </View>
    </CitizenGameShell>
  );
}

const styles = StyleSheet.create({
  diningFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${DINING.accent}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  diningGlow: { ...StyleSheet.absoluteFillObject },
  diningLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: DINING.glow,
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
    color: DINING.glow,
    textAlign: 'center',
  },
});
