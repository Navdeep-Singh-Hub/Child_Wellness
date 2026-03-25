// Game 4: Height Sort - Drag objects to TALL or SHORT boxes
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../clockwise/utils/audio';
import { SORTING_OBJECTS_SESSION6 } from './gameData';

interface HeightSortGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

interface ObjectState {
  id: string;
  emoji: string;
  label: string;
  height: 'tall' | 'short';
  x: number;
  y: number;
  isDragging: boolean;
  matchedBox: 'tall' | 'short' | null;
}

interface BoxState {
  id: 'tall' | 'short';
  label: string;
  color: string;
  x: number;
  y: number;
  objects: string[];
}

export default function HeightSortGameScreen({ onComplete, onBack }: HeightSortGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const BOX_Y = height * 0.25;
  const OBJECT_Y = height * 0.65;
  const BOX_WIDTH = (width - 60) / 2;
  const OBJECT_SIZE = 100;

  const [boxes] = useState<BoxState[]>([
    {
      id: 'tall',
      label: 'TALL',
      color: '#6C9EFF',
      x: 20,
      y: BOX_Y,
      objects: [],
    },
    {
      id: 'short',
      label: 'SHORT',
      color: '#FFB6C1',
      x: width / 2 + 10,
      y: BOX_Y,
      objects: [],
    },
  ]);

  const [objects, setObjects] = useState<ObjectState[]>(
    SORTING_OBJECTS_SESSION6.map((obj, idx) => ({
      id: obj.id,
      emoji: obj.emoji,
      label: obj.label,
      height: obj.height as 'tall' | 'short',
      x: 20 + (idx % 2) * (OBJECT_SIZE + 20),
      y: OBJECT_Y + Math.floor(idx / 2) * (OBJECT_SIZE + 20),
      isDragging: false,
      matchedBox: null,
    }))
  );

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    speakInstruction('Drag each object to the correct box.').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const isPointInBox = (x: number, y: number, box: BoxState): boolean => {
    return (
      x >= box.x &&
      x <= box.x + BOX_WIDTH &&
      y >= box.y &&
      y <= box.y + 120
    );
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const obj = objects.find((o) => {
        const dist = Math.sqrt(Math.pow(locationX - o.x, 2) + Math.pow(locationY - o.y, 2));
        return dist < 60 && !o.matchedBox;
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
      for (const box of boxes) {
        if (
          isPointInBox(draggedObject.x, draggedObject.y, box) &&
          draggedObject.height === box.id
        ) {
          matched = true;
          setObjects((prev) =>
            prev.map((o) =>
              o.id === draggedId
                ? {
                    ...o,
                    x: box.x + BOX_WIDTH / 2 - OBJECT_SIZE / 2,
                    y: box.y + 40,
                    isDragging: false,
                    matchedBox: box.id,
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
              }, 500);
            }
            return newCount;
          });
          break;
        }
      }

      if (!matched) {
        setObjects((prev) =>
          prev.map((o) => (o.id === draggedId ? { ...o, isDragging: false } : o))
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
        <Text style={styles.headerTitle}>Sort by Height</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag each object to the correct box</Text>
      </View>

      {/* Boxes */}
      <View style={styles.boxesContainer} {...panResponder.panHandlers}>
        {boxes.map((box) => (
          <View
            key={box.id}
            style={[
              styles.box,
              {
                left: box.x,
                top: box.y,
                width: BOX_WIDTH,
                backgroundColor: box.color,
              },
            ]}
          >
            <Text style={styles.boxLabel}>{box.label}</Text>
          </View>
        ))}
      </View>

      {/* Objects */}
      <View style={styles.objectsContainer} {...panResponder.panHandlers}>
        {objects.map((obj) => (
          <Animated.View
            key={obj.id}
            entering={FadeInDown.delay(parseInt(obj.id) * 100)}
            style={[
              styles.object,
              {
                left: obj.x - OBJECT_SIZE / 2,
                top: obj.y - OBJECT_SIZE / 2,
                width: OBJECT_SIZE,
                height: OBJECT_SIZE,
                opacity: obj.matchedBox ? 0.7 : 1,
                zIndex: obj.isDragging ? 1000 : 1,
              },
            ]}
          >
            <View style={styles.objectCard}>
              <Text style={styles.objectEmoji}>{obj.emoji}</Text>
              <View style={obj.height === 'tall' ? styles.tallIndicator : styles.shortIndicator} />
            </View>
          </Animated.View>
        ))}
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {matchedCount} / {objects.length}
        </Text>
      </View>

      {/* Next Button */}
      {completed && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.buttonContainer}>
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
    paddingVertical: 16,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  boxesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  box: {
    position: 'absolute',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    minHeight: 120,
  },
  boxLabel: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  objectsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  object: {
    position: 'absolute',
  },
  objectCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    padding: 8,
  },
  objectEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  tallIndicator: {
    width: 40,
    height: 8,
    backgroundColor: '#6C9EFF',
    borderRadius: 4,
  },
  shortIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#FFB6C1',
    borderRadius: 4,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
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
