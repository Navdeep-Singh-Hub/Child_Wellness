// Game 3: Visual Subtraction - 3 - 1 = 2
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../reader/utils/audio';
import { SUBTRACTION_3_MINUS_1 } from './gameData';

interface VisualSubtractionGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

const ANSWER_OPTIONS = [1, 2, 3];
const CORRECT_ANSWER = 2;

export default function VisualSubtractionGameScreen({ onComplete, onBack }: VisualSubtractionGameScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [applesRemoved, setApplesRemoved] = useState(0);
  const [showEquation, setShowEquation] = useState(false);
  const [completed, setCompleted] = useState(false);

  const buttonScales = ANSWER_OPTIONS.map(() => useSharedValue(1));
  const appleScales = SUBTRACTION_3_MINUS_1.objects.map(() => useSharedValue(1));
  const removedAppleOpacity = useSharedValue(1);

  useEffect(() => {
    speakInstruction('Take away one apple').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const handleRemoveApple = () => {
    if (applesRemoved >= 1) return;

    const appleIndex = 0; // Remove first apple
    appleScales[appleIndex].value = withTiming(0, { duration: 500 }, () => {
      removedAppleOpacity.value = withTiming(0, { duration: 300 });
    });

    setApplesRemoved(1);
    setTimeout(() => {
      setShowEquation(true);
    }, 1000);
  };

  const handleAnswerSelect = async (answer: number) => {
    if (selectedAnswer !== null || completed || applesRemoved === 0) return;

    const index = ANSWER_OPTIONS.indexOf(answer);
    buttonScales[index].value = withSpring(0.9, {}, () => {
      buttonScales[index].value = withSpring(1);
    });

    setSelectedAnswer(answer);
    const isCorrect = answer === CORRECT_ANSWER;

    if (isCorrect) {
      await playSoundEffect('correct');
      await speakFeedback('Perfect! 3 minus 1 equals 2!');
      
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

  const appleAnimatedStyles = appleScales.map((scale) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: scale.value,
    }))
  );

  const removedAppleStyle = useAnimatedStyle(() => ({
    opacity: removedAppleOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Visual Subtraction</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Take away one apple</Text>
      </View>

      {/* Objects Display */}
      <View style={styles.objectsContainer}>
        {SUBTRACTION_3_MINUS_1.objects.map((emoji, index) => (
          <Animated.View
            key={index}
            style={appleAnimatedStyles[index]}
            entering={FadeInDown.delay(200 + index * 100)}
          >
            <Pressable onPress={handleRemoveApple} disabled={applesRemoved > 0}>
              <View style={styles.appleBox}>
                <Text style={styles.appleEmoji}>{emoji}</Text>
              </View>
            </Pressable>
          </Animated.View>
        ))}
        {applesRemoved > 0 && (
          <Animated.View style={[styles.removedApple, removedAppleStyle]} exiting={FadeOut}>
            <View style={styles.removedAppleBox}>
              <Text style={styles.appleEmoji}>🍎</Text>
              <Text style={styles.minusText}>-</Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Equation Display */}
      {showEquation && (
        <Animated.View entering={FadeInDown.delay(300)} style={styles.equationContainer}>
          <Text style={styles.equationText}>3 - 1 = ?</Text>
        </Animated.View>
      )}

      {/* Answer Options */}
      {showEquation && (
        <View style={styles.answersContainer}>
          {ANSWER_OPTIONS.map((answer, index) => {
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
                entering={FadeInDown.delay(500 + index * 100)}
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
      )}

      {/* Next Button */}
      {completed && (
        <Animated.View entering={FadeInDown.delay(1100)} style={styles.buttonContainer}>
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
  instructionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  objectsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 30,
    flexWrap: 'wrap',
    position: 'relative',
  },
  appleBox: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  appleEmoji: {
    fontSize: 60,
  },
  removedApple: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  removedAppleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 12,
  },
  minusText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#EF4444',
  },
  equationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  equationText: {
    fontSize: 48,
    fontWeight: '800',
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
