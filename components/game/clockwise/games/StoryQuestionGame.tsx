// Game 2: Story & Question
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
import { playSoundEffect, speakStory, speakQuestion, speakFeedback, stopAllAudio } from '../utils/audio';
import { STORY_QUESTIONS, shuffleArray } from '../utils/gameData';

interface StoryQuestionGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 4;

export default function StoryQuestionGame({ onComplete, onBack }: StoryQuestionGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [currentStory, setCurrentStory] = useState<typeof STORY_QUESTIONS[0] | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const cardScale = useSharedValue(1);
  const cardGlow = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRound();
  }, [round]);

  useEffect(() => {
    if (soundTimeoutRef.current) {
      clearTimeout(soundTimeoutRef.current);
      soundTimeoutRef.current = null;
    }

    if (currentStory && !isPlaying) {
      setIsPlaying(true);
      stopAllAudio();
      soundTimeoutRef.current = setTimeout(async () => {
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 150));
        await speakStory(currentStory.story).catch(() => {});
        await new Promise(resolve => setTimeout(resolve, 800));
        await speakQuestion(currentStory.question).catch(() => {});
        setIsPlaying(false);
        soundTimeoutRef.current = null;
      }, 600);
    }

    return () => {
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
        soundTimeoutRef.current = null;
      }
      stopAllAudio();
    };
  }, [currentStory]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'story-question',
      });
      return;
    }

    const story = STORY_QUESTIONS[round % STORY_QUESTIONS.length];
    const shuffled = shuffleArray([...story.options]);
    
    setCurrentStory(story);
    setOptions(shuffled);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setCanSelect(true);
    setIsPlaying(false);
    cardScale.value = 1;
    cardGlow.value = 0;
    shakeX.value = 0;
  };

  const handleAnswerSelect = async (answer: string) => {
    if (!canSelect || !currentStory) return;

    setCanSelect(false);
    setSelectedAnswer(answer);
    const correct = answer === currentStory.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
      cardGlow.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 400 })
      );
      await playSoundEffect('correct');
      await speakFeedback('Perfect!');
    } else {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setCanSelect(true);
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 2000);
      return;
    }

    setTimeout(() => {
      setRound((r) => r + 1);
    }, 2000);
  };

  const handleReplay = async () => {
    if (currentStory && !isPlaying) {
      setIsPlaying(true);
      await speakStory(currentStory.story);
      await new Promise(resolve => setTimeout(resolve, 800));
      await speakQuestion(currentStory.question);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value },
      { translateX: shakeX.value },
    ],
    shadowOpacity: cardGlow.value * 0.5,
  }));

  if (!currentStory) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3C7', '#FEF9E7']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
          <Text style={styles.headerSubtitle}>Score: {score}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>Listen to the story and answer the question</Text>
      </View>

      {/* Story Display */}
      <View style={styles.storyContainer}>
        <View style={styles.storyBox}>
          {currentStory.story.map((line, index) => (
            <Text key={index} style={styles.storyText}>{line}</Text>
          ))}
        </View>
      </View>

      {/* Question Display */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentStory.question}</Text>
      </View>

      {/* Replay Button */}
      <View style={styles.replayContainer}>
        <Pressable onPress={handleReplay} disabled={isPlaying} style={styles.replayButton}>
          <LinearGradient
            colors={['#FDE68A', '#FCD34D']}
            style={styles.replayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="volume-high" size={24} color="#FFFFFF" />
            <Text style={styles.replayText}>Replay Story</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Answer Options */}
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
                  colors={showCorrect ? ['#A7F3D0', '#6EE7B7'] : showIncorrect ? ['#FBCFE8', '#F9A8D4'] : ['#FDE68A', '#FCD34D']}
                  style={styles.answerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.answerText}>{option}</Text>
                  {showCorrect && (
                    <View style={styles.feedbackIcon}>
                      <Ionicons name="checkmark-circle" size={32} color="#FFFFFF" />
                    </View>
                  )}
                  {showIncorrect && (
                    <View style={styles.feedbackIcon}>
                      <Ionicons name="close-circle" size={32} color="#FFFFFF" />
                    </View>
                  )}
                </LinearGradient>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
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
    shadowColor: '#FDE68A',
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
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  storyContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  storyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#FDE68A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    minWidth: '90%',
  },
  storyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  questionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  replayContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  replayButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  replayGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  replayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  optionWrapper: {
    marginBottom: 12,
  },
  answerButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FDE68A',
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
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    position: 'relative',
  },
  answerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  feedbackIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
