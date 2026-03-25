// Game 4: Drag Addition Game - Drag apples into basket
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../counter/utils/audio';
import { ADDITION_1_PLUS_1 } from './gameData';

interface DragAdditionGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

interface AppleState {
  id: string;
  x: number;
  y: number;
  isDragging: boolean;
  inBasket: boolean;
}

export default function DragAdditionGameScreen({ onComplete, onBack }: DragAdditionGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const APPLE_SIZE = 80;
  const BASKET_X = width / 2 - 100;
  const BASKET_Y = height * 0.6;
  const BASKET_WIDTH = 200;
  const BASKET_HEIGHT = 150;
  const APPLE_START_Y = height * 0.25;

  const [apples, setApples] = useState<AppleState[]>([
    { id: 'apple-1', x: width * 0.2, y: APPLE_START_Y, isDragging: false, inBasket: false },
    { id: 'apple-2', x: width * 0.8, y: APPLE_START_Y, isDragging: false, inBasket: false },
  ]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [applesInBasket, setApplesInBasket] = useState(0);

  useEffect(() => {
    speakInstruction('Drag the apples into the basket').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const isPointInBasket = (x: number, y: number): boolean => {
    return (
      x >= BASKET_X &&
      x <= BASKET_X + BASKET_WIDTH &&
      y >= BASKET_Y &&
      y <= BASKET_Y + BASKET_HEIGHT
    );
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const apple = apples.find((a) => {
        const dist = Math.sqrt(Math.pow(locationX - a.x, 2) + Math.pow(locationY - a.y, 2));
        return dist < 50 && !a.inBasket;
      });
      if (apple && !completed) {
        setDraggedId(apple.id);
        setApples((prev) =>
          prev.map((a) => (a.id === apple.id ? { ...a, isDragging: true } : a))
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
      setApples((prev) =>
        prev.map((a) =>
          a.id === draggedId ? { ...a, x: locationX, y: locationY } : a
        )
      );
    },
    onPanResponderRelease: async () => {
      if (!draggedId || completed) return;
      const draggedApple = apples.find((a) => a.id === draggedId);
      if (!draggedApple) return;

      if (isPointInBasket(draggedApple.x, draggedApple.y)) {
        setApples((prev) =>
          prev.map((a) =>
            a.id === draggedId
              ? {
                  ...a,
                  x: BASKET_X + BASKET_WIDTH / 2 - APPLE_SIZE / 2,
                  y: BASKET_Y + BASKET_HEIGHT / 2 - APPLE_SIZE / 2 + (applesInBasket * 20),
                  isDragging: false,
                  inBasket: true,
                }
              : a
          )
        );
        
        setApplesInBasket((prev) => {
          const newCount = prev + 1;
          if (newCount === 2) {
            setTimeout(() => {
              setCompleted(true);
              playSoundEffect('celebration');
              speakFeedback('Perfect! 1 plus 1 equals 2!');
              setTimeout(() => {
                onComplete();
              }, 2000);
            }, 1000);
          } else {
            playSoundEffect('correct');
            speakFeedback('Great!');
          }
          return newCount;
        });
      } else {
        const originalIndex = apples.findIndex((a) => a.id === draggedId);
        const originalX = originalIndex === 0 ? width * 0.2 : width * 0.8;
        setApples((prev) =>
          prev.map((a) =>
            a.id === draggedId
              ? {
                  ...a,
                  x: originalX,
                  y: APPLE_START_Y,
                  isDragging: false,
                }
              : a
          )
        );
        await playSoundEffect('incorrect');
        await speakFeedback('Try dragging to the basket!');
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
        <Text style={styles.headerTitle}>Drag Addition</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag apples into the basket</Text>
        <Text style={styles.equationText}>1 + 1 = ?</Text>
      </View>

      {/* Basket */}
      <View style={styles.basketContainer} {...panResponder.panHandlers}>
        <View
          style={[
            styles.basket,
            {
              left: BASKET_X,
              top: BASKET_Y,
            },
          ]}
        >
          <Text style={styles.basketEmoji}>🧺</Text>
          {applesInBasket > 0 && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{applesInBasket}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Apples */}
      {apples.map((apple) => (
        <View
          key={apple.id}
          style={[
            styles.appleCard,
            {
              left: apple.x - APPLE_SIZE / 2,
              top: apple.y - APPLE_SIZE / 2,
              opacity: apple.inBasket ? 0.8 : 1,
            },
          ]}
        >
          <Text style={styles.appleEmoji}>{ADDITION_1_PLUS_1.objects[0]}</Text>
        </View>
      ))}

      {/* Success Message */}
      {completed && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.successContainer}>
          <Text style={styles.successText}>1 + 1 = 2! 🎉</Text>
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
    paddingVertical: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  equationText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6C9EFF',
  },
  basketContainer: {
    flex: 1,
    position: 'relative',
  },
  basket: {
    position: 'absolute',
    width: 200,
    height: 150,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#6C9EFF',
  },
  basketEmoji: {
    fontSize: 100,
  },
  resultContainer: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: '#10B981',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  appleCard: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  appleEmoji: {
    fontSize: 60,
  },
  successContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  successText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#10B981',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
