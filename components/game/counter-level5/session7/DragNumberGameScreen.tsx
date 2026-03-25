// Game 4: Drag Numbers - Drag number to answer box (4+2=?)
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../counter/utils/audio';
import { ADDITION_4_PLUS_2, NUMBER_OPTIONS_SESSION7 } from './gameData';

interface DragNumberGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

interface NumberTileState {
  id: string;
  number: number;
  x: number;
  y: number;
  isDragging: boolean;
  inAnswerBox: boolean;
}

export default function DragNumberGameScreen({ onComplete, onBack }: DragNumberGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const TILE_SIZE = 100;
  const ANSWER_BOX_X = width / 2 - 80;
  const ANSWER_BOX_Y = height * 0.5;
  const ANSWER_BOX_WIDTH = 160;
  const ANSWER_BOX_HEIGHT = 120;
  const TILE_START_Y = height * 0.25;

  const [tiles, setTiles] = useState<NumberTileState[]>(
    NUMBER_OPTIONS_SESSION7.map((num, index) => ({
      id: `tile-${num}`,
      number: num,
      x: width * 0.2 + (index * (width * 0.6) / NUMBER_OPTIONS_SESSION7.length),
      y: TILE_START_Y,
      isDragging: false,
      inAnswerBox: false,
    }))
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    speakInstruction('Drag the correct number to the answer box').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const isPointInAnswerBox = (x: number, y: number): boolean => {
    return (
      x >= ANSWER_BOX_X &&
      x <= ANSWER_BOX_X + ANSWER_BOX_WIDTH &&
      y >= ANSWER_BOX_Y &&
      y <= ANSWER_BOX_Y + ANSWER_BOX_HEIGHT
    );
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const tile = tiles.find((t) => {
        const dist = Math.sqrt(Math.pow(locationX - t.x, 2) + Math.pow(locationY - t.y, 2));
        return dist < 60 && !t.inAnswerBox;
      });
      if (tile && !completed) {
        setDraggedId(tile.id);
        setTiles((prev) =>
          prev.map((t) => (t.id === tile.id ? { ...t, isDragging: true } : t))
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
      setTiles((prev) =>
        prev.map((t) =>
          t.id === draggedId ? { ...t, x: locationX, y: locationY } : t
        )
      );
    },
    onPanResponderRelease: async () => {
      if (!draggedId || completed) return;
      const draggedTile = tiles.find((t) => t.id === draggedId);
      if (!draggedTile) return;

      if (isPointInAnswerBox(draggedTile.x, draggedTile.y)) {
        const isCorrect = draggedTile.number === ADDITION_4_PLUS_2.answer;
        
        setTiles((prev) =>
          prev.map((t) =>
            t.id === draggedId
              ? {
                  ...t,
                  x: ANSWER_BOX_X + ANSWER_BOX_WIDTH / 2 - TILE_SIZE / 2,
                  y: ANSWER_BOX_Y + ANSWER_BOX_HEIGHT / 2 - TILE_SIZE / 2,
                  isDragging: false,
                  inAnswerBox: true,
                }
              : t
          )
        );

        if (isCorrect) {
          await playSoundEffect('correct');
          await speakFeedback('Perfect! 4 plus 2 equals 6!');
          
          setTimeout(() => {
            setCompleted(true);
            setTimeout(() => {
              onComplete();
            }, 2000);
          }, 1000);
        } else {
          await playSoundEffect('incorrect');
          await speakFeedback('Try again!');
          
          const originalIndex = NUMBER_OPTIONS_SESSION7.indexOf(draggedTile.number);
          const originalX = width * 0.2 + (originalIndex * (width * 0.6) / NUMBER_OPTIONS_SESSION7.length);
          setTiles((prev) =>
            prev.map((t) =>
              t.id === draggedId
                ? {
                    ...t,
                    x: originalX,
                    y: TILE_START_Y,
                    isDragging: false,
                    inAnswerBox: false,
                  }
                : t
            )
          );
        }
      } else {
        const originalIndex = NUMBER_OPTIONS_SESSION7.indexOf(draggedTile.number);
        const originalX = width * 0.2 + (originalIndex * (width * 0.6) / NUMBER_OPTIONS_SESSION7.length);
        setTiles((prev) =>
          prev.map((t) =>
            t.id === draggedId
              ? {
                  ...t,
                  x: originalX,
                  y: TILE_START_Y,
                  isDragging: false,
                }
              : t
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
        <Text style={styles.headerTitle}>Drag Numbers</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Equation Display */}
      <View style={styles.equationContainer}>
        <Text style={styles.equationText}>4 + 2 = ?</Text>
      </View>

      {/* Answer Box */}
      <View style={styles.answerBoxContainer} {...panResponder.panHandlers}>
        <View
          style={[
            styles.answerBox,
            {
              left: ANSWER_BOX_X,
              top: ANSWER_BOX_Y,
            },
          ]}
        >
          <Text style={styles.answerBoxLabel}>Answer</Text>
          {tiles.find((t) => t.inAnswerBox) && (
            <Text style={styles.answerText}>
              {tiles.find((t) => t.inAnswerBox)?.number}
            </Text>
          )}
        </View>
      </View>

      {/* Number Tiles */}
      {tiles.map((tile) => (
        <View
          key={tile.id}
          style={[
            styles.tileCard,
            {
              left: tile.x - TILE_SIZE / 2,
              top: tile.y - TILE_SIZE / 2,
              opacity: tile.inAnswerBox ? 0.8 : 1,
            },
          ]}
        >
          <LinearGradient
            colors={tile.inAnswerBox ? ['#22C55E', '#16A34A'] : ['#6C9EFF', '#818CF8']}
            style={styles.tileGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.tileText}>{tile.number}</Text>
          </LinearGradient>
        </View>
      ))}

      {/* Success Message */}
      {completed && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.successContainer}>
          <Text style={styles.successText}>Perfect! 4 + 2 = 6! 🎉</Text>
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
  equationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  equationText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#6C9EFF',
  },
  answerBoxContainer: {
    flex: 1,
    position: 'relative',
  },
  answerBox: {
    position: 'absolute',
    width: 160,
    height: 120,
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
    borderStyle: 'dashed',
  },
  answerBoxLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  answerText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#6C9EFF',
  },
  tileCard: {
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
  tileGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
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
