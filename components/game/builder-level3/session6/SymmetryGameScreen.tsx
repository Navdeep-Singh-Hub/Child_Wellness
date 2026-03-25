// Game 4: Symmetry Game - Complete the other half
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../builder/utils/audio';
import { SYMMETRY_SHAPES } from './gameData';

interface SymmetryGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

const SYMMETRY_EXAMPLES = [
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋', halfEmoji: '🦋' },
  { id: 'heart', name: 'Heart', emoji: '❤️', halfEmoji: '❤️' },
  { id: 'star', name: 'Star', emoji: '⭐', halfEmoji: '⭐' },
];

export default function SymmetryGameScreen({ onComplete, onBack }: SymmetryGameScreenProps) {
  const { width } = useWindowDimensions();
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const shapeScales = SYMMETRY_SHAPES.map(() => useSharedValue(1));
  const exampleScale = useSharedValue(1);

  useEffect(() => {
    speakInstruction('Complete the other half to make it symmetrical.').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const handleShapeSelect = async (shapeId: string) => {
    if (completed || selectedShape) return;

    const currentExample = SYMMETRY_EXAMPLES[currentExampleIndex];
    // Match shape ID to example ID
    const isCorrect = 
      (currentExample.id === 'butterfly' && shapeId === 'butterfly-wing') ||
      (currentExample.id === 'heart' && shapeId === 'heart-half') ||
      (currentExample.id === 'star' && shapeId === 'star-points');

    const index = SYMMETRY_SHAPES.findIndex(s => s.id === shapeId);
    shapeScales[index].value = withSpring(0.9, {}, () => {
      shapeScales[index].value = withSpring(1);
    });

    setSelectedShape(shapeId);

    if (isCorrect) {
      await playSoundEffect('correct');
      await speakFeedback('Perfect! Both sides match!');
      
      setCorrectCount(prev => {
        const newCount = prev + 1;
        if (newCount >= SYMMETRY_EXAMPLES.length) {
          setTimeout(() => {
            setCompleted(true);
            playSoundEffect('celebration');
            speakFeedback('Excellent! You understand symmetry!');
            setTimeout(() => {
              onComplete();
            }, 2000);
          }, 1000);
        } else {
          setTimeout(() => {
            setCurrentExampleIndex(newCount);
            setSelectedShape(null);
          }, 1500);
        }
        return newCount;
      });
    } else {
      await playSoundEffect('incorrect');
      await speakFeedback('That doesn\'t match. Try again!');
      
      setTimeout(() => {
        setSelectedShape(null);
      }, 1500);
    }
  };

  const currentExample = SYMMETRY_EXAMPLES[currentExampleIndex];
  // For each example, show all shapes but only the matching one is correct
  const availableShapes = SYMMETRY_SHAPES;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Symmetry Game</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Complete the other half</Text>
        <Text style={styles.instructionSubtext}>Both sides should look the same</Text>
      </View>

      {/* Symmetry Example */}
      <View style={styles.symmetryContainer}>
        <View style={styles.halfContainer}>
          <Text style={styles.halfLabel}>Left Side</Text>
          <View style={styles.halfShape}>
            <Text style={styles.halfEmoji}>{currentExample.halfEmoji}</Text>
          </View>
        </View>

        <View style={styles.centerLine}>
          <View style={styles.line} />
          <Text style={styles.lineLabel}>|</Text>
        </View>

        <View style={styles.halfContainer}>
          <Text style={styles.halfLabel}>Right Side</Text>
          <View style={[styles.halfShape, selectedShape && styles.halfShapeFilled]}>
            {selectedShape ? (
              <Text style={styles.halfEmoji}>
                {SYMMETRY_SHAPES.find(s => s.id === selectedShape)?.emoji || '?'}
              </Text>
            ) : (
              <Text style={styles.placeholderText}>?</Text>
            )}
          </View>
        </View>
      </View>

      {/* Shape Options */}
      <View style={styles.shapesContainer}>
        <Text style={styles.shapesLabel}>Tap the matching shape:</Text>
        <View style={styles.shapesGrid}>
          {availableShapes.map((shape, index) => {
            const isSelected = selectedShape === shape.id;
            // Determine if this shape is correct for the current example
            const isCorrect = 
              (currentExample.id === 'butterfly' && shape.id === 'butterfly-wing') ||
              (currentExample.id === 'heart' && shape.id === 'heart-half') ||
              (currentExample.id === 'star' && shape.id === 'star-points');

            const shapeAnimatedStyle = useAnimatedStyle(() => ({
              transform: [{ scale: shapeScales[SYMMETRY_SHAPES.findIndex(s => s.id === shape.id)].value }],
            }));

            let cardColors = ['#FFFFFF', '#F8FAFC'];
            if (isSelected) {
              cardColors = isCorrect ? ['#ECFDF5', '#D1FAE5'] : ['#FEF2F2', '#FEE2E2'];
            }

            return (
              <Animated.View
                key={shape.id}
                entering={FadeInDown.delay(index * 100)}
                style={[shapeAnimatedStyle, styles.shapeWrapper]}
              >
                <Pressable
                  onPress={() => handleShapeSelect(shape.id)}
                  disabled={completed || isSelected}
                  style={[
                    styles.shapeCard,
                    { backgroundColor: cardColors[0] },
                    isSelected && isCorrect && styles.shapeCardCorrect,
                    isSelected && !isCorrect && styles.shapeCardIncorrect,
                  ]}
                >
                  <Text style={styles.shapeEmoji}>{shape.emoji}</Text>
                  <Text style={styles.shapeName}>{shape.name}</Text>
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Ionicons
                        name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                        size={24}
                        color={isCorrect ? '#10B981' : '#EF4444'}
                      />
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
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
  instructionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  instructionSubtext: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  symmetryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  halfContainer: {
    flex: 1,
    alignItems: 'center',
  },
  halfLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  halfShape: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  halfShapeFilled: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderStyle: 'solid',
  },
  halfEmoji: {
    fontSize: 64,
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#D1D5DB',
  },
  centerLine: {
    width: 4,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: 4,
    height: '100%',
    backgroundColor: '#6C9EFF',
    borderRadius: 2,
  },
  lineLabel: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: '700',
    color: '#6C9EFF',
  },
  shapesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  shapesLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  shapesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  shapeWrapper: {
    width: '45%',
    maxWidth: 150,
  },
  shapeCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#6C9EFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    minHeight: 120,
    position: 'relative',
  },
  shapeCardCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  shapeCardIncorrect: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  shapeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  shapeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
