/**
 * Game 3 — Price Hunter: Find the price tag. ₹10, ₹20, ₹50. Answer: ₹20.
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

const PRICE_TAGS = [
  { id: '₹10', label: '₹10', color: '#1E40AF', glow: '#93C5FD' },
  { id: '₹20', label: '₹20', color: '#16A34A', glow: '#86EFAC' },
  { id: '₹50', label: '₹50', color: '#9D174D', glow: '#F9A8D4' },
] as const;

type TagId = (typeof PRICE_TAGS)[number]['id'];
const CORRECT: TagId = '₹20';
const VOICE = 'Tap the twenty rupees price tag.';
const SHOP = { accent: '#F97316', glow: '#FDBA74' } as const;

function PriceTagPlate({
  tag,
  selected,
  feedback,
  onPress,
}: {
  tag: (typeof PRICE_TAGS)[number];
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
          ? tag.glow
          : `${tag.color}88`;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.tagPlate, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={`Price ${tag.label}`}
      >
        <LinearGradient
          colors={[`${tag.color}44`, 'rgba(11,10,26,0.75)']}
          style={styles.tagGrad}
        />
        <Text style={styles.tagIcon}>🏷️</Text>
        <Text style={[styles.tagText, { color: tag.color }]}>{tag.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function PriceTagRecognition({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<TagId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (id: TagId) => {
      if (feedback === 'correct') return;
      setSelected(id);
      setAttempts((a) => a + 1);

      if (id === CORRECT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! Twenty rupees!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Tap the twenty rupees price tag.', 0.7);
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
      ? 'Read each tag carefully — which one says twenty rupees?'
      : 'Find the ₹20 tag — not ₹10 or ₹50!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Price Hunter!"
        subtitle="You found ₹20!"
        badgeEmoji="🏷️"
      />
    );
  }

  return (
    <CitizenGameShell
      studio="PRICE HUNTER · GAME 3"
      title="Find the price"
      instruction="Tap the ₹20 price tag."
      mascot="🏷️"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.aisleFrame}>
        <LinearGradient
          colors={[`${SHOP.accent}33`, 'transparent', `${CZ.accent}22`]}
          style={styles.aisleGlow}
        />
        <Text style={styles.aisleLabel}>PRICE TAG AISLE</Text>
        <Text style={styles.prompt}>Which price tag is ₹20?</Text>
        <View style={styles.tagsRow}>
          {PRICE_TAGS.map((tag) => (
            <PriceTagPlate
              key={tag.id}
              tag={tag}
              selected={selected === tag.id}
              feedback={feedback}
              onPress={() => handleTap(tag.id)}
            />
          ))}
        </View>
        <Text style={styles.hint}>🏷️ twenty rupees · middle price tag</Text>
      </View>
    </CitizenGameShell>
  );
}

const styles = StyleSheet.create({
  aisleFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${SHOP.accent}55`,
    backgroundColor: 'rgba(26,10,18,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  aisleGlow: { ...StyleSheet.absoluteFillObject },
  aisleLabel: {
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
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  tagPlate: {
    minWidth: 100,
    minHeight: 112,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 12,
  },
  tagGrad: { ...StyleSheet.absoluteFillObject },
  tagIcon: { fontSize: 24, marginBottom: 4 },
  tagText: { fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },
  pressed: { opacity: 0.88 },
  hint: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '700',
    color: SHOP.glow,
    textAlign: 'center',
  },
});
