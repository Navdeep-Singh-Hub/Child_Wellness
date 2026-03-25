// Game 4: Shape Match - Tap rectangle objects
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../builder/utils/audio';
import { RECTANGLE_OBJECTS } from './gameData';

interface ShapeMatchGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function ShapeMatchGameScreen({ onComplete, onBack }: ShapeMatchGameScreenProps) {
  const { width } = useWindowDimensions();
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);

  const objectScales = RECTANGLE_OBJECTS.map(() => useSharedValue(1));

  useEffect(() => {
    speakInstruction('Tap the rectangle objects.').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const handleObjectTap = async (objectId: string, isRectangle: boolean) => {
    if (completed) return;

    const index = RECTANGLE_OBJECTS.findIndex(o => o.id === objectId);
    objectScales[index].value = withSpring(0.9, {}, () => {
      objectScales[index].value = withSpring(1);
    });

    if (isRectangle) {
      const newSelected = new Set(selectedObjects);
      newSelected.add(objectId);
      setSelectedObjects(newSelected);

      await playSoundEffect('correct');
      await speakFeedback('Great! That is a rectangle!');

      // Check if all rectangles are selected
      const allRectangles = RECTANGLE_OBJECTS.filter(o => o.isRectangle);
      if (allRectangles.every(rect => newSelected.has(rect.id))) {
        setTimeout(() => {
          setCompleted(true);
          playSoundEffect('celebration');
          speakFeedback('Excellent! You found all the rectangles!');
          setTimeout(() => {
            onComplete();
          }, 2000);
        }, 500);
      }
    } else {
      await playSoundEffect('incorrect');
      await speakFeedback('That is not a rectangle. Try again!');
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
        <Text style={styles.headerTitle}>Shape Match</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Tap the rectangle objects</Text>
      </View>

      {/* Objects Grid */}
      <View style={styles.objectsContainer}>
        {RECTANGLE_OBJECTS.map((obj, index) => {
          const isSelected = selectedObjects.has(obj.id);
          const isCorrect = obj.isRectangle;

          const objectAnimatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: objectScales[index].value }],
          }));

          return (
            <Animated.View
              key={obj.id}
              entering={FadeInDown.delay(index * 100)}
              style={[objectAnimatedStyle, styles.objectWrapper]}
            >
              <Pressable
                onPress={() => handleObjectTap(obj.id, obj.isRectangle)}
                disabled={completed || isSelected}
                style={[
                  styles.objectCard,
                  isSelected && isCorrect && styles.objectCardCorrect,
                  isSelected && !isCorrect && styles.objectCardIncorrect,
                ]}
              >
                <Text style={styles.objectEmoji}>{obj.emoji}</Text>
                <Text style={styles.objectName}>{obj.name}</Text>
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <Ionicons
                      name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                      size={32}
                      color={isCorrect ? '#10B981' : '#EF4444'}
                    />
                  </View>
                )}
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
  },
  objectsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 20,
  },
  objectWrapper: {
    width: '45%',
    maxWidth: 180,
  },
  objectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#6C9EFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    minHeight: 150,
    position: 'relative',
  },
  objectCardCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  objectCardIncorrect: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  objectEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  objectName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
