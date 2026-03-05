// Game 5: Reading + Subtraction Mix
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakSentence, speakFeedback, stopAllAudio } from '../utils/audio';
import { SENTENCE_BUILD_DATA, SUBTRACTION_DATA, getSubtractionOptions, shuffleArray } from '../utils/gameData';
import BuildSentenceGame from './BuildSentenceGame';
import TakeAwayGame from './TakeAwayGame';

interface ReadingSubtractionMixGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 6; // 2 rounds of each type

type RoundType = 'sentence' | 'subtraction';

interface Round {
  type: RoundType;
  data: any;
}

export default function ReadingSubtractionMixGame({ onComplete, onBack }: ReadingSubtractionMixGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  useEffect(() => {
    initializeRounds();
  }, []);

  const initializeRounds = () => {
    const newRounds: Round[] = [];
    
    // Add sentence rounds
    for (let i = 0; i < 2; i++) {
      const sentenceData = SENTENCE_BUILD_DATA[i % SENTENCE_BUILD_DATA.length];
      newRounds.push({ type: 'sentence', data: sentenceData });
    }
    
    // Add subtraction rounds
    for (let i = 0; i < 2; i++) {
      const subtractionData = SUBTRACTION_DATA[i % SUBTRACTION_DATA.length];
      newRounds.push({ type: 'subtraction', data: subtractionData });
    }
    
    // Add sentence arrangement rounds
    for (let i = 0; i < 2; i++) {
      const sentenceData = SENTENCE_BUILD_DATA[(i + 2) % SENTENCE_BUILD_DATA.length];
      newRounds.push({ type: 'sentence', data: sentenceData });
    }

    // Shuffle rounds
    const shuffled = shuffleArray(newRounds);
    setRounds(shuffled);
    setCurrentRound(shuffled[0]);
  };

  const handleRoundComplete = (correct: boolean) => {
    if (correct) {
      setScore((s) => s + 1);
      setStreak((st) => {
        const newStreak = st + 1;
        if (newStreak > maxStreak) {
          setMaxStreak(newStreak);
        }
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    if (round + 1 >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'reading-subtraction-mix',
      });
    } else {
      setTimeout(() => {
        setRound((r) => r + 1);
        setCurrentRound(rounds[round + 1]);
      }, 1500);
    }
  };

  if (!currentRound) return null;

  // Render different game types
  if (currentRound.type === 'sentence') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#EFF6FF', '#F0F9FF']} style={StyleSheet.absoluteFill} />
        
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
            <Text style={styles.headerSubtitle}>Score: {score} | Streak: {streak}</Text>
            <View style={styles.roundTypeBadge}>
              <Ionicons name="book" size={16} color="#BFDBFE" />
              <Text style={styles.roundTypeText}>Reading</Text>
            </View>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Mini Sentence Game */}
        <SentenceRound
          item={currentRound.data}
          onComplete={handleRoundComplete}
        />
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#EFF6FF', '#F0F9FF']} style={StyleSheet.absoluteFill} />
        
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
            <Text style={styles.headerSubtitle}>Score: {score} | Streak: {streak}</Text>
            <View style={styles.roundTypeBadge}>
              <Ionicons name="calculator" size={16} color="#A7F3D0" />
              <Text style={styles.roundTypeText}>Math</Text>
            </View>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Mini Subtraction Game */}
        <SubtractionRound
          item={currentRound.data}
          onComplete={handleRoundComplete}
        />
      </SafeAreaView>
    );
  }
}

