// Game 4: Drag Objects Away - Drag away three apples (6-3=3)
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Draggable from 'react-native-draggable';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../reader/utils/audio';
import { SUBTRACTION_6_MINUS_3 } from './gameData';

interface DragObjectsGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function DragObjectsGameScreen({ onComplete, onBack }: DragObjectsGameScreenProps) {
  const [applesInBasket, setApplesInBasket] = useState(6);
  const [applesRemoved, setApplesRemoved] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);

  const basketScale = useSharedValue(1);
  const resultScale = useSharedValue(0);

  useEffect(() => {
    speakInstruction('Drag away three apples').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const handleAppleRemoved = async () => {
    if (applesRemoved >= 3) return;

    const newRemoved = applesRemoved + 1;
    setApplesRemoved(newRemoved);
    setApplesInBasket(6 - newRemoved);
    
    basketScale.value = withSpring(1.1, {}, () => {
      basketScale.value = withSpring(1);
    });

    if (newRemoved === 3) {
      setTimeout(() => {
        setShowResult(true);
        resultScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      }, 1000);

      await playSoundEffect('correct');
      await speakFeedback('Great! You removed three apples!');
      
      setTimeout(() => {
        setCompleted(true);
      }, 2000);
    }
  };

  const basketAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: basketScale.value }],
  }));

  const resultAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
    opacity: resultScale.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Drag Objects Away</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag away three apples</Text>
      </View>

      {/* Basket with Apples */}
      <Animated.View style={[styles.basketContainer, basketAnimatedStyle]} entering={FadeInDown.delay(200)}>
        <View style={styles.basket}>
          <Text style={styles.basketLabel}>Basket</Text>
          <View style={styles.applesInBasket}>
            {Array.from({ length: applesInBasket }).map((_, index) => (
              <Animated.View key={index} entering={FadeInDown.delay(300 + index * 100)}>
                <View style={styles.appleBox}>
                  <Text style={styles.appleEmoji}>🍎</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Draggable Apples */}
      <View style={styles.draggableContainer}>
        {Array.from({ length: 6 }).map((_, index) => {
          if (index < applesRemoved) return null;
          
          return (
            <Draggable
              key={index}
              x={50 + (index - applesRemoved) * 100}
              y={400}
              onDragRelease={(event, gestureState, bounds) => {
                // Check if dragged outside basket area
                if (gestureState.moveY > 300) {
                  handleAppleRemoved();
                }
              }}
            >
              <Animated.View entering={FadeInDown.delay(600 + index * 100)} style={styles.draggableApple}>
                <View style={styles.appleBox}>
                  <Text style={styles.appleEmoji}>🍎</Text>
                </View>
              </Animated.View>
            </Draggable>
          );
        })}
      </View>

      {/* Result Display */}
      {showResult && (
        <Animated.View style={[styles.resultContainer, resultAnimatedStyle]} entering={FadeInDown.delay(800)}>
          <Text style={styles.resultLabel}>Remaining apples:</Text>
          <View style={styles.resultApples}>
            {Array.from({ length: applesInBasket }).map((_, index) => (
              <Text key={index} style={styles.resultAppleEmoji}>🍎</Text>
            ))}
          </View>
          <Text style={styles.resultNumber}>{applesInBasket}</Text>
        </Animated.View>
      )}

      {/* Next Button */}
      {completed && (
        <Animated.View entering={FadeInDown.delay(1000)} style={styles.buttonContainer}>
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
  basketContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  basket: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#6C9EFF',
    minWidth: 300,
  },
  basketLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6C9EFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  applesInBasket: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  appleBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appleEmoji: {
    fontSize: 50,
  },
  draggableContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  draggableApple: {
    width: 80,
    height: 80,
  },
  resultContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  resultApples: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  resultAppleEmoji: {
    fontSize: 50,
  },
  resultNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#6C9EFF',
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
