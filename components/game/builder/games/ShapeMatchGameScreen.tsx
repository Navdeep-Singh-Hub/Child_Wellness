// Game 4: Shape Match
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../utils/audio';
import { CIRCLE_OBJECTS } from '../utils/gameData';

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

interface ShapeMatchGameScreenProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function ShapeMatchGameScreen({ onComplete, onBack }: ShapeMatchGameScreenProps) {
  const { width, height } = useWindowDimensions();
  // Make layout responsive - adjust for desktop vs mobile
  const isDesktop = width > 768;
  const BOX_X = isDesktop ? width * 0.15 : width * 0.1;
  const BOX_Y = isDesktop ? height * 0.25 : height * 0.3;
  const BOX_WIDTH = isDesktop ? width * 0.7 : width * 0.8;
  const BOX_HEIGHT = isDesktop ? height * 0.35 : height * 0.4;

  const getInitialObjectPosition = useCallback((idx: number) => {
    const isDesktop = width > 768;
    if (isDesktop) {
      // Desktop: spread objects more horizontally
      return {
        x: (idx % 3) * (width / 4) + width * 0.15,
        y: Math.floor(idx / 3) * 140 + height * 0.65,
      };
    } else {
      // Mobile: 2 columns
      return {
        x: (idx % 2) * (width / 3) + width * 0.2,
        y: Math.floor(idx / 2) * 120 + height * 0.7,
      };
    }
  }, [width, height]);

