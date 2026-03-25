// Game 4: Shape Match - Oval Objects
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../utils/audio';
import { OVAL_OBJECTS } from '../utils/gameData';

interface ShapeMatchGameScreenProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function ShapeMatchGameScreen({ onComplete, onBack }: ShapeMatchGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    setSelectedObjects(new Set());
    speakInstruction('Tap the oval shapes.');
    return () => stopAllAudio();
  }, [round]);

  const handleSelect = (objectId: string, isOval: boolean) => {
    if (selectedObjects.has(objectId)) return;

    const newSelected = new Set(selectedObjects);
    newSelected.add(objectId);
    setSelectedObjects(newSelected);

    if (isOval) {
      setScore((prev) => prev + 1);
      playSoundEffect('correct');
      speakFeedback('Correct! That is an oval shape!');
    } else {
      playSoundEffect('incorrect');
      speakFeedback('Try again! Look for oval shapes.');
    }

    // Check if all oval objects are selected
    const allOvalsSelected = OVAL_OBJECTS.filter((o) => o.isOval).every((o) => newSelected.has(o.id));
    if (allOvalsSelected) {
      setTimeout(() => {
        if (round < TOTAL_ROUNDS - 1) {
          setRound((prev) => prev + 1);
        } else {
          const totalOvals = OVAL_OBJECTS.filter((o) => o.isOval).length;
          const accuracy = (score / (totalOvals * TOTAL_ROUNDS)) * 100;
          onComplete({
            correct: score,
            total: totalOvals * TOTAL_ROUNDS,
            accuracy,
            gameId: 'shape-match',
          });
        }
      }, 2000);
    }
  };

  const handleNext = () => {
    if (round < TOTAL_ROUNDS - 1) {
      setRound((prev) => prev + 1);
    } else {
      const totalOvals = OVAL_OBJECTS.filter((o) => o.isOval).length;
      const accuracy = (score / (totalOvals * TOTAL_ROUNDS)) * 100;
      onComplete({
        correct: score,
        total: totalOvals * TOTAL_ROUNDS,
        accuracy,
        gameId: 'shape-match',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#6C9EFF', '#FFB6C1', '#7FE7CC'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Find Oval Shapes</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Tap the oval shapes</Text>
        <Text style={styles.shapeEmoji}>⬭</Text>
      </View>

      {/* Objects Grid */}
      <View style={styles.objectsContainer}>
        {OVAL_OBJECTS.map((obj) => {
          const isSelected = selectedObjects.has(obj.id);
          const isCorrect = obj.isOval && isSelected;
          const isIncorrect = !obj.isOval && isSelected;

          return (
            <Pressable
              key={obj.id}
              style={[
                styles.objectCard,
                isCorrect && styles.objectCardCorrect,
                isIncorrect && styles.objectCardIncorrect,
              ]}
              onPress={() => handleSelect(obj.id, obj.isOval)}
              disabled={isSelected}
            >
              <Text style={styles.objectEmoji}>{obj.emoji}</Text>
              <Text style={styles.objectName}>{obj.name}</Text>
              {isSelected && (
                <View style={styles.checkmark}>
                  {isCorrect ? (
                    <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                  ) : (
                    <Ionicons name="close-circle" size={32} color="#EF4444" />
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </Pressable>
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
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
  },
  roundText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  shapeEmoji: {
    fontSize: 48,
  },
  objectsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  objectCard: {
    width: '45%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#E2E8F0',
    minHeight: 160,
  },
  objectCardCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  objectCardIncorrect: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  objectEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  objectName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  controls: {
    padding: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7FE7CC',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
