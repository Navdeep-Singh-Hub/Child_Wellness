/**
 * Game 4 — Sort the pictures. Categories: Food, Animals. Items: Apple, Banana, Dog, Cat.
 */
import { GraduateGameShell } from '@/components/graduate-session/shared/GraduateGameShell';
import { GR } from '@/components/graduate-session/shared/graduateTheme';
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

const ITEMS: { id: string; label: string; emoji: string; category: 'food' | 'animals' }[] = [
  { id: 'apple', label: 'Apple', emoji: '🍎', category: 'food' },
  { id: 'banana', label: 'Banana', emoji: '🍌', category: 'food' },
  { id: 'dog', label: 'Dog', emoji: '🐕', category: 'animals' },
  { id: 'cat', label: 'Cat', emoji: '🐱', category: 'animals' },
];

const VOICE = 'Tap Food or Animals. Put each picture in the correct group.';

const PALETTE = { accent: '#0EA5E9', glow: '#7DD3FC', secondary: '#38BDF8' } as const;
const FOOD = { accent: '#22C55E', glow: '#86EFAC' } as const;
const ANIMALS = { accent: '#8B5CF6', glow: '#C4B5FD' } as const;

const COACH: Record<string, string> = {
  apple: 'Apples are food we eat — which group?',
  banana: 'Bananas are fruit — food or animal?',
  dog: 'A dog is a pet animal!',
  cat: 'Cats are animals, not food!',
};

function CategoryBin({
  label,
  emoji,
  accent,
  glow,
  shake,
  onPress,
}: {
  label: string;
  emoji: string;
  accent: string;
  glow: string;
  shake: boolean;
  onPress: () => void;
}) {
  const shakeX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (shake) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [shake, shakeX]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.binWrap, anim]}>
      <Pressable
        onPress={() => {
          scale.value = withSpring(0.96, { damping: 10 });
          setTimeout(() => {
            scale.value = withSpring(1, { damping: 10 });
          }, 120);
          onPress();
        }}
        style={({ pressed }) => [
          styles.bin,
          { borderColor: `${accent}88`, backgroundColor: `${accent}22` },
          pressed && styles.pressed,
        ]}
        accessibilityLabel={label}
      >
        <LinearGradient colors={[`${accent}33`, 'rgba(11,10,26,0.55)']} style={styles.binGrad} />
        <Text style={styles.binEmoji}>{emoji}</Text>
        <Text style={[styles.binLabel, { color: glow }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function LogicSortingFoodAnimals({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongBin, setWrongBin] = useState<'food' | 'animals' | null>(null);
  const [sortedIds, setSortedIds] = useState<string[]>([]);

  const current = ITEMS[index];
  const progressPct = (index / ITEMS.length) * 100;

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleCategory = useCallback(
    (category: 'food' | 'animals') => {
      if (category !== current.category) {
        setWrongBin(category);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again.', 0.65);
        setTimeout(() => setWrongBin(null), 700);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speak(`Correct! ${current.label} is ${category === 'food' ? 'food' : 'an animal'}!`, 0.7);
      setSortedIds((prev) => [...prev, current.id]);

      if (index >= ITEMS.length - 1) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [current, index, onComplete],
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You sorted them all!"
        badgeEmoji="📂"
      />
    );
  }

  return (
    <GraduateGameShell
      studio="LOGIC SORTING · GAME 4"
      title="Sort the pictures"
      instruction="Put each picture in the correct group."
      mascot="📂"
      coachLine={COACH[current.id] ?? 'Food we eat — animals we pet!'}
      onReplayVoice={playVoice}
    >
      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>SORT ROUNDS</Text>
          <Text style={styles.progressCount}>
            {index + 1} / {ITEMS.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[PALETTE.accent, PALETTE.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.sortFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.sortGlow}
        />
        <Text style={styles.frameLabel}>ACTIVE PICTURE</Text>
        <Text style={styles.prompt}>Where does this go?</Text>

        <View style={styles.itemDisplay}>
          <Text style={styles.itemEmoji}>{current.emoji}</Text>
          <Text style={styles.itemLabel}>{current.label}</Text>
        </View>

        <View style={styles.categoriesRow}>
          <CategoryBin
            label="Food"
            emoji="🍎"
            accent={FOOD.accent}
            glow={FOOD.glow}
            shake={wrongBin === 'food'}
            onPress={() => handleCategory('food')}
          />
          <CategoryBin
            label="Animals"
            emoji="🐕"
            accent={ANIMALS.accent}
            glow={ANIMALS.glow}
            shake={wrongBin === 'animals'}
            onPress={() => handleCategory('animals')}
          />
        </View>

        {sortedIds.length > 0 ? (
          <View style={styles.sortedTray}>
            <Text style={styles.sortedLabel}>SORTED</Text>
            <View style={styles.sortedRow}>
              {sortedIds.map((id) => {
                const item = ITEMS.find((i) => i.id === id)!;
                return (
                  <View key={id} style={styles.sortedChip}>
                    <Text style={styles.sortedEmoji}>{item.emoji}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}
      </View>
    </GraduateGameShell>
  );
}

const styles = StyleSheet.create({
  progressWrap: { marginBottom: 14 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: PALETTE.glow },
  progressCount: { fontSize: 14, fontWeight: '900', color: GR.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  sortFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(15,10,30,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
    alignItems: 'center',
  },
  sortGlow: { ...StyleSheet.absoluteFillObject },
  frameLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    marginBottom: 8,
    textAlign: 'center',
  },
  prompt: {
    fontSize: 18,
    fontWeight: '900',
    color: GR.textLight,
    marginBottom: 14,
    textAlign: 'center',
  },
  itemDisplay: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}88`,
    backgroundColor: 'rgba(14,165,233,0.22)',
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginBottom: 18,
    minWidth: 160,
  },
  itemEmoji: { fontSize: 52, marginBottom: 6 },
  itemLabel: { fontSize: 20, fontWeight: '900', color: PALETTE.glow },
  categoriesRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  binWrap: { flex: 1, minWidth: 130, maxWidth: 160 },
  bin: {
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  binGrad: { ...StyleSheet.absoluteFillObject },
  binEmoji: { fontSize: 40, marginBottom: 6 },
  binLabel: { fontSize: 16, fontWeight: '900' },
  sortedTray: {
    marginTop: 16,
    width: '100%',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: `${PALETTE.glow}44`,
    backgroundColor: 'rgba(11,10,26,0.45)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  sortedLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: GR.textMuted,
    marginBottom: 8,
  },
  sortedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  sortedChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderWidth: 1,
    borderColor: GR.good,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortedEmoji: { fontSize: 20 },
  pressed: { opacity: 0.88 },
});
