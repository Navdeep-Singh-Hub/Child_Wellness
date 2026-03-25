// Game 4: Shape Match - Triangle objects
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../builder/utils/audio';
import { TRIANGLE_OBJECTS, TriangleObject } from './gameData';

interface ShapeMatchGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

interface ObjectState {
  id: string;
  object: TriangleObject;
  x: number;
  y: number;
  isDragging: boolean;
  isInBox: boolean;
}

export default function ShapeMatchGameScreen({ onComplete, onBack }: ShapeMatchGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const BOX_X = width * 0.5 - 150;
  const BOX_Y = height * 0.3;
  const BOX_WIDTH = 300;
  const BOX_HEIGHT = 200;

  const [objects, setObjects] = useState<ObjectState[]>(
    TRIANGLE_OBJECTS.map((obj, idx) => ({
      id: `obj-${obj.id}`,
      object: obj,
      x: (idx % 2) * (width * 0.4) + width * 0.15,
      y: height * 0.7 + (Math.floor(idx / 2) * 120),
      isDragging: false,
      isInBox: false,
    }))
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    speakInstruction('Drag triangle objects into the triangle box.').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const isPointInBox = (x: number, y: number): boolean => {
    return x >= BOX_X && x <= BOX_X + BOX_WIDTH && y >= BOX_Y && y <= BOX_Y + BOX_HEIGHT;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const obj = objects.find((o) => {
        const dist = Math.sqrt(Math.pow(locationX - o.x, 2) + Math.pow(locationY - o.y, 2));
        return dist < 60 && !o.isInBox;
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
        prev.map((o) => {
          if (o.id === draggedId) {
            const inBox = isPointInBox(locationX, locationY);
            return { ...o, x: locationX, y: locationY, isInBox: inBox };
          }
          return o;
        })
      );
    },
    onPanResponderRelease: async () => {
      if (!draggedId || completed) return;
      const obj = objects.find((o) => o.id === draggedId);
      if (obj && obj.isInBox) {
        const isCorrect = obj.object.isTriangle;
        if (isCorrect) {
          await playSoundEffect('correct');
          await speakFeedback('Great! That is a triangle!');
          setCorrectCount((prev) => {
            const newCount = prev + 1;
            if (newCount === TRIANGLE_OBJECTS.filter((o) => o.isTriangle).length) {
              setTimeout(() => {
                setCompleted(true);
                setTimeout(() => {
                  onComplete();
                }, 1500);
              }, 500);
            }
            return newCount;
          });
        } else {
          await playSoundEffect('incorrect');
          await speakFeedback('That is not a triangle. Try again!');
          setObjects((prev) =>
            prev.map((o) => {
              if (o.id === draggedId) {
                const originalIndex = TRIANGLE_OBJECTS.findIndex((obj) => obj.id === o.object.id);
                return {
                  ...o,
                  x: (originalIndex % 2) * (width * 0.4) + width * 0.15,
                  y: height * 0.7 + (Math.floor(originalIndex / 2) * 120),
                  isDragging: false,
                  isInBox: false,
                };
              }
              return o;
            })
          );
        }
      } else {
        const originalIndex = TRIANGLE_OBJECTS.findIndex((obj) => 
          objects.find((o) => o.id === draggedId)?.object.id === obj.id
        );
        setObjects((prev) =>
          prev.map((o) =>
            o.id === draggedId
              ? {
                  ...o,
                  x: (originalIndex % 2) * (width * 0.4) + width * 0.15,
                  y: height * 0.7 + (Math.floor(originalIndex / 2) * 120),
                  isDragging: false,
                  isInBox: false,
                }
              : o
          )
        );
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
        <Text style={styles.headerTitle}>Match Triangle Shapes</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag triangle objects into the box</Text>
        <Text style={styles.shapeLabel}>Triangle 🔺</Text>
      </View>

      {/* Triangle Box */}
      <View style={styles.boxContainer} {...panResponder.panHandlers}>
        <View
          style={[
            styles.triangleBox,
            {
              left: BOX_X,
              top: BOX_Y,
              width: BOX_WIDTH,
              height: BOX_HEIGHT,
            },
          ]}
        >
          <Text style={styles.boxLabel}>Triangle Box</Text>
          <Text style={styles.triangleEmoji}>🔺</Text>
          {objects
            .filter((o) => o.isInBox && o.object.isTriangle)
            .map((o) => (
              <View key={o.id} style={styles.objectInBox}>
                <Text style={styles.objectEmoji}>{o.object.emoji}</Text>
              </View>
            ))}
        </View>
      </View>

      {/* Objects */}
      {objects
        .filter((o) => !o.isInBox)
        .map((obj, idx) => (
          <Animated.View
            key={obj.id}
            entering={FadeInDown.delay(idx * 100)}
            style={[
              styles.objectCard,
              {
                left: obj.x - 50,
                top: obj.y - 50,
              },
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.objectGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.objectEmoji}>{obj.object.emoji}</Text>
              <Text style={styles.objectName}>{obj.object.name}</Text>
            </LinearGradient>
          </Animated.View>
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
    marginBottom: 8,
  },
  shapeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C9EFF',
  },
  boxContainer: {
    flex: 1,
    position: 'relative',
  },
  triangleBox: {
    position: 'absolute',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#6C9EFF',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(108, 158, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6C9EFF',
    marginBottom: 8,
  },
  triangleEmoji: {
    fontSize: 48,
  },
  objectInBox: {
    position: 'absolute',
    top: 60,
    left: '50%',
    marginLeft: -30,
  },
  objectCard: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  objectGradient: {
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
