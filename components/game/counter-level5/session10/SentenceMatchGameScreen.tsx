// Game 2: Sentence Match - Match word to sentence
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../counter/utils/audio';
import { SENTENCE_MATCH_DATA } from './gameData';

interface SentenceMatchGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function SentenceMatchGameScreen({ onComplete, onBack }: SentenceMatchGameScreenProps) {
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const buttonScales = SENTENCE_MATCH_DATA[currentRound]?.options.map(() => useSharedValue(1)) || [];
  const currentData = SENTENCE_MATCH_DATA[currentRound];

  useEffect(() => {
    if (currentData) {
      speakInstruction(`Find the word ${currentData.highlightedWord} in the sentence`).catch(() => {});
    }
    return () => stopAllAudio();
  }, [currentRound]);

  const handleWordSelect = async (word: string) => {
    if (selectedWord || completed) return;

    const index = currentData.options.indexOf(word);
    if (buttonScales[index]) {
      buttonScales[index].value = withSpring(0.9, {}, () => {
        buttonScales[index].value = withSpring(1);
      });
    }

    setSelectedWord(word);
    const correct = word === currentData.correctAnswer;

    if (correct) {
      await playSoundEffect('correct');
      await speakFeedback('Perfect!');
      
      if (currentRound < SENTENCE_MATCH_DATA.length - 1) {
        setTimeout(() => {
          setCurrentRound(currentRound + 1);
          setSelectedWord(null);
        }, 1500);
      } else {
        setTimeout(() => {
          setCompleted(true);
        }, 2000);
      }
    } else {
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      
      setTimeout(() => {
        setSelectedWord(null);
      }, 1500);
    }
  };

  if (!currentData) return null;

  const sentenceParts = currentData.sentence.split(' ');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Sentence Match</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Round Indicator */}
      <View style={styles.roundContainer}>
        <Text style={styles.roundText}>
          Round {currentRound + 1} of {SENTENCE_MATCH_DATA.length}
        </Text>
      </View>

      {/* Sentence Display */}
      <View style={styles.sentenceContainer}>
        <View style={styles.sentenceBox}>
          <Text style={styles.sentenceText}>
            {sentenceParts.map((part, index) => {
              const isHighlighted = part.toUpperCase() === currentData.highlightedWord;
              return (
                <Text
                  key={index}
                  style={[
                    styles.sentencePart,
                    isHighlighted && styles.highlightedWord,
                  ]}
                >
                  {part}{index < sentenceParts.length - 1 ? ' ' : ''}
                </Text>
              );
            })}
          </Text>
        </View>
      </View>

      {/* Word Options */}
      <View style={styles.optionsContainer}>
        {currentData.options.map((option, index) => {
          const isSelected = selectedWord === option;
          const isCorrect = option === currentData.correctAnswer;
          const showResult = selectedWord !== null;

          const buttonAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: buttonScales[index]?.value || 1 }],
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
            <Animated.View key={option} entering={FadeInDown.delay(index * 100)} style={buttonAnimatedStyle}>
              <Pressable
                onPress={() => handleWordSelect(option)}
                disabled={completed}
                style={styles.optionButton}
              >
                <LinearGradient
                  colors={buttonColors}
                  style={styles.optionButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.optionButtonText}>{option}</Text>
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
  roundContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  roundText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  sentenceContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  sentenceBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 32,
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sentenceText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  sentencePart: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
  },
  highlightedWord: {
    backgroundColor: '#FBBF24',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
  },
  optionButton: {
    width: 180,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  optionButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    position: 'relative',
  },
  optionButtonText: {
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
