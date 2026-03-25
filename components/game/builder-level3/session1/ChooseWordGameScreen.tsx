// Game 2: Choose the Word - Multiple choice
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, speakWord, stopAllAudio } from '../../builder/utils/audio';
import { WORD_OPTIONS } from '../../builder/utils/gameData';

interface ChooseWordGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

const CORRECT_WORD = 'CAT';
const CAT_IMAGE = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop';

export default function ChooseWordGameScreen({ onComplete, onBack }: ChooseWordGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width > 768;
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showImage, setShowImage] = useState(false);
  const [completed, setCompleted] = useState(false);
  
  // Track actual rendered heights
  const [headerHeight, setHeaderHeight] = useState(0);
  const [instructionHeight, setInstructionHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate dimensions dynamically based on actual rendered heights
  const CARD_COUNT = WORD_OPTIONS.length;
  const CONTAINER_PADDING_TOP = 8;
  const CONTAINER_PADDING_BOTTOM = 8;
  const CARD_GAP = isDesktop ? 10 : 8;
  const TOTAL_GAPS = (CARD_COUNT - 1) * CARD_GAP;
  const TOTAL_PADDING = CONTAINER_PADDING_TOP + CONTAINER_PADDING_BOTTOM;
  
  // Calculate available height for cards - use actual measured heights when available
  const calculatedAvailableHeight = containerHeight > 0 
    ? containerHeight - TOTAL_PADDING - TOTAL_GAPS
    : (headerHeight > 0 && instructionHeight > 0)
      ? height - headerHeight - instructionHeight - TOTAL_PADDING - TOTAL_GAPS
      : height * 0.6; // Fallback estimate
  
  // Calculate card dimensions - ensure they fit
  const CARD_HEIGHT = Math.max(
    Math.min(
      Math.floor(calculatedAvailableHeight / CARD_COUNT),
      isDesktop ? 120 : 100
    ),
    isDesktop ? 90 : 80
  );
  const CARD_WIDTH = isDesktop 
    ? Math.min(280, width * 0.3) 
    : Math.min(width * 0.85, 260);

  const buttonScales = WORD_OPTIONS.map(() => useSharedValue(1));
  const imageScale = useSharedValue(0);
  const imageOpacity = useSharedValue(0);

  useEffect(() => {
    speakInstruction('Tap the word CAT').catch(() => {});
    return () => {
      stopAllAudio();
    };
  }, []);

  const handleWordSelect = async (word: string) => {
    if (selectedWord || completed) return;

    const index = WORD_OPTIONS.findIndex(w => w.word === word);
    buttonScales[index].value = withSpring(0.9, {}, () => {
      buttonScales[index].value = withSpring(1);
    });

    setSelectedWord(word);
    const correct = word === CORRECT_WORD;
    setIsCorrect(correct);

    if (correct) {
      await playSoundEffect('correct');
      await speakFeedback('Great job!');
      await speakWord('CAT');
      
      // Show cat image animation
      setShowImage(true);
      imageScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      imageOpacity.value = withSpring(1, { damping: 10, stiffness: 100 });

      setTimeout(() => {
        setCompleted(true);
      }, 2000);
    } else {
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      
      setTimeout(() => {
        setSelectedWord(null);
        setIsCorrect(null);
      }, 1500);
    }
  };

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
    opacity: imageOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View 
        style={styles.header}
        onLayout={(e) => {
          const { height: h } = e.nativeEvent.layout;
          setHeaderHeight(h);
        }}
      >
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Choose the Word</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View 
        style={styles.instructionContainer}
        onLayout={(e) => {
          const { height: h } = e.nativeEvent.layout;
          setInstructionHeight(h);
        }}
      >
        <Text style={[styles.instructionText, isDesktop && styles.instructionTextDesktop]}>
          Tap the word CAT
        </Text>
      </View>

      {/* Word Buttons */}
      <View 
        style={[
          styles.wordsContainer, 
          {
            gap: CARD_GAP,
            paddingHorizontal: isDesktop ? 40 : 20,
            paddingTop: CONTAINER_PADDING_TOP,
            paddingBottom: CONTAINER_PADDING_BOTTOM,
          }
        ]}
        onLayout={(e) => {
          const { height: h } = e.nativeEvent.layout;
          setContainerHeight(h);
        }}
      >
        {WORD_OPTIONS.map((option, index) => {
          const isSelected = selectedWord === option.word;
          const isCorrectOption = option.word === CORRECT_WORD;
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
            <Animated.View 
              key={option.word} 
              entering={FadeInDown.delay(index * 100)} 
              style={[
                buttonAnimatedStyle, 
                {
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                }
              ]}
            >
              <Pressable
                onPress={() => handleWordSelect(option.word)}
                disabled={completed}
                style={[styles.wordButton, { height: '100%' }]}
              >
                <LinearGradient
                  colors={buttonColors}
                  style={[styles.wordButtonGradient, { height: '100%' }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[
                    styles.wordButtonEmoji,
                    { fontSize: isDesktop ? 50 : Math.min(48, CARD_HEIGHT * 0.4) }
                  ]}>
                    {option.image}
                  </Text>
                  <Text style={[
                    styles.wordButtonText,
                    isDesktop && styles.wordButtonTextDesktop,
                    { fontSize: isDesktop ? 38 : Math.max(24, Math.min(32, CARD_HEIGHT * 0.28)) }
                  ]}>
                    {option.word}
                  </Text>
                  {showResult && isSelected && (
                    <View style={styles.resultIcon}>
                      <Ionicons
                        name={isCorrectOption ? 'checkmark-circle' : 'close-circle'}
                        size={isDesktop ? 36 : 28}
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

      {/* Cat Image Animation - Absolute positioned so it doesn't affect layout */}
      {showImage && (
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <Text style={styles.imageLabel}>Great job! 🎉</Text>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: CAT_IMAGE }} style={styles.catImage} resizeMode="cover" />
          </View>
        </Animated.View>
      )}

      {/* Next Button - Absolute positioned at bottom */}
      {completed && (
        <Animated.View 
          entering={FadeInDown.delay(200)} 
          style={styles.buttonContainer}
        >
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
    paddingTop: 10,
    paddingBottom: 10,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  instructionContainer: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  instructionTextDesktop: {
    fontSize: 24,
  },
  wordsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordButton: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  wordButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flex: 1,
  },
  wordButtonEmoji: {
    marginBottom: 4,
    textAlign: 'center',
  },
  wordButtonText: {
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  wordButtonTextDesktop: {
    // Font size set dynamically
  },
  resultIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  imageContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -75 }],
    zIndex: 1000,
  },
  imageLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
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
