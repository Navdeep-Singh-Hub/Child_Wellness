// Game 4: Shape Match - Drag circle objects
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../builder/utils/audio';
import { CIRCLE_OBJECTS } from '../../builder/utils/gameData';

interface ObjectState {
  id: string;
  name: string;
  emoji: string;
  isCircle: boolean;
  x: number;
  y: number;
  isDragging: boolean;
  inBox: boolean;
}

// Individual draggable object component
function DraggableObject({
  obj,
  onDragStart,
  onDragMove,
  onDragEnd,
  isPointInBox,
  containerLayout,
  disabled,
}: {
  obj: ObjectState;
  onDragStart: (id: string) => void;
  onDragMove: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string) => void;
  isPointInBox: (x: number, y: number) => boolean;
  containerLayout: { x: number; y: number; width: number; height: number } | null;
  disabled: boolean;
}) {
  const objX = useSharedValue(obj.x);
  const objY = useSharedValue(obj.y);
  const objScale = useSharedValue(1);
  const startX = useSharedValue(obj.x);
  const startY = useSharedValue(obj.y);

  // Initialize and update position
  React.useEffect(() => {
    objX.value = obj.x;
    objY.value = obj.y;
  }, [obj.x, obj.y]);

  const panGesture = Gesture.Pan()
    .enabled(!disabled && !obj.inBox)
    .onStart(() => {
      if (disabled || obj.inBox) return;
      startX.value = objX.value;
      startY.value = objY.value;
      objScale.value = withSpring(1.1);
      onDragStart(obj.id);
    })
    .onUpdate((e) => {
      if (disabled || obj.inBox || !obj.isDragging) return;
      
      if (!containerLayout) return;
      
      // Get absolute coordinates - use absoluteX/Y for web, fallback to relative + container offset
      const absX = e.absoluteX !== undefined ? e.absoluteX : (containerLayout.x + e.x);
      const absY = e.absoluteY !== undefined ? e.absoluteY : (containerLayout.y + e.y);
      
      objX.value = absX;
      objY.value = absY;
      onDragMove(obj.id, absX, absY);
    })
    .onEnd(() => {
      if (disabled || !obj.isDragging) return;
      objScale.value = withSpring(1);
      onDragEnd(obj.id);
    });

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate offset from initial position
    const offsetX = objX.value - obj.x;
    const offsetY = objY.value - obj.y;
    return {
      transform: [
        { translateX: offsetX },
        { translateY: offsetY },
        { scale: objScale.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.objectCard,
          {
            left: obj.x - 50,
            top: obj.y - 50,
          },
          animatedStyle,
        ]}
      >
        <Text style={styles.objectEmoji} selectable={false}>{obj.emoji}</Text>
        <Text style={styles.objectName} selectable={false}>{obj.name}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

interface ShapeMatchGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function ShapeMatchGameScreen({ onComplete, onBack }: ShapeMatchGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const BOX_X = width * 0.1;
  const BOX_Y = height * 0.3;
  const BOX_WIDTH = width * 0.8;
  const BOX_HEIGHT = height * 0.4;

  const [objects, setObjects] = useState<ObjectState[]>(
    CIRCLE_OBJECTS.map((obj, idx) => ({
      ...obj,
      x: (idx % 2) * (width / 3) + width * 0.2,
      y: Math.floor(idx / 2) * 120 + height * 0.7,
      isDragging: false,
      inBox: false,
    }))
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    speakInstruction('Drag circle objects into the circle box.').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const isPointInBox = (x: number, y: number): boolean => {
    return x >= BOX_X && x <= BOX_X + BOX_WIDTH && y >= BOX_Y && y <= BOX_Y + BOX_HEIGHT;
  };

  const objectsRef = React.useRef(objects);
  const completedRef = React.useRef(completed);
  const containerLayoutRef = React.useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  
  React.useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);
  
  React.useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  const handleDragStart = useCallback((id: string) => {
    if (completed) return;
    setDraggedId(id);
    setObjects((prev) =>
      prev.map((o) => (o.id === id ? { ...o, isDragging: true } : o))
    );
    playSoundEffect('click');
  }, [completed]);

  const handleDragMove = useCallback((id: string, x: number, y: number) => {
    if (completed || draggedId !== id) return;
    const inBox = isPointInBox(x, y);
    setObjects((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          return { ...o, x, y, inBox };
        }
        return o;
      })
    );
  }, [completed, draggedId, isPointInBox]);

  const handleDragEnd = useCallback((id: string) => {
    if (completed || draggedId !== id) return;
    const currentObj = objectsRef.current.find((o) => o.id === id);
    if (!currentObj) return;
    
    const isCorrect = currentObj.isCircle && currentObj.inBox;
    
    if (isCorrect) {
      playSoundEffect('correct');
      speakFeedback(`Great! ${currentObj.name} is a circle!`);
      
      setObjects((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, isDragging: false } : o
        )
      );
      
      // Check if all circles are in box
      const allCirclesInBox = objectsRef.current.every((o) => 
        o.id === id || 
        (o.isCircle && o.inBox) ||
        !o.isCircle
      );
      
      if (allCirclesInBox) {
        setTimeout(() => {
          setCompleted(true);
          playSoundEffect('celebration');
          speakFeedback('Excellent! All circle objects are in the box!');
          setTimeout(() => {
            onComplete();
          }, 2000);
        }, 500);
      }
    } else if (currentObj.inBox && !currentObj.isCircle) {
      playSoundEffect('incorrect');
      speakFeedback(`${currentObj.name} is not a circle. Try again!`);
      
      const originalIndex = CIRCLE_OBJECTS.findIndex((o) => o.id === currentObj.id);
      const originalX = (originalIndex % 2) * (width / 3) + width * 0.2;
      const originalY = Math.floor(originalIndex / 2) * 120 + height * 0.7;
      
      setObjects((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                x: originalX,
                y: originalY,
                isDragging: false,
                inBox: false,
              }
            : o
        )
      );
    } else {
      const originalIndex = CIRCLE_OBJECTS.findIndex((o) => o.id === currentObj.id);
      const originalX = (originalIndex % 2) * (width / 3) + width * 0.2;
      const originalY = Math.floor(originalIndex / 2) * 120 + height * 0.7;
      
      setObjects((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                x: originalX,
                y: originalY,
                isDragging: false,
                inBox: false,
              }
            : o
        )
      );
    }
    
    setDraggedId(null);
  }, [completed, draggedId, width, height]);

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
        <Text style={styles.instructionText} selectable={false}>Drag circle objects into the circle box</Text>
      </View>

      {/* Circle Box */}
      <View 
        style={styles.gameArea} 
        collapsable={false}
        onLayout={(evt) => {
          const { x, y, width, height } = evt.nativeEvent.layout;
          containerLayoutRef.current = { x, y, width, height };
        }}
      >
        <View
          style={[
            styles.circleBox,
            {
              left: BOX_X,
              top: BOX_Y,
              width: BOX_WIDTH,
              height: BOX_HEIGHT,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.boxLabel} selectable={false}>Circle Objects</Text>
          <View style={styles.boxContent}>
            {objects.filter((o) => o.inBox && o.isCircle).map((obj) => (
              <Text key={obj.id} style={styles.boxEmoji} selectable={false}>
                {obj.emoji}
              </Text>
            ))}
          </View>
        </View>

        {/* Objects - Each has its own gesture handler */}
        {objects.filter((o) => !o.inBox).map((obj) => (
          <DraggableObject
            key={obj.id}
            obj={obj}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            isPointInBox={isPointInBox}
            containerLayout={containerLayoutRef.current}
            disabled={completed}
          />
        ))}
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
    userSelect: 'none',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  circleBox: {
    position: 'absolute',
    backgroundColor: '#ECFDF5',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  boxLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 16,
    userSelect: 'none',
  },
  boxContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  boxEmoji: {
    fontSize: 64,
    userSelect: 'none',
  },
  objectCard: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#6C9EFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  objectEmoji: {
    fontSize: 48,
    marginBottom: 4,
    userSelect: 'none',
  },
  objectName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    userSelect: 'none',
  },
});
