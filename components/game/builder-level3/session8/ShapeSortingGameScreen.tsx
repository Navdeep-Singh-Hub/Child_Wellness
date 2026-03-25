// Game 4: Shape Sorting - Drag objects into shape boxes
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../builder/utils/audio';
import { SHAPE_CATEGORIES, SHAPE_OBJECTS } from './gameData';

interface ShapeSortingGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

interface ObjectState {
  id: string;
  name: string;
  emoji: string;
  shape: string;
  x: number;
  y: number;
  isDragging: boolean;
  matchedCategoryId: string | null;
}

interface CategoryState {
  id: string;
  name: string;
  emoji: string;
  color: string;
  x: number;
  y: number;
  objects: string[];
}

export default function ShapeSortingGameScreen({ onComplete, onBack }: ShapeSortingGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const CATEGORY_Y = height * 0.25;
  const OBJECT_Y = height * 0.65;
  const CATEGORY_WIDTH = (width - 60) / 3;
  const OBJECT_SIZE = 100;

  const [categories] = useState<CategoryState[]>(
    SHAPE_CATEGORIES.map((cat, idx) => ({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      color: cat.color,
      x: 20 + idx * (CATEGORY_WIDTH + 10),
      y: CATEGORY_Y,
      objects: [],
    }))
  );

  const [objects, setObjects] = useState<ObjectState[]>(
    SHAPE_OBJECTS.map((obj, idx) => ({
      id: obj.id,
      name: obj.name,
      emoji: obj.emoji,
      shape: obj.shape,
      x: 20 + (idx % 3) * (OBJECT_SIZE + 20),
      y: OBJECT_Y + Math.floor(idx / 3) * (OBJECT_SIZE + 20),
      isDragging: false,
      matchedCategoryId: null,
    }))
  );

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    speakInstruction('Drag objects into the correct shape boxes.').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const isPointInCategory = (x: number, y: number, category: CategoryState): boolean => {
    return (
      x >= category.x &&
      x <= category.x + CATEGORY_WIDTH &&
      y >= category.y &&
      y <= category.y + 120
    );
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const obj = objects.find((o) => {
        const dist = Math.sqrt(Math.pow(locationX - o.x, 2) + Math.pow(locationY - o.y, 2));
        return dist < 60 && !o.matchedCategoryId;
      });
      if (obj && !completed) {
        setDraggedId(obj.id);
        setObjects((prev) =>
          prev.map((o) => (o.id === obj.id ? { ...o, isDragging: true } : o))
        );
        playSoundEffect('click');
        return true;
      }
      return false;
    },
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt) => {
      if (!draggedId || completed) return;
      const { locationX, locationY } = evt.nativeEvent;
      setObjects((prev) =>
        prev.map((o) =>
          o.id === draggedId ? { ...o, x: locationX, y: locationY } : o
        )
      );
    },
    onPanResponderRelease: async () => {
      if (!draggedId || completed) return;
      const draggedObject = objects.find((o) => o.id === draggedId);
      if (!draggedObject) return;

      let matched = false;
      for (const category of categories) {
        if (
          isPointInCategory(draggedObject.x, draggedObject.y, category) &&
          draggedObject.shape === category.id
        ) {
          matched = true;
          setObjects((prev) =>
            prev.map((o) =>
              o.id === draggedId
                ? {
                    ...o,
                    x: category.x + CATEGORY_WIDTH / 2 - OBJECT_SIZE / 2,
                    y: category.y + 40,
                    isDragging: false,
                    matchedCategoryId: category.id,
                  }
                : o
            )
          );
          await playSoundEffect('correct');
          await speakFeedback('Perfect!');
          
          setMatchedCount((prev) => {
            const newCount = prev + 1;
            if (newCount >= objects.length) {
              setTimeout(() => {
                setCompleted(true);
                playSoundEffect('celebration');
                speakFeedback('Excellent! All objects sorted!');
                setTimeout(() => {
                  onComplete();
                }, 2000);
              }, 1000);
            }
            return newCount;
          });
          break;
        }
      }

      if (!matched) {
        const originalIndex = objects.findIndex((o) => o.id === draggedId);
        const originalX = 20 + (originalIndex % 3) * (OBJECT_SIZE + 20);
        const originalY = OBJECT_Y + Math.floor(originalIndex / 3) * (OBJECT_SIZE + 20);
        setObjects((prev) =>
          prev.map((o) =>
            o.id === draggedId
              ? {
                  ...o,
                  x: originalX,
                  y: originalY,
                  isDragging: false,
                }
              : o
          )
        );
        await playSoundEffect('incorrect');
        await speakFeedback('Try again!');
      }

      setDraggedId(null);
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Shape Sorting</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag objects into the correct shape boxes</Text>
      </View>

      {/* Category Boxes */}
      <View style={styles.categoriesContainer} {...panResponder.panHandlers}>
        {categories.map((category) => {
          const categoryObjects = objects.filter((o) => o.matchedCategoryId === category.id);
          return (
            <View
              key={category.id}
              style={[
                styles.categoryBox,
                {
                  left: category.x,
                  top: category.y,
                  backgroundColor: category.color + '20',
                  borderColor: category.color,
                },
              ]}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              {categoryObjects.map((obj, idx) => (
                <View
                  key={obj.id}
                  style={[
                    styles.matchedObject,
                    {
                      top: 80 + idx * 50,
                    },
                  ]}
                >
                  <Text style={styles.matchedObjectEmoji}>{obj.emoji}</Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>

      {/* Objects */}
      {objects.map((obj) => (
        <View
          key={obj.id}
          style={[
            styles.objectCard,
            {
              left: obj.x - OBJECT_SIZE / 2,
              top: obj.y - OBJECT_SIZE / 2,
              opacity: obj.matchedCategoryId ? 0.5 : 1,
            },
          ]}
        >
          <LinearGradient
            colors={obj.matchedCategoryId ? ['#10B981', '#16A34A'] : ['#FFFFFF', '#F8FAFC']}
            style={styles.objectCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.objectEmoji}>{obj.emoji}</Text>
            {!obj.matchedCategoryId && (
              <Text style={styles.objectName}>{obj.name}</Text>
            )}
          </LinearGradient>
        </View>
      ))}
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
  categoriesContainer: {
    flex: 1,
    position: 'relative',
  },
  categoryBox: {
    position: 'absolute',
    width: 100,
    minHeight: 120,
    borderRadius: 20,
    borderWidth: 4,
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
  },
  categoryEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  matchedObject: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchedObjectEmoji: {
    fontSize: 24,
  },
  objectCard: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  objectCardGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  objectEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  objectName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
});
