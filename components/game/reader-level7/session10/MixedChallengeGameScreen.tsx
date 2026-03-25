// Game 4: Mixed Challenge - Combine reading and math
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../reader/utils/audio';
import { MIXED_CHALLENGE_SESSION10 } from './gameData';

interface MixedChallengeGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function MixedChallengeGameScreen({ onComplete, onBack }: MixedChallengeGameScreenProps) {
  const [selectedPicture, setSelectedPicture] = useState<string | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [pictureCompleted, setPictureCompleted] = useState(false);
  const [numberCompleted, setNumberCompleted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const pictureButtonScales = MIXED_CHALLENGE_SESSION10.pictureOptions.map(() => useSharedValue(1));
  const numberButtonScales = [3, 4, 5].map(() => useSharedValue(1));

  useEffect(() => {
    speakInstruction('Match the sentence to the picture, then count the stars').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const handlePictureSelect = async (picture: string) => {
    if (selectedPicture || pictureCompleted) return;

    const index = MIXED_CHALLENGE_SESSION10.pictureOptions.indexOf(picture);
    pictureButtonScales[index].value = withSpring(0.9, {}, () => {
      pictureButtonScales[index].value = withSpring(1);
    });

    setSelectedPicture(picture);
    const isCorrect = picture === MIXED_CHALLENGE_SESSION10.correctPicture;

    if (isCorrect) {
      await playSoundEffect('correct');
      await speakFeedback('Perfect! You matched the sentence!');
      setPictureCompleted(true);
    } else {
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setSelectedPicture(null);
      }, 1500);
    }
  };

  const handleNumberSelect = async (number: number) => {
    if (selectedNumber !== null || numberCompleted) return;

    const index = [3, 4, 5].indexOf(number);
    numberButtonScales[index].value = withSpring(0.9, {}, () => {
      numberButtonScales[index].value = withSpring(1);
    });

    setSelectedNumber(number);
    const isCorrect = number === MIXED_CHALLENGE_SESSION10.correctAnswer;

    if (isCorrect) {
      await playSoundEffect('correct');
      await speakFeedback('Perfect! You counted correctly!');
      setNumberCompleted(true);
      
      if (pictureCompleted) {
        setTimeout(() => {
          setCompleted(true);
        }, 2000);
      }
    } else {
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setSelectedNumber(null);
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
        <Text style={styles.headerTitle}>Mixed Challenge</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Sentence Display */}
      <View style={styles.sentenceContainer}>
        <View style={styles.sentenceBox}>
          <Text style={styles.sentenceText}>{MIXED_CHALLENGE_SESSION10.sentence}</Text>
        </View>
      </View>

      {/* Picture Selection */}
      <View style={styles.pictureSection}>
        <Text style={styles.sectionTitle}>Tap the correct picture:</Text>
        <View style={styles.picturesContainer}>
          {MIXED_CHALLENGE_SESSION10.pictureOptions.map((picture, index) => {
            const isSelected = selectedPicture === picture;
            const isCorrect = picture === MIXED_CHALLENGE_SESSION10.correctPicture;
            const showFeedback = selectedPicture !== null;

            const buttonAnimatedStyle = useAnimatedStyle(() => ({
              transform: [{ scale: pictureButtonScales[index].value }],
            }));

            let buttonColors = ['#C7D2FE', '#A5B4FC'];
            if (showFeedback) {
              if (isSelected && isCorrect) {
                buttonColors = ['#22C55E', '#16A34A'];
              } else if (isSelected && !isCorrect) {
                buttonColors = ['#EF4444', '#DC2626'];
              }
            }

            const emojiMap: { [key: string]: string } = {
              dog: '🐕',
              cat: '🐱',
              sun: '☀️',
            };

            return (
              <Animated.View key={picture} entering={FadeInDown.delay(index * 100)} style={buttonAnimatedStyle}>
                <Pressable
                  onPress={() => handlePictureSelect(picture)}
                  disabled={pictureCompleted}
                  style={styles.pictureButton}
                >
                  <LinearGradient
                    colors={buttonColors}
                    style={styles.pictureButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.pictureEmoji}>{emojiMap[picture] || '❓'}</Text>
                    {showFeedback && isSelected && (
                      <View style={styles.resultIcon}>
                        <Ionicons
                          name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                          size={24}
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
      </View>

      {/* Number Selection */}
      {pictureCompleted && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.numberSection}>
          <Text style={styles.sectionTitle}>How many stars?</Text>
          <View style={styles.starsDisplay}>
            {Array.from({ length: MIXED_CHALLENGE_SESSION10.starsCount }).map((_, index) => (
              <Text key={index} style={styles.starEmoji}>⭐</Text>
            ))}
          </View>
          <View style={styles.numbersContainer}>
            {[3, 4, 5].map((number, index) => {
              const isSelected = selectedNumber === number;
              const isCorrect = number === MIXED_CHALLENGE_SESSION10.correctAnswer;
              const showFeedback = selectedNumber !== null;

              const buttonAnimatedStyle = useAnimatedStyle(() => ({
                transform: [{ scale: numberButtonScales[index].value }],
              }));

              let buttonColors = ['#FFB6C1', '#FF9EC4'];
              if (showFeedback) {
                if (isSelected && isCorrect) {
                  buttonColors = ['#22C55E', '#16A34A'];
                } else if (isSelected && !isCorrect) {
                  buttonColors = ['#EF4444', '#DC2626'];
                }
              }

              return (
                <Animated.View key={number} entering={FadeInDown.delay(400 + index * 100)} style={buttonAnimatedStyle}>
                  <Pressable
                    onPress={() => handleNumberSelect(number)}
                    disabled={numberCompleted}
                    style={styles.numberButton}
                  >
                    <LinearGradient
                      colors={buttonColors}
                      style={styles.numberButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.numberButtonText}>{number}</Text>
                      {showFeedback && isSelected && (
                        <View style={styles.resultIcon}>
                          <Ionicons
                            name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                            size={24}
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
        </Animated.View>
      )}

      {/* Next Button */}
      {completed && (
        <Animated.View entering={FadeInDown.delay(600)} style={styles.buttonContainer}>
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
  sentenceContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  sentenceBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 32,
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sentenceText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  pictureSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  picturesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  pictureButton: {
    width: 120,
    height: 120,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  pictureButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pictureEmoji: {
    fontSize: 60,
  },
  numberSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  starsDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  starEmoji: {
    fontSize: 50,
  },
  numbersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  numberButton: {
    width: 100,
    height: 100,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  numberButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  numberButtonText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  resultIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
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
