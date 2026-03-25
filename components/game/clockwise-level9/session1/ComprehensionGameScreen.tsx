// Game 2: Comprehension Question - Answer about the story
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakQuestion, speakFeedback, stopAllAudio } from '../../clockwise/utils/audio';
import { COMPREHENSION_QUESTION_SESSION1 } from './gameData';

interface ComprehensionGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function ComprehensionGameScreen({ onComplete, onBack }: ComprehensionGameScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const buttonScales = COMPREHENSION_QUESTION_SESSION1.options.map(() => useSharedValue(1));

  useEffect(() => {
    speakQuestion(COMPREHENSION_QUESTION_SESSION1.question).catch(() => {});
    return () => stopAllAudio();
  }, []);

  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer || completed) return;

    const index = COMPREHENSION_QUESTION_SESSION1.options.findIndex(o => o.answer === answer);
    buttonScales[index].value = withSpring(0.9, {}, () => {
      buttonScales[index].value = withSpring(1);
    });

    setSelectedAnswer(answer);
    const option = COMPREHENSION_QUESTION_SESSION1.options.find(o => o.answer === answer);
    const isCorrect = option?.correct || false;

    if (isCorrect) {
      await playSoundEffect('correct');
      await speakFeedback('Perfect! Sam has a ball!');
      
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
        <Text style={styles.headerTitle}>Comprehension</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{COMPREHENSION_QUESTION_SESSION1.question}</Text>
      </View>

      {/* Answer Options */}
      <View style={styles.answersContainer}>
        {COMPREHENSION_QUESTION_SESSION1.options.map((option, index) => {
          const isSelected = selectedAnswer === option.answer;
          const isCorrect = option.correct;
          const showResult = selectedAnswer !== null;

          const buttonAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: buttonScales[index].value }],
          }));

          let buttonColors = ['#C7D2FE', '#A5B4FC'];
          if (showResult) {
            if (isSelected && isCorrect) {
              buttonColors = ['#22C55E', '#16A34A'];
            } else if (isSelected && !isCorrect) {
              buttonColors = ['#EF4444', '#DC2626'];
            }
          }

          return (
            <Animated.View key={option.answer} entering={FadeInDown.delay(index * 100)} style={buttonAnimatedStyle}>
              <Pressable
                onPress={() => handleAnswerSelect(option.answer)}
                disabled={completed}
                style={styles.answerButton}
              >
                <LinearGradient
                  colors={buttonColors}
                  style={styles.answerButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.answerButtonText}>{option.answer}</Text>
                  {showResult && isSelected && (
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
        <Animated.View entering={FadeInDown.delay(200)} style={styles.buttonContainer}>
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
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  answersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  answerButton: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  answerButtonGradient: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    position: 'relative',
  },
  answerButtonText: {
    fontSize: 28,
    fontWeight: '800',
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
