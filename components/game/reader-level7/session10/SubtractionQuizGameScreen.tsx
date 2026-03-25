// Game 3: Subtraction Quiz - Multiple subtraction questions
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../reader/utils/audio';
import { ANSWER_OPTIONS_SESSION10, SUBTRACTION_QUESTIONS_SESSION10 } from './gameData';

interface SubtractionQuizGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function SubtractionQuizGameScreen({ onComplete, onBack }: SubtractionQuizGameScreenProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(SUBTRACTION_QUESTIONS_SESSION10.length).fill(null));
  const [completed, setCompleted] = useState(false);

  const currentQuestion = SUBTRACTION_QUESTIONS_SESSION10[currentQuestionIndex];
  const buttonScales = ANSWER_OPTIONS_SESSION10.map(() => useSharedValue(1));

  useEffect(() => {
    speakInstruction(`Solve ${currentQuestion.question} equals`).catch(() => {});
    return () => stopAllAudio();
  }, [currentQuestionIndex]);

  const handleAnswerSelect = async (answer: number) => {
    if (selectedAnswers[currentQuestionIndex] !== null || completed) return;

    const index = ANSWER_OPTIONS_SESSION10.indexOf(answer);
    buttonScales[index].value = withSpring(0.9, {}, () => {
      buttonScales[index].value = withSpring(1);
    });

    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newSelectedAnswers);

    const isCorrect = answer === currentQuestion.answer;

    if (isCorrect) {
      await playSoundEffect('correct');
      await speakFeedback('Perfect!');
      
      // Move to next question or complete
      setTimeout(() => {
        if (currentQuestionIndex < SUBTRACTION_QUESTIONS_SESSION10.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          setCompleted(true);
        }
      }, 1500);
    } else {
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      
      setTimeout(() => {
        newSelectedAnswers[currentQuestionIndex] = null;
        setSelectedAnswers(newSelectedAnswers);
      }, 1500);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Subtraction Quiz</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {SUBTRACTION_QUESTIONS_SESSION10.length}
        </Text>
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question} = ?</Text>
      </View>

      {/* Answer Options */}
      <View style={styles.answersContainer}>
        {ANSWER_OPTIONS_SESSION10.map((answer, index) => {
          const isSelected = selectedAnswers[currentQuestionIndex] === answer;
          const isCorrect = answer === currentQuestion.answer;
          const showFeedback = selectedAnswers[currentQuestionIndex] !== null;

          const buttonAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: buttonScales[index].value }],
          }));

          let buttonColors = ['#C7D2FE', '#A5B4FC'];
          if (showFeedback) {
            if (isSelected && isCorrect) {
              buttonColors = ['#22C55E', '#16A34A'];
            } else if (isSelected && !isCorrect) {
              buttonColors = ['#EF4444', '#DC2626'];
            }
          }

          return (
            <Animated.View
              key={answer}
              entering={FadeInDown.delay(index * 100)}
              style={buttonAnimatedStyle}
            >
              <Pressable
                onPress={() => handleAnswerSelect(answer)}
                disabled={completed}
                style={styles.answerButton}
              >
                <LinearGradient
                  colors={buttonColors}
                  style={styles.answerButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.answerButtonText}>{answer}</Text>
                  {showFeedback && isSelected && (
                    <View style={styles.resultIcon}>
                      <Ionicons
                        name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={32}
                        color="#FFFFFF"
                      />
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {/* Next Button */}
      {completed && (
        <Animated.View entering={FadeInDown.delay(300)} style={styles.buttonContainer}>
          <Pressable onPress={onComplete} style={styles.nextButton}>
            <LinearGradient
              colors={['#6C9EFF', '#818CF8']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.nextButtonText}>Next →</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}
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
    paddingTop: 16,
    paddingBottom: 12,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  questionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#6C9EFF',
  },
  answersContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  answerButton: {
    width: 120,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  answerButtonGradient: {
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    position: 'relative',
  },
  answerButtonText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  resultIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
