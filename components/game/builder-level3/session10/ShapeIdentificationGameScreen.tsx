// Game 2: Shape Identification - Tap the correct shape
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../builder/utils/audio';
import { SHAPES } from './gameData';

interface ShapeIdentificationGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function ShapeIdentificationGameScreen({ onComplete, onBack }: ShapeIdentificationGameScreenProps) {
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const shapeScales = SHAPES.map(() => useSharedValue(1));

  useEffect(() => {
    if (currentShapeIndex < SHAPES.length) {
      const currentShape = SHAPES[currentShapeIndex];
      speakInstruction(`Tap the ${currentShape.name.toLowerCase()}`).catch(() => {});
    }
    return () => stopAllAudio();
  }, [currentShapeIndex]);

  const handleShapeSelect = async (shapeId: string) => {
    if (selectedShape || completed) return;

    const index = SHAPES.findIndex(s => s.id === shapeId);
    shapeScales[index].value = withSpring(0.9, {}, () => {
      shapeScales[index].value = withSpring(1);
    });

    setSelectedShape(shapeId);
    const currentShape = SHAPES[currentShapeIndex];
    const isCorrect = shapeId === currentShape.id;

    if (isCorrect) {
      await playSoundEffect('correct');
      await speakFeedback('Perfect!');
      
      setCorrectCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= SHAPES.length) {
          setTimeout(() => {
            setCompleted(true);
            playSoundEffect('celebration');
            speakFeedback('Excellent! You identified all the shapes!');
            setTimeout(() => {
              onComplete();
            }, 2000);
          }, 2000);
        } else {
          setTimeout(() => {
            setCurrentShapeIndex(newCount);
            setSelectedShape(null);
          }, 2000);
        }
        return newCount;
      });
    } else {
      await playSoundEffect('incorrect');
      await speakFeedback('Try again!');
      
      setTimeout(() => {
        setSelectedShape(null);
      }, 1500);
    }
  };

  const currentShape = SHAPES[currentShapeIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Shape Identification</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Shape {currentShapeIndex + 1} of {SHAPES.length}
        </Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Tap the {currentShape?.name.toLowerCase()}</Text>
      </View>

      {/* Shape Cards */}
      <View style={styles.shapesContainer}>
        {SHAPES.map((shape, index) => {
          const isSelected = selectedShape === shape.id;
          const isCorrect = shape.id === currentShape.id;
          const showFeedback = selectedShape !== null;

          const shapeAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: shapeScales[index].value }],
          }));

          let cardColors = ['#FFFFFF', '#F8FAFC'];
          if (showFeedback) {
            if (isSelected && isCorrect) {
              cardColors = ['#ECFDF5', '#D1FAE5'];
            } else if (isSelected && !isCorrect) {
              cardColors = ['#FEF2F2', '#FEE2E2'];
            }
          }

          return (
            <Animated.View
              key={shape.id}
              entering={FadeInDown.delay(index * 100)}
              style={shapeAnimatedStyle}
            >
              <Pressable
                onPress={() => handleShapeSelect(shape.id)}
                disabled={completed}
                style={styles.shapeCard}
              >
                <LinearGradient
                  colors={cardColors}
                  style={styles.shapeCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.shapeEmoji}>{shape.emoji}</Text>
                  <Text style={styles.shapeName}>{shape.name}</Text>
                  {showFeedback && isSelected && (
                    <View style={styles.resultIcon}>
                      <Ionicons
                        name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={32}
                        color={isCorrect ? '#10B981' : '#EF4444'}
                      />
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  instructionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  shapesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  shapeCard: {
    width: '45%',
    maxWidth: 180,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#6C9EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shapeCardGradient: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    position: 'relative',
  },
  shapeEmoji: {
    fontSize: 80,
    marginBottom: 12,
  },
  shapeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  resultIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