// Mini Sentence Round Component
function SentenceRound({ item, onComplete }: { item: typeof SENTENCE_BUILD_DATA[0]; onComplete: (correct: boolean) => void }) {
  const [options] = useState(() => shuffleArray([...item.options]));
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const wordScale = useSharedValue(1);
  const wordGlow = useSharedValue(0);
  const shakeX = useSharedValue(0);

  const PICTURE_EMOJIS: Record<string, string> = {
    cat: '🐱',
    dog: '🐶',
    sun: '☀️',
    ball: '⚽',
    car: '🚗',
    tree: '🌳',
  };

  const handleWordSelect = async (word: string) => {
    if (!canSelect) return;

    setCanSelect(false);
    setSelectedWord(word);
    const correct = word === item.missingWord;
    setIsCorrect(correct);

    if (correct) {
      wordGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakSentence(item.sentence);
      setTimeout(() => onComplete(true), 1500);
    } else {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      await playSoundEffect('incorrect');
      setTimeout(() => onComplete(false), 1500);
    }
  };

  const wordAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: wordScale.value },
      { translateX: shakeX.value },
    ],
    shadowOpacity: wordGlow.value * 0.5,
  }));

  return (
    <View style={styles.gameContainer}>
      <View style={styles.pictureContainer}>
        <View style={styles.pictureBox}>
          <Text style={styles.pictureEmoji}>{PICTURE_EMOJIS[item.picture] || '🖼️'}</Text>
        </View>
      </View>

      <View style={styles.sentenceContainer}>
        <Text style={styles.sentenceText}>
          I see a <Text style={styles.blankText}>____</Text>.
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((word, index) => {
          const isSelected = selectedWord === word;
          const showCorrect = isSelected && isCorrect === true;
          const showIncorrect = isSelected && isCorrect === false;

          return (
            <Pressable
              key={index}
              onPress={() => handleWordSelect(word)}
              disabled={!canSelect}
              style={styles.optionWrapper}
            >
              <Animated.View
                style={[
                  styles.wordButton,
                  wordAnimatedStyle,
                  showCorrect && styles.wordButtonCorrect,
                  showIncorrect && styles.wordButtonIncorrect,
                ]}
              >
                <LinearGradient
                  colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#BFDBFE', '#93C5FD']}
                  style={styles.wordGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.wordText}>{word.toUpperCase()}</Text>
                </LinearGradient>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// Mini Subtraction Round Component
function SubtractionRound({ item, onComplete }: { item: typeof SUBTRACTION_DATA[0]; onComplete: (correct: boolean) => void }) {
  const [options] = useState(() => getSubtractionOptions(item.answer));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);

  const handleAnswerSelect = async (answer: number) => {
    if (!canSelect) return;

    setCanSelect(false);
    setSelectedAnswer(answer);
    const correct = answer === item.answer;
    setIsCorrect(correct);

    if (correct) {
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakFeedback('Perfect!');
      setTimeout(() => onComplete(true), 1500);
    } else {
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1, { damping: 8 })
      );
      await playSoundEffect('incorrect');
      setTimeout(() => onComplete(false), 1500);
    }
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    shadowOpacity: cardGlow.value * 0.5,
  }));

  const getObjectEmoji = () => {
    switch (item.objectType) {
      case 'apple': return '🍎';
      case 'ball': return '⚽';
      case 'star': return '⭐';
      case 'heart': return '❤️';
      case 'circle': return '⭕';
      default: return '🔵';
    }
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.equationContainer}>
        <Text style={styles.equationText}>
          {item.total} - {item.remove} = ?
        </Text>
      </View>

      <View style={styles.visualContainer}>
        <Text style={styles.visualText}>
          {Array(item.total).fill(getObjectEmoji()).join(' ')}
        </Text>
        <Text style={styles.visualLabel}>
          Take away {item.remove}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const showCorrect = isSelected && isCorrect === true;
          const showIncorrect = isSelected && isCorrect === false;

          return (
            <Pressable
              key={index}
              onPress={() => handleAnswerSelect(option)}
              disabled={!canSelect}
              style={styles.optionWrapper}
            >
              <Animated.View
                style={[
                  styles.answerButton,
                  cardAnimatedStyle,
                  showCorrect && styles.answerButtonCorrect,
                  showIncorrect && styles.answerButtonIncorrect,
                ]}
              >
                <LinearGradient
                  colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#BFDBFE', '#93C5FD']}
                  style={styles.answerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.answerText}>{option}</Text>
                </LinearGradient>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
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
    shadowColor: '#BFDBFE',
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
  roundTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  roundTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#BFDBFE',
  },
  headerRight: {
    width: 40,
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pictureContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pictureBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  pictureEmoji: {
    fontSize: 64,
  },
  sentenceContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  sentenceText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  blankText: {
    color: '#BFDBFE',
    textDecorationLine: 'underline',
  },
  equationContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  equationText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1E293B',
  },
  visualContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  visualText: {
    fontSize: 32,
    marginBottom: 12,
  },
  visualLabel: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '600',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  optionWrapper: {
    marginBottom: 8,
  },
  wordButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  wordButtonCorrect: {
    borderWidth: 4,
    borderColor: '#A7F3D0',
  },
  wordButtonIncorrect: {
    borderWidth: 4,
    borderColor: '#FBCFE8',
  },
  wordGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  wordText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  answerButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#BFDBFE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  answerButtonCorrect: {
    borderWidth: 4,
    borderColor: '#A7F3D0',
  },
  answerButtonIncorrect: {
    borderWidth: 4,
    borderColor: '#FBCFE8',
  },
  answerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  answerText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
