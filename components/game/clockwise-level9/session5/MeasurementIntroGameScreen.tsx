// Game 3: Measurement Introduction - Learn about long and short
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { speakInstruction, stopAllAudio } from '../../clockwise/utils/audio';
import { MEASUREMENT_OBJECTS_SESSION5 } from './gameData';

interface MeasurementIntroGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function MeasurementIntroGameScreen({ onComplete, onBack }: MeasurementIntroGameScreenProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const shortPencilScale = useSharedValue(0);
  const longPencilScale = useSharedValue(0);
  const explanationOpacity = useSharedValue(0);

  useEffect(() => {
    const initMeasurement = async () => {
      shortPencilScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      longPencilScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await speakInstruction('This pencil is short.');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      await speakInstruction('This pencil is long.');
      
      setShowExplanation(true);
      explanationOpacity.value = withTiming(1, { duration: 500 });
      
      setTimeout(() => {
        setShowNextButton(true);
      }, 2000);
    };

    initMeasurement().catch(() => {});

    return () => {
      stopAllAudio();
    };
  }, []);

  const shortPencilAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shortPencilScale.value }],
  }));

  const longPencilAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: longPencilScale.value }],
  }));

  const explanationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: explanationOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Measurement</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Objects Display */}
      <View style={styles.objectsContainer}>
        {/* Short Pencil */}
        <Animated.View style={[styles.objectWrapper, shortPencilAnimatedStyle]} entering={FadeInDown.delay(200)}>
          <View style={styles.objectCard}>
            <Text style={styles.objectEmoji}>{MEASUREMENT_OBJECTS_SESSION5.shortPencil.emoji}</Text>
            <View style={styles.shortLine} />
            <Text style={styles.objectLabel}>Short</Text>
          </View>
        </Animated.View>

        {/* Long Pencil */}
        <Animated.View style={[styles.objectWrapper, longPencilAnimatedStyle]} entering={FadeInDown.delay(400)}>
          <View style={styles.objectCard}>
            <Text style={styles.objectEmoji}>{MEASUREMENT_OBJECTS_SESSION5.longPencil.emoji}</Text>
            <View style={styles.longLine} />
            <Text style={styles.objectLabel}>Long</Text>
          </View>
        </Animated.View>
      </View>

      {/* Explanation */}
      {showExplanation && (
        <Animated.View style={[styles.explanationContainer, explanationAnimatedStyle]} entering={FadeInDown.delay(600)}>
          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>
              This pencil is short.
            </Text>
            <Text style={styles.explanationText}>
              This pencil is long.
            </Text>
            <Text style={styles.explanationDescription}>
              Can you see the difference? The long pencil is bigger than the short pencil.
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Next Button */}
      {showNextButton && (
        <Animated.View entering={FadeInDown.delay(800)} style={styles.buttonContainer}>
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
  objectsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  objectWrapper: {
    alignItems: 'center',
  },
  objectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 140,
  },
  objectEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  shortLine: {
    width: 80,
    height: 8,
    backgroundColor: '#FFB6C1',
    borderRadius: 4,
    marginBottom: 16,
  },
  longLine: {
    width: 140,
    height: 8,
    backgroundColor: '#6C9EFF',
    borderRadius: 4,
    marginBottom: 16,
  },
  objectLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  explanationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  explanationBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  explanationText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  explanationDescription: {
    fontSize: 18,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 8,
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
