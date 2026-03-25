// Game 3: Visual Subtraction - 7 - 2 = 5
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakInstruction, stopAllAudio } from '../../reader/utils/audio';
import { SUBTRACTION_7_MINUS_2 } from './gameData';

interface VisualSubtractionGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function VisualSubtractionGameScreen({ onComplete, onBack }: VisualSubtractionGameScreenProps) {
  const [starsRemoved, setStarsRemoved] = useState(0);
  const [showEquation, setShowEquation] = useState(false);

  const starScales = SUBTRACTION_7_MINUS_2.objects.map(() => useSharedValue(1));

  useEffect(() => {
    speakInstruction('Take away two stars').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const handleRemoveStar = (index: number) => {
    if (starsRemoved >= 2) return;
    if (starScales[index].value === 0) return; // Already removed

    starScales[index].value = withTiming(0, { duration: 500 });

    const newRemoved = starsRemoved + 1;
    setStarsRemoved(newRemoved);

    if (newRemoved === 2) {
      setTimeout(() => {
        setShowEquation(true);
      }, 1000);
    }
  };

  const starAnimatedStyles = starScales.map((scale) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: scale.value,
    }))
  );

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
        <Text style={styles.instructionText}>Take away two stars</Text>
      </View>

      {/* Objects Display */}
      <View style={styles.objectsContainer}>
        {SUBTRACTION_7_MINUS_2.objects.map((emoji, index) => (
          <Animated.View
            key={index}
            style={starAnimatedStyles[index]}
            entering={FadeInDown.delay(200 + index * 100)}
          >
            <Pressable onPress={() => handleRemoveStar(index)} disabled={starsRemoved >= 2}>
              <View style={styles.starBox}>
                <Text style={styles.starEmoji}>{emoji}</Text>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {/* Equation Display */}
      {showEquation && (
        <Animated.View entering={FadeInDown.delay(300)} style={styles.equationContainer}>
          <Text style={styles.equationText}>7 - 2 = 5</Text>
        </Animated.View>
      )}

      {/* Next Button */}
      {showEquation && (
        <Animated.View entering={FadeInDown.delay(500)} style={styles.buttonContainer}>
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
  },
  starBox: {
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
  starEmoji: {
    fontSize: 60,
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