  const [objects, setObjects] = useState<ObjectState[]>(
    CIRCLE_OBJECTS.map((obj, idx) => ({
      ...obj,
      ...getInitialObjectPosition(idx),
      isDragging: false,
      inBox: false,
    }))
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const draggedIdRef = React.useRef<string | null>(null);
  const containerLayoutRef = React.useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const objectsRef = React.useRef(objects);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const TOTAL_ROUNDS = 3;

  React.useEffect(() => {
    draggedIdRef.current = draggedId;
  }, [draggedId]);

  React.useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  useEffect(() => {
    // Reset for new round
    setObjects(
      CIRCLE_OBJECTS.map((obj, idx) => ({
        ...obj,
        ...getInitialObjectPosition(idx),
        isDragging: false,
        inBox: false,
      }))
    );
    setDraggedId(null);
    speakInstruction('Drag circle objects into the circle box.');
    return () => stopAllAudio();
  }, [round, width, height]);

  const isPointInBox = (x: number, y: number): boolean => {
    return x >= BOX_X && x <= BOX_X + BOX_WIDTH && y >= BOX_Y && y <= BOX_Y + BOX_HEIGHT;
  };

  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      evt.preventDefault?.();
      const { locationX, locationY, pageX, pageY } = evt.nativeEvent;
      const containerLayout = containerLayoutRef.current;
      if (!containerLayout) return false;
      
      // Use pageX/pageY for web (desktop), locationX/locationY for mobile
      const absX = pageX !== undefined ? pageX : (containerLayout.x + locationX);
      const absY = pageY !== undefined ? pageY : (containerLayout.y + locationY);
      
      const currentObjects = objectsRef.current;
      const obj = currentObjects.find((o) => {
        if (o.inBox) return false; // Don't allow dragging objects already in box
        
        // Object card is 100x100, centered at o.x, o.y
        // Calculate exact bounds: left: o.x - 50, right: o.x + 50, top: o.y - 50, bottom: o.y + 50
        const cardLeft = o.x - 50;
        const cardRight = o.x + 50;
        const cardTop = o.y - 50;
        const cardBottom = o.y + 50;
        
        // Check if click is exactly within the card bounds
        const isWithinBounds = absX >= cardLeft && absX <= cardRight && 
                              absY >= cardTop && absY <= cardBottom;
        
        return isWithinBounds;
      });
      
      if (obj) {
        draggedIdRef.current = obj.id;
        setDraggedId(obj.id);
        setObjects((prev) =>
          prev.map((o) => (o.id === obj.id ? { ...o, isDragging: true } : o))
        );
        playSoundEffect('click');
        return true;
      }
      return false;
    },
    onStartShouldSetPanResponderCapture: () => false,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Allow movement if we're already dragging or if there's significant movement
      return draggedIdRef.current !== null || Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (evt) => {
      evt.preventDefault?.();
    },
    onPanResponderMove: (evt, gestureState) => {
      evt.preventDefault?.();
      const currentDraggedId = draggedIdRef.current;
      if (!currentDraggedId) return;
      
      const { locationX, locationY, pageX, pageY } = evt.nativeEvent;
      const containerLayout = containerLayoutRef.current;
      if (!containerLayout) return;
      
      // Use pageX/pageY for web (desktop), locationX/locationY for mobile
      const absX = pageX !== undefined ? pageX : (containerLayout.x + locationX);
      const absY = pageY !== undefined ? pageY : (containerLayout.y + locationY);
      
      setObjects((prev) =>
        prev.map((o) => {
          if (o.id === currentDraggedId) {
            const inBox = isPointInBox(absX, absY);
            return { ...o, x: absX, y: absY, inBox };
          }
          return o;
        })
      );
    },
    onPanResponderRelease: () => {
      const currentDraggedId = draggedIdRef.current;
      if (!currentDraggedId) return;
      const obj = objectsRef.current.find((o) => o.id === currentDraggedId);
      if (obj) {
        const isCorrect = obj.isCircle && obj.inBox;
        
        if (isCorrect) {
          setScore((prev) => prev + 1);
          playSoundEffect('correct');
          speakFeedback(`Great! ${obj.name} is a circle!`);
          
          setObjects((prev) => {
            const updated = prev.map((o) =>
              o.id === currentDraggedId ? { ...o, isDragging: false } : o
            );
            
            // Check if all circles are in box
            const allCirclesInBox = updated.every((o) => 
              o.id === currentDraggedId || 
              (o.isCircle && o.inBox) ||
              !o.isCircle
            );
            
            if (allCirclesInBox) {
              setTimeout(() => {
                if (round < TOTAL_ROUNDS - 1) {
                  setRound((prev) => prev + 1);
                } else {
                  const accuracy = (score / (CIRCLE_OBJECTS.filter((o) => o.isCircle).length * TOTAL_ROUNDS)) * 100;
                  onComplete({
                    correct: score,
                    total: CIRCLE_OBJECTS.filter((o) => o.isCircle).length * TOTAL_ROUNDS,
                    accuracy,
                    gameId: 'shape-match',
                  });
                }
              }, 2000);
            }
            
            return updated;
          });
          
        } else if (obj.inBox && !obj.isCircle) {
          playSoundEffect('incorrect');
          speakFeedback(`${obj.name} is not a circle. Try again!`);
          
          // Move back
          const originalIndex = CIRCLE_OBJECTS.findIndex((o) => o.id === obj.id);
          const originalPos = getInitialObjectPosition(originalIndex);
          setObjects((prev) =>
            prev.map((o) =>
              o.id === currentDraggedId
                ? {
                    ...o,
                    ...originalPos,
                    isDragging: false,
                    inBox: false,
                  }
                : o
            )
          );
        } else {
          // Not in box, move back
          const originalIndex = CIRCLE_OBJECTS.findIndex((o) => o.id === obj.id);
          const originalPos = getInitialObjectPosition(originalIndex);
          setObjects((prev) =>
            prev.map((o) =>
              o.id === currentDraggedId
                ? {
                    ...o,
                    ...originalPos,
                    isDragging: false,
                    inBox: false,
                  }
                : o
            )
          );
        }
      }
      draggedIdRef.current = null;
      setDraggedId(null);
    },
  }), [objects, round, score, width, height]);

  const handleNext = () => {
    if (round < TOTAL_ROUNDS - 1) {
      setRound((prev) => prev + 1);
    } else {
      const accuracy = (score / (CIRCLE_OBJECTS.filter((o) => o.isCircle).length * TOTAL_ROUNDS)) * 100;
      onComplete({
        correct: score,
        total: CIRCLE_OBJECTS.filter((o) => o.isCircle).length * TOTAL_ROUNDS,
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
        <Text style={styles.title}>Shape Match</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag circle objects into the circle box</Text>
      </View>

      {/* Circle Box */}
      <View 
        style={styles.gameArea} 
        {...panResponder.panHandlers}
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
        >
          <Text style={styles.boxLabel}>Circle Objects</Text>
          <View style={styles.boxContent}>
            {objects.filter((o) => o.inBox && o.isCircle).map((obj) => (
              <Text key={obj.id} style={styles.boxEmoji}>
                {obj.emoji}
              </Text>
            ))}
          </View>
        </View>

        {/* Objects */}
        {objects.filter((o) => !o.inBox).map((obj) => (
          <View
            key={obj.id}
            style={[
              styles.objectCard,
              obj.isDragging && styles.objectCardDragging,
              {
                left: obj.x - 50,
                top: obj.y - 50,
                zIndex: obj.isDragging ? 1000 : 1,
              },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.objectEmoji}>{obj.emoji}</Text>
            <Text style={styles.objectName}>{obj.name}</Text>
          </View>
        ))}
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
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
    cursor: 'default',
    userSelect: 'none',
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
  },
  boxContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  boxEmoji: {
    fontSize: 64,
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
    cursor: 'grab',
    userSelect: 'none',
    transition: 'transform 0.1s ease',
  },
  objectCardDragging: {
    cursor: 'grabbing',
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 1000,
  },
  objectEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  objectName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
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
