/**
 * RhymingGame.tsx — Game 2: I Spy Rhyming
 * Multiple rounds: hen→pen, pig→dig, cat→hat, sun→bun. Tap the words that rhyme.
 */
import { speak } from '@/utils/tts';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { GameLayout } from './GameLayout';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';

type Round = { promptWord: string; correctIds: string[]; items: { id: string; label: string; image: string }[] };

const ROUNDS: Round[] = [
  {
    promptWord: 'hen',
    correctIds: ['hen', 'pen'],
    items: [
      { id: 'hen', label: 'Hen', image: 'https://placehold.co/120x120/86efac/166534?text=Hen' },
      { id: 'pen', label: 'Pen', image: 'https://placehold.co/120x120/86efac/166534?text=Pen' },
      { id: 'dog', label: 'Dog', image: 'https://placehold.co/120x120/fecaca/991b1b?text=Dog' },
      { id: 'sun', label: 'Sun', image: 'https://placehold.co/120x120/fecaca/991b1b?text=Sun' },
    ],
  },
  {
    promptWord: 'pig',
    correctIds: ['pig', 'dig'],
    items: [
      { id: 'pig', label: 'Pig', image: 'https://placehold.co/120x120/86efac/166534?text=Pig' },
      { id: 'dig', label: 'Dig', image: 'https://placehold.co/120x120/86efac/166534?text=Dig' },
      { id: 'cat', label: 'Cat', image: 'https://placehold.co/120x120/fecaca/991b1b?text=Cat' },
      { id: 'log', label: 'Log', image: 'https://placehold.co/120x120/fecaca/991b1b?text=Log' },
    ],
  },
  {
    promptWord: 'cat',
    correctIds: ['cat', 'hat'],
    items: [
      { id: 'cat', label: 'Cat', image: 'https://placehold.co/120x120/86efac/166534?text=Cat' },
      { id: 'hat', label: 'Hat', image: 'https://placehold.co/120x120/86efac/166534?text=Hat' },
      { id: 'cow', label: 'Cow', image: 'https://placehold.co/120x120/fecaca/991b1b?text=Cow' },
      { id: 'hen', label: 'Hen', image: 'https://placehold.co/120x120/fecaca/991b1b?text=Hen' },
    ],
  },
  {
    promptWord: 'sun',
    correctIds: ['sun', 'bun'],
    items: [
      { id: 'sun', label: 'Sun', image: 'https://placehold.co/120x120/86efac/166534?text=Sun' },
      { id: 'bun', label: 'Bun', image: 'https://placehold.co/120x120/86efac/166534?text=Bun' },
      { id: 'pen', label: 'Pen', image: 'https://placehold.co/120x120/fecaca/991b1b?text=Pen' },
      { id: 'pig', label: 'Pig', image: 'https://placehold.co/120x120/fecaca/991b1b?text=Pig' },
    ],
  },
].map((r) => ({ ...r, items: r.items.sort(() => Math.random() - 0.5) }));

export function RhymingGame({ onComplete }: { onComplete: () => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [found, setFound] = useState<Set<string>>(new Set());
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
      if (round.correctIds.includes(id)) {
        if (found.has(id)) return;
        speak('Correct!');
        triggerBounce(id);
        const next = new Set(found).add(id);
        setFound(next);
        if (next.size === round.correctIds.length) {
          if (roundIndex + 1 >= ROUNDS.length) {
            speak('Great job!');
            setShowSuccess(true);
            setTimeout(() => onComplete(), 1800);
          } else {
            speak('Next round!');
            setRoundIndex((r) => r + 1);
            setFound(new Set());
          }
        }
      } else {
        speak('Try again');
        triggerShake(id);
      }
    },
    [found, round, roundIndex, onComplete, triggerShake, triggerBounce]
  );

  if (showSuccess) {
    return <SuccessCelebration variant="mint" title="Great Job!" subtitle="All rhymes found!" />;
  }

  return (
    <GameLayout title="I Spy Rhyming" instruction={instruction}>
      <View style={styles.roundBadge}>
        <Text style={styles.roundText}>Round {roundIndex + 1} of {ROUNDS.length}</Text>
      </View>
      <View style={styles.grid}>
        {round.items.map((item) => {
          const isCorrect = round.correctIds.includes(item.id);
          const chosen = found.has(item.id);
          const shake = shakeAnims[item.id];
          const bounce = bounceAnims[item.id];
          const translateX = shake
            ? shake.interpolate({ inputRange: [0, 1], outputRange: [0, 6] })
            : 0;
          const scale = bounce
            ? bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] })
            : 1;
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.itemWrap,
                chosen && styles.itemChosen,
                { transform: [{ translateX }, { scale }] },
              ]}
            >
              <Pressable
                onPress={() => handleTap(item.id)}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                accessibilityLabel={item.label}
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={[styles.label, chosen && isCorrect && styles.labelHighlight]}>
                  {item.label}
                </Text>
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
  roundText: { fontSize: 16, fontWeight: '700', color: '#60A5FA' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },
  itemWrap: { width: '45%', maxWidth: 140 },
  item: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#60A5FA',
    minHeight: 120,
  },
  itemPressed: { opacity: 0.9 },
  itemChosen: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' },
  image: { width: 64, height: 64, borderRadius: 10, marginBottom: 6 },
  label: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  labelHighlight: { color: '#2E7D32', textDecorationLine: 'underline' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successText: { fontSize: 32, fontWeight: '800', color: '#4CAF50' },
});
