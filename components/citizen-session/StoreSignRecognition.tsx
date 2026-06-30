/**
 * Game 1 — Sign Scan: Tap the correct store sign. OPEN, CLOSED, SALE. Answer: OPEN.
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
  { id: 'OPEN', label: 'OPEN', color: '#16A34A', glow: '#86EFAC', icon: '🟢' },
  { id: 'CLOSED', label: 'CLOSED', color: '#DC2626', glow: '#FCA5A5', icon: '🔴' },
  { id: 'SALE', label: 'SALE', color: '#1E40AF', glow: '#93C5FD', icon: '🏷️' },
] as const;

type SignId = (typeof SIGNS)[number]['id'];
const CORRECT: SignId = 'OPEN';
const VOICE = 'Tap the OPEN sign.';
const SHOP = { accent: '#F97316', glow: '#FDBA74' } as const;

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

export function StoreSignRecognition({ onComplete }: { onComplete: () => void }) {
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
        speak('Try again. Tap the OPEN sign.', 0.7);
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
      ? 'OPEN means the store is welcoming you inside — find it!'
      : 'Look for the green OPEN sign — not CLOSED or SALE.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Sign Scan!"
        subtitle="You found OPEN!"
        badgeEmoji="🏪"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="SIGN SCAN · GAME 1"
      title="Tap the correct sign"
      instruction="Tap the OPEN sign."
      mascot="🏪"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.shopFrame}>
        <LinearGradient
          colors={[`${SHOP.accent}33`, 'transparent', `${CZ.accent}22`]}
          style={styles.shopGlow}
        />
        <Text style={styles.shopLabel}>SHOPFRONT ROW</Text>
        <Text style={styles.prompt}>Which one is OPEN?</Text>
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
        <Text style={styles.hint}>🟢 green · store is open for shoppers</Text>
      </View>
    </CitizenGameShell>
  );
}

const styles = StyleSheet.create({
  shopFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${SHOP.accent}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  shopGlow: { ...StyleSheet.absoluteFillObject },
  shopLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: SHOP.glow,
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
    minWidth: 100,
    minHeight: 108,
    borderRadius: 18,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 12,
  },
  plateGrad: { ...StyleSheet.absoluteFillObject },
  plateIcon: { fontSize: 28, marginBottom: 4 },
  plateText: { fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  pressed: { opacity: 0.88 },
  hint: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '700',
    color: SHOP.glow,
    textAlign: 'center',
  },
});
