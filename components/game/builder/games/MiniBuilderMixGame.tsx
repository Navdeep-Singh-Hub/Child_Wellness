// Game 5: Mini Builder Mix
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
import { playPhoneme, playLetterSound, playSoundEffect, speakWord, speakFeedback, stopAllAudio } from '../utils/audio';
import { LISTEN_TAP_DATA, BUILD_WORD_DATA, SHAPE_MATCH_DATA, ShapeType, shuffleArray } from '../utils/gameData';

interface MiniBuilderMixGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

type RoundType = 'sound' | 'word' | 'shape';

// Shape component
function ShapeComponent({ type, size = 60, color = '#A5B4FC' }: { type: ShapeType; size?: number; color?: string }) {
  if (type === 'circle') {
    return <View style={[styles.shapeBase, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]} />;
  } else if (type === 'square') {
    return <View style={[styles.shapeBase, { width: size, height: size, backgroundColor: color }]} />;
  } else {
    return (
      <View style={[styles.shapeBase, { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: size / 2, borderRightWidth: size / 2, borderBottomWidth: size, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }]} />
    );
  }
}

export default function MiniBuilderMixGame({ onComplete, onBack }: MiniBuilderMixGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [roundType, setRoundType] = useState<RoundType>('sound');
  const [roundData, setRoundData] = useState<any>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [canSelect, setCanSelect] = useState(true);
  const [wordBoxes, setWordBoxes] = useState<(string | null)[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);

  const cardScale = useSharedValue(1);
  const soundTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const TOTAL_ROUNDS = 3; // 3 rounds: sound, word, shape

  useEffect(() => {
    loadRound();
  }, [round]);

  useEffect(() => {
    if (soundTimeoutRef.current) {
      clearTimeout(soundTimeoutRef.current);
      soundTimeoutRef.current = null;
    }

    if (roundData && roundType === 'sound') {
      stopAllAudio();
      soundTimeoutRef.current = setTimeout(async () => {
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 200));
        await playPhoneme(roundData.phoneme).catch(() => {});
        soundTimeoutRef.current = null;
      }, 800);
    } else if (roundData && roundType === 'word') {
      stopAllAudio();
      soundTimeoutRef.current = setTimeout(async () => {
        stopAllAudio();
        await new Promise(resolve => setTimeout(resolve, 200));
        await speakWord(roundData.word).catch(() => {});
        soundTimeoutRef.current = null;
      }, 800);
    }

    return () => {
      if (soundTimeoutRef.current) {
        clearTimeout(soundTimeoutRef.current);
        soundTimeoutRef.current = null;
      }
      stopAllAudio();
    };
  }, [roundData, roundType]);

  const loadRound = () => {
    if (round >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'mini-builder-mix',
      });
      return;
    }

    const roundTypes: RoundType[] = ['sound', 'word', 'shape'];
    const type = roundTypes[round];
    setRoundType(type);

    if (type === 'sound') {
      const item = LISTEN_TAP_DATA[round % LISTEN_TAP_DATA.length];
      const allImages = [item.correctImage, item.wrongImage];
      const shuffled = shuffleArray(allImages);
      setRoundData(item);
      setOptions(shuffled);
    } else if (type === 'word') {
      const item = BUILD_WORD_DATA[round % BUILD_WORD_DATA.length];
      const shuffled = shuffleArray([...item.letters]);
      setRoundData(item);
      setOptions([]);
      setWordBoxes([null, null, null]);
      setAvailableLetters(shuffled);
      setCurrentLetterIndex(0);
    } else {
      const item = SHAPE_MATCH_DATA[round % SHAPE_MATCH_DATA.length];
      const shuffled = shuffleArray([...item.options]);
      setRoundData(item);
      setOptions(shuffled);
    }

    setSelectedIndex(null);
    setIsCorrect(null);
    setCanSelect(true);
    cardScale.value = 1;
  };

  const handleSoundSelect = async (index: number) => {
    if (!canSelect || !roundData || roundType !== 'sound') return;

    setCanSelect(false);
    setSelectedIndex(index);
    const correct = options[index] === roundData.correctImage;

    if (correct) {
      setIsCorrect(true);
      setScore(score + 1);
      await playSoundEffect('success');
      await speakFeedback('Great job!');
      setTimeout(() => {
        setRound(round + 1);
      }, 2000);
    } else {
      setIsCorrect(false);
      await playSoundEffect('error');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setSelectedIndex(null);
        setIsCorrect(null);
        setCanSelect(true);
      }, 1500);
    }
  };

  const handleLetterTap = async (letter: string) => {
    if (!roundData || roundType !== 'word') return;
    
    const expectedLetter = roundData.letters[currentLetterIndex];
    const isCorrect = letter === expectedLetter;

    if (isCorrect) {
      const newBoxes = [...wordBoxes];
      newBoxes[currentLetterIndex] = letter;
      setWordBoxes(newBoxes);
      
      const newAvailable = availableLetters.filter((l) => l !== letter);
      setAvailableLetters(newAvailable);

      await playSoundEffect('success');
      await playLetterSound(letter);

      if (currentLetterIndex === roundData.letters.length - 1) {
        setScore(score + 1);
        await speakFeedback('Great job!');
        setTimeout(() => {
          setRound(round + 1);
        }, 2000);
      } else {
        setCurrentLetterIndex(currentLetterIndex + 1);
      }
    } else {
      await playSoundEffect('error');
      await speakFeedback('Try again!');
    }
  };

  const handleShapeSelect = async (index: number) => {
    if (!canSelect || !roundData || roundType !== 'shape') return;

    setCanSelect(false);
    setSelectedIndex(index);
    const correct = options[index] === roundData.targetShape;

    if (correct) {
      setIsCorrect(true);
      setScore(score + 1);
      await playSoundEffect('success');
      await speakFeedback('Perfect!');
      setTimeout(() => {
        setRound(round + 1);
      }, 2000);
    } else {
      setIsCorrect(false);
      await playSoundEffect('error');
      await speakFeedback('Try again!');
      setTimeout(() => {
        setSelectedIndex(null);
        setIsCorrect(null);
        setCanSelect(true);
      }, 1500);
    }
  };

  const handleReplay = async () => {
    if (!roundData) return;
    stopAllAudio();
    await new Promise(resolve => setTimeout(resolve, 200));
    if (roundType === 'sound') {
      await playPhoneme(roundData.phoneme).catch(() => {});
    } else if (roundType === 'word') {
      await speakWord(roundData.word).catch(() => {});
    }
  };

  const getRoundTitle = () => {
    if (roundType === 'sound') return 'Round 1: Listen & Tap';
    if (roundType === 'word') return 'Round 2: Build the Word';
    return 'Round 3: Match Shape';
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  if (!roundData) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Mini Builder Mix</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}/{TOTAL_ROUNDS}</Text>
        </View>
      </View>

      {/* Round Title */}
      <View style={styles.roundTitleContainer}>
        <Text style={styles.roundTitle}>{getRoundTitle()}</Text>
      </View>

      {/* Sound Round */}
      {roundType === 'sound' && (
        <>
          <View style={styles.soundSection}>
            <Pressable onPress={handleReplay} style={styles.replayButton}>
              <LinearGradient
                colors={['#A5B4FC', '#818CF8']}
                style={styles.replayGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="volume-high" size={32} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </View>
          <View style={styles.optionsContainer}>
            {options.map((image, index) => {
              const isSelected = selectedIndex === index;
              const showFeedback = isSelected && isCorrect !== null;
              const isCorrectOption = image === roundData.correctImage;

              return (
                <Pressable
                  key={index}
                  onPress={() => handleSoundSelect(index)}
                  disabled={!canSelect}
                  style={styles.optionWrapper}
                >
                  <Animated.View
                    style={[
                      styles.optionCard,
                      cardAnimatedStyle,
                      showFeedback && isCorrect && styles.correctCard,
                      showFeedback && !isCorrect && styles.incorrectCard,
                    ]}
                  >
                    <Image source={{ uri: image }} style={styles.optionImage} resizeMode="cover" />
                    {showFeedback && (
                      <View style={styles.feedbackIcon}>
                        <Ionicons
                          name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                          size={48}
                          color={isCorrect ? '#22C55E' : '#EF4444'}
                        />
                      </View>
                    )}
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* Word Round */}
      {roundType === 'word' && (
        <>
          <View style={styles.pictureContainer}>
            <Image source={{ uri: roundData.image }} style={styles.picture} resizeMode="cover" />
          </View>
          <View style={styles.wordBoxesContainer}>
            <View style={styles.boxesRow}>
              {wordBoxes.map((letter, index) => {
                const isHighlighted = index === currentLetterIndex && !letter;
                return (
                  <View
                    key={index}
                    style={[
                      styles.wordBox,
                      isHighlighted && styles.highlightedBox,
                      letter && styles.filledBox,
                    ]}
                  >
                    {letter && <Text style={styles.boxLetter}>{letter.toUpperCase()}</Text>}
                  </View>
                );
              })}
            </View>
          </View>
          <View style={styles.lettersContainer}>
            {availableLetters.map((letter, index) => {
              const isNextLetter = letter === roundData.letters[currentLetterIndex];
              return (
                <Pressable
                  key={index}
                  onPress={() => handleLetterTap(letter)}
                  style={styles.letterCard}
                >
                  <LinearGradient
                    colors={isNextLetter ? ['#A5B4FC', '#818CF8'] : ['#C7D2FE', '#A5B4FC']}
                    style={styles.letterGradient}
                  >
                    <Text style={styles.letterText}>{letter.toUpperCase()}</Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* Shape Round */}
      {roundType === 'shape' && (
        <>
          <View style={styles.targetContainer}>
            <View style={styles.targetShape}>
              <ShapeComponent type={roundData.targetShape} size={120} color="#A5B4FC" />
            </View>
          </View>
          <View style={styles.optionsContainer}>
            {options.map((shape, index) => {
              const isSelected = selectedIndex === index;
              const showFeedback = isSelected && isCorrect !== null;
              const isCorrectOption = shape === roundData.targetShape;

              return (
                <Pressable
                  key={index}
                  onPress={() => handleShapeSelect(index)}
                  disabled={!canSelect}
                  style={styles.optionWrapper}
                >
                  <Animated.View
                    style={[
                      styles.optionCard,
                      showFeedback && isCorrect && styles.correctCard,
                      showFeedback && !isCorrect && styles.incorrectCard,
                    ]}
                  >
                    <ShapeComponent
                      type={shape}
                      size={80}
                      color={showFeedback && isCorrect ? '#22C55E' : showFeedback && !isCorrect ? '#EF4444' : '#A5B4FC'}
                    />
                    {showFeedback && (
                      <View style={styles.feedbackIcon}>
                        <Ionicons
                          name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                          size={40}
                          color={isCorrect ? '#22C55E' : '#EF4444'}
                        />
                      </View>
                    )}
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        </>
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
  scoreContainer: {
    backgroundColor: '#A5B4FC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  roundTitleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  roundTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366F1',
  },
  soundSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  replayButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  replayGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  optionWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  optionCard: {
    aspectRatio: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  correctCard: {
    borderWidth: 4,
    borderColor: '#22C55E',
  },
  incorrectCard: {
    borderWidth: 4,
    borderColor: '#EF4444',
  },
  optionImage: {
    width: '100%',
    height: '100%',
  },
  feedbackIcon: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  pictureContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  picture: {
    width: 200,
    height: 200,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  wordBoxesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  wordBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  highlightedBox: {
    borderColor: '#A5B4FC',
    backgroundColor: '#F0F4FF',
  },
  filledBox: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  boxLetter: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1E293B',
  },
  lettersContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  letterCard: {
    width: 80,
    height: 80,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  letterGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  targetContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  targetShape: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A5B4FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#A5B4FC',
  },
  shapeBase: {
    backgroundColor: '#A5B4FC',
  },
});
