// Game 4: Choose Correct Answer - 9 - 4 = ?
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../reader/utils/audio';
import { ANSWER_OPTIONS_SESSION9, CORRECT_ANSWER } from './gameData';

interface AnswerSelectionGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function AnswerSelectionGameScreen({ onComplete, onBack }: AnswerSelectionGameScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  const buttonScales = ANSWER_OPTIONS_SESSION9.map(() => useSharedValue(1));

  useEffect(() => {
    speakInstruction('Choose the correct answer').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const handleAnswerSelect = async (answer: number) => {
    if (selectedAnswer !== null || completed) return;

    const index = ANSWER_OPTIONS_SESSION9.indexOf(answer);
    buttonScales[index].value = withSpring(0.9, {}, () => {
      buttonScales[index].value = withSpring(1);
    });

    setSelectedAnswer(answer);
    const isCorrect = answer === CORRECT_ANSWER;

    if (isCorrect) {
      await playSoundEffect('correct');
      await speakFeedback('Perfect! 9 minus 4 equals 5!');
      
      setTimeout(() => {
        setCompleted(true);
      }, 2000);
    } else {
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      
      setTimeout(() => {
        setSelectedAnswer(null);
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
        <Text style={styles.headerTitle}>Choose Correct Answer</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>9 - 4 = ?</Text>
      </View>

      {/* Answer Options */}
      <View style={styles.answersContainer}>
        {ANSWER_OPTIONS_SESSION9.map((answer, index) => {
          const isSelected = selectedAnswer === answer;
          const isCorrect = answer === CORRECT_ANSWER;
          const showFeedback = selectedAnswer !== null;

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
