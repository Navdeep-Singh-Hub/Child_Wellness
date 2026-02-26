// Game 4: Picture Pair Sound Match
import { playWord, playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';
import { PICTURE_PAIR_DATA, shuffleArray } from '../utils/gameData';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PicturePairGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 3;
const CARDS_PER_ROUND = 6;

interface Card {
  id: number;
  image: string;
  word: string;
  sound: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function PicturePairGame({ onComplete, onBack }: PicturePairGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [canFlip, setCanFlip] = useState(true);

  useEffect(() => {
    loadRound();
  }, [round]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'picture-pair',
      });
      return;
    }

    const pairData = PICTURE_PAIR_DATA[round % PICTURE_PAIR_DATA.length];
    const allPairs = [
      { image: pairData.image1, word: pairData.word1, sound: pairData.sound },
      { image: pairData.image2, word: pairData.word2, sound: pairData.sound },
    ];

    // Create pairs and shuffle
    const cardPairs: Card[] = [];
    allPairs.forEach((pair, idx) => {
      cardPairs.push({
        id: idx * 2,
        ...pair,
        isFlipped: false,
        isMatched: false,
      });
      cardPairs.push({
        id: idx * 2 + 1,
        ...pair,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Add more cards to reach 6
    while (cardPairs.length < CARDS_PER_ROUND) {
      const extraPair = PICTURE_PAIR_DATA[(round + 1) % PICTURE_PAIR_DATA.length];
      cardPairs.push({
        id: cardPairs.length,
        image: extraPair.image1,
        word: extraPair.word1,
        sound: extraPair.sound,
        isFlipped: false,
        isMatched: false,
      });
    }

    const shuffled = shuffleArray(cardPairs);
    setCards(shuffled);
    setFlippedCards([]);
    setMatches(0);
    setCanFlip(true);
  };

  const handleCardFlip = async (cardId: number) => {
    if (!canFlip || flippedCards.length >= 2) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    const updatedCards = cards.map((c) =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    if (newFlipped.length === 2) {
      setCanFlip(false);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.sound === secondCard.sound && firstCard.id !== secondCard.id) {
        // Match!
        setMatches((m) => m + 1);
        await playSoundEffect('correct');
        await speakFeedback(true);

        const matchedCards = updatedCards.map((c) =>
          c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
        );
        setCards(matchedCards);

        if (matches + 1 >= CARDS_PER_ROUND / 2) {
          // Round complete
          setScore((s) => s + 1);
          setTimeout(() => {
            setRound((r) => r + 1);
          }, 2000);
        } else {
          setFlippedCards([]);
          setCanFlip(true);
        }
      } else {
        // No match
        await playSoundEffect('incorrect');
        await speakFeedback(false);

        setTimeout(() => {
          const resetCards = cards.map((c) =>
            newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c
          );
          setCards(resetCards);
          setFlippedCards([]);
          setCanFlip(true);
        }, 2000);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#F0F9FF', '#E0F2FE']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
          <Text style={styles.headerSubtitle}>Matches: {matches}/{CARDS_PER_ROUND / 2}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>Find pairs that start with the same sound</Text>
      </View>

      {/* Cards Grid */}
      <View style={styles.cardsGrid}>
        {cards.map((card) => (
          <CardComponent
            key={card.id}
            card={card}
            onFlip={() => handleCardFlip(card.id)}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

function CardComponent({ card, onFlip }: { card: Card; onFlip: () => void }) {
  const rotateY = useSharedValue(0);

  useEffect(() => {
    if (card.isFlipped) {
      rotateY.value = withSpring(180, { damping: 12 });
    } else {
      rotateY.value = withSpring(0, { damping: 12 });
    }
  }, [card.isFlipped]);

  const animatedStyle = useAnimatedStyle(() => {
    const isFront = rotateY.value < 90;
    return {
      transform: [{ rotateY: `${rotateY.value}deg` }],
      opacity: isFront ? 1 : 0,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const isBack = rotateY.value >= 90;
    return {
      transform: [{ rotateY: `${rotateY.value}deg` }],
      opacity: isBack ? 1 : 0,
    };
  });

  return (
    <Pressable onPress={onFlip} disabled={card.isMatched || card.isFlipped} style={styles.cardContainer}>
      <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
        <LinearGradient
          colors={['#6366F1', '#4F46E5']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="help-circle" size={48} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
      <Animated.View style={[styles.card, styles.cardFront, animatedStyle]}>
        {card.isMatched ? (
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image source={{ uri: card.image }} style={styles.cardImage} resizeMode="cover" />
            <View style={styles.matchOverlay}>
              <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.cardContent}>
            <Image source={{ uri: card.image }} style={styles.cardImage} resizeMode="cover" />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  headerRight: {
    width: 40,
  },
  instructions: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  instructionsText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  cardContainer: {
    width: '30%',
    aspectRatio: 0.75,
    marginBottom: 12,
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
  },
  cardBack: {},
  cardFront: {},
  cardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  matchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
