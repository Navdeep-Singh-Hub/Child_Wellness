// Game 1: Sight Word Recognition - Tap the word you hear
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, speakWord, stopAllAudio } from '../../counter/utils/audio';
import { SIGHT_WORDS_SESSION10 } from './gameData';

interface SightWordRecognitionGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

const ROUNDS = [
  { word: 'GO', index: 2 },
  { word: 'THE', index: 0 },
  { word: 'IS', index: 1 },
];

export default function SightWordRecognitionGameScreen({ onComplete, onBack }: SightWordRecognitionGameScreenProps) {
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);

  const buttonScales = SIGHT_WORDS_SESSION10.map(() => useSharedValue(1));
  const currentRoundData = ROUNDS[currentRound];

  useEffect(() => {
    if (currentRound < ROUNDS.length) {
      speakInstruction(`Tap the word ${currentRoundData.word}`).then(() => {
        speakWord(currentRoundData.word);
      });
    }
    return () => stopAllAudio();
  }, [currentRound]);

  const handleWordSelect = async (word: string) => {
    if (selectedWord || completed) return;

    const index = SIGHT_WORDS_SESSION10.findIndex(w => w.word === word);
    buttonScales[index].value = withSpring(0.9, {}, () => {
      buttonScales[index].value = withSpring(1);
    });

    setSelectedWord(word);
    const correct = word === currentRoundData.word;
    setIsCorrect(correct);

    if (correct) {
      await playSoundEffect('correct');
      await speakFeedback('Great job!');
      
      if (currentRound < ROUNDS.length - 1) {
        setTimeout(() => {
          setCurrentRound(currentRound + 1);
          setSelectedWord(null);
          setIsCorrect(null);
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
        setIsCorrect(null);
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
        <Text style={styles.headerTitle}>Sight Word Recognition</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Round Indicator */}
      <View style={styles.roundContainer}>
        <Text style={styles.roundText}>
          Round {currentRound + 1} of {ROUNDS.length}
        </Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Tap the word you hear</Text>
      </View>

      {/* Word Buttons */}
      <View style={styles.wordsContainer}>
        {SIGHT_WORDS_SESSION10.map((option, index) => {
          const isSelected = selectedWord === option.word;
          const isCorrectOption = option.word === currentRoundData.word;
          const showResult = selectedWord !== null;

          const buttonAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: buttonScales[index].value }],
          }));

          let buttonColors = ['#C7D2FE', '#A5B4FC'];
          if (showResult) {
            if (isSelected && isCorrectOption) {
              buttonColors = ['#22C55E', '#16A34A'];
            } else if (isSelected && !isCorrectOption) {
              buttonColors = ['#EF4444', '#DC2626'];
            }
          }

          return (
            <Animated.View key={option.word} entering={FadeInDown.delay(index * 100)} style={buttonAnimatedStyle}>
              <Pressable
                onPress={() => handleWordSelect(option.word)}
                disabled={completed}
                style={styles.wordButton}
              >
                <LinearGradient
                  colors={buttonColors}
                  style={styles.wordButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.wordButtonText}>{option.word}</Text>
                  {showResult && isSelected && (
                    <View style={styles.resultIcon}>
                      <Ionicons
                        name={isCorrectOption ? 'checkmark-circle' : 'close-circle'}
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
  wordsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 20,
  },
  wordButton: {
    width: 200,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  wordButtonGradient: {
    paddingVertical: 24,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    position: 'relative',
  },
  wordButtonText: {
    fontSize: 36,
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
