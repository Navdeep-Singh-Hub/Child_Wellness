/**
 * SpaceRhymeGame — Game 2: I Spy Space Rhymes
 * star→car, moon→spoon, sun→run, ship→clip.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Animated } from 'react-native';
import { GameLayout } from '../farm-session/GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Round = { promptWord: string; correctId: string; items: { id: string; label: string; image: string }[] };

const ROUNDS: Round[] = [
  {
    promptWord: 'star',
    correctId: 'car',
    items: [
      { id: 'car', label: 'Car', image: 'https://placehold.co/120x120/FECACA/991B1B?text=Car' },
      { id: 'planet', label: 'Planet', image: 'https://placehold.co/120x120/A78BFA/5B21B6?text=Planet' },
      { id: 'moon', label: 'Moon', image: 'https://placehold.co/120x120/E5E7EB/374151?text=Moon' },
      { id: 'sun', label: 'Sun', image: 'https://placehold.co/120x120/FEF08A/854D0E?text=Sun' },
    ],
  },
  {
    promptWord: 'moon',
    correctId: 'spoon',
    items: [
      { id: 'spoon', label: 'Spoon', image: 'https://placehold.co/120x120/FDE68A/92400E?text=Spoon' },
      { id: 'star', label: 'Star', image: 'https://placehold.co/120x120/FEF08A/92400E?text=Star' },
      { id: 'rocket', label: 'Rocket', image: 'https://placehold.co/120x120/FECACA/991B1B?text=Rocket' },
      { id: 'sun', label: 'Sun', image: 'https://placehold.co/120x120/FEF08A/854D0E?text=Sun' },
    ],
  },
  {
    promptWord: 'sun',
    correctId: 'run',
    items: [
      { id: 'run', label: 'Run', image: 'https://placehold.co/120x120/BBF7D0/166534?text=Run' },
      { id: 'moon', label: 'Moon', image: 'https://placehold.co/120x120/E5E7EB/374151?text=Moon' },
      { id: 'planet', label: 'Planet', image: 'https://placehold.co/120x120/A78BFA/5B21B6?text=Planet' },
      { id: 'star', label: 'Star', image: 'https://placehold.co/120x120/FEF08A/92400E?text=Star' },
    ],
  },
  {
    promptWord: 'ship',
    correctId: 'clip',
    items: [
      { id: 'clip', label: 'Clip', image: 'https://placehold.co/120x120/E0E7FF/4338CA?text=Clip' },
      { id: 'rocket', label: 'Rocket', image: 'https://placehold.co/120x120/FECACA/991B1B?text=Rocket' },
      { id: 'star', label: 'Star', image: 'https://placehold.co/120x120/FEF08A/92400E?text=Star' },
      { id: 'moon', label: 'Moon', image: 'https://placehold.co/120x120/E5E7EB/374151?text=Moon' },
    ],
  },
].map((r) => ({ ...r, items: r.items.sort(() => Math.random() - 0.5) }));

export function SpaceRhymeGame({ onComplete }: { onComplete: () => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [found, setFound] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const round = ROUNDS[roundIndex];
  const [shakeAnims] = useState(() =>
    ROUNDS.flatMap((r) => r.items).reduce((acc, i) => ({ ...acc, [i.id]: new Animated.Value(0) }), {} as Record<string, Animated.Value>)
  );
  const [bounceAnims] = useState(() =>
    ROUNDS.flatMap((r) => r.items).reduce((acc, i) => ({ ...acc, [i.id]: new Animated.Value(0) }), {} as Record<string, Animated.Value>)
  );

  const instruction = `I spy something that rhymes with ${round.promptWord}`;

  useEffect(() => {
    speak(instruction, 0.75);
  }, [roundIndex]);

  const triggerShake = useCallback((id: string) => {
    const a = shakeAnims[id];
    if (!a) return;
    Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnims]);

  const triggerBounce = useCallback((id: string) => {
    const a = bounceAnims[id];
    if (!a) return;
    a.setValue(0);
    Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [bounceAnims]);

  const handleTap = useCallback(
    (id: string) => {
      if (id === round.correctId) {
        speak('Correct!');
        triggerBounce(id);
        setFound(true);
        if (roundIndex + 1 >= ROUNDS.length) {
          speak('Great job!');
          setShowSuccess(true);
          setTimeout(() => onComplete(), 1800);
        } else {
          speak('Next round!');
          setRoundIndex((r) => r + 1);
          setFound(false);
        }
      } else {
        speak('Try again');
        triggerShake(id);
      }
    },
    [round, roundIndex, onComplete, triggerShake, triggerBounce]
  );

  if (showSuccess) return <SuccessCelebration variant="indigo" title="Great Job!" subtitle="Space rhymes complete!" />;

  return (
    <GameLayout title="I Spy Space Rhymes" instruction={instruction}>
      <View style={styles.roundBadge}>
        <Text style={styles.roundText}>Round {roundIndex + 1} of {ROUNDS.length}</Text>
      </View>
      <View style={styles.grid}>
        {round.items.map((item) => {
          const chosen = found && item.id === round.correctId;
          const shake = shakeAnims[item.id];
          const bounce = bounceAnims[item.id];
          const translateX = shake?.interpolate({ inputRange: [0, 1], outputRange: [0, 6] }) ?? 0;
          const scale = bounce?.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) ?? 1;
          return (
            <Animated.View
              key={item.id}
              style={[styles.itemWrap, chosen && styles.itemChosen, { transform: [{ translateX }, { scale }] }]}
            >
              <Pressable
                onPress={() => handleTap(item.id)}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                accessibilityLabel={item.label}
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={[styles.label, chosen && styles.labelHighlight]}>{item.label}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  roundBadge: { marginBottom: 16, alignItems: 'center' },
  roundText: { fontSize: 16, fontWeight: '700', color: '#8B5CF6' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  itemWrap: { width: '45%', maxWidth: 140 },
  item: {
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1E3A8A',
    minHeight: 120,
  },
  itemPressed: { opacity: 0.9 },
  itemChosen: { borderColor: '#8B5CF6', backgroundColor: '#EDE9FE' },
  image: { width: 64, height: 64, borderRadius: 10, marginBottom: 6 },
  label: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  labelHighlight: { color: '#5B21B6', textDecorationLine: 'underline' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#1E3A8A' },
});
