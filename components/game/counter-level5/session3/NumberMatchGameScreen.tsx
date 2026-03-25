// Game 4: Number Match - Drag number to match objects
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../counter/utils/audio';
import { NUMBER_OPTIONS_SESSION3 } from './gameData';

interface NumberMatchGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

interface NumberTileState {
  id: string;
  number: number;
  x: number;
  y: number;
  isDragging: boolean;
  matched: boolean;
}

const CORRECT_ANSWER = 4;
const STAR_COUNT = 4;

export default function NumberMatchGameScreen({ onComplete, onBack }: NumberMatchGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const TILE_SIZE = 100;
  const MATCH_BOX_X = width / 2 - 100;
  const MATCH_BOX_Y = height * 0.4;
  const MATCH_BOX_WIDTH = 200;
  const MATCH_BOX_HEIGHT = 150;
  const TILE_START_Y = height * 0.7;

  const [tiles, setTiles] = useState<NumberTileState[]>(
    NUMBER_OPTIONS_SESSION3.map((num, index) => ({
      id: `tile-${num}`,
      number: num,
      x: width * 0.15 + (index * (width * 0.7) / NUMBER_OPTIONS_SESSION3.length),
      y: TILE_START_Y,
      isDragging: false,
      matched: false,
    }))
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    speakInstruction('Drag the correct number to match the objects').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const isPointInMatchBox = (x: number, y: number): boolean => {
    return (
      x >= MATCH_BOX_X &&
      x <= MATCH_BOX_X + MATCH_BOX_WIDTH &&
      y >= MATCH_BOX_Y &&
      y <= MATCH_BOX_Y + MATCH_BOX_HEIGHT
    );
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const tile = tiles.find((t) => {
        const dist = Math.sqrt(Math.pow(locationX - t.x, 2) + Math.pow(locationY - t.y, 2));
        return dist < 60 && !t.matched;
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

      if (isPointInMatchBox(draggedTile.x, draggedTile.y)) {
        const isCorrect = draggedTile.number === CORRECT_ANSWER;
        
        setTiles((prev) =>
          prev.map((t) =>
            t.id === draggedId
              ? {
                  ...t,
                  x: MATCH_BOX_X + MATCH_BOX_WIDTH / 2 - TILE_SIZE / 2,
                  y: MATCH_BOX_Y + MATCH_BOX_HEIGHT / 2 - TILE_SIZE / 2,
                  isDragging: false,
                  matched: true,
                }
              : t
          )
        );

        if (isCorrect) {
          await playSoundEffect('correct');
          await speakFeedback('Perfect! Four stars match the number 4!');
          
          setTimeout(() => {
            setCompleted(true);
            setTimeout(() => {
              onComplete();
            }, 2000);
          }, 1000);
        } else {
          await playSoundEffect('incorrect');
          await speakFeedback('Try again! Count the stars carefully.');
          
          const originalIndex = NUMBER_OPTIONS_SESSION3.indexOf(draggedTile.number);
          const originalX = width * 0.15 + (originalIndex * (width * 0.7) / NUMBER_OPTIONS_SESSION3.length);
          setTiles((prev) =>
            prev.map((t) =>
              t.id === draggedId
                ? {
                    ...t,
                    x: originalX,
                    y: TILE_START_Y,
                    isDragging: false,
                    matched: false,
                  }
                : t
            )
          );
        }
      } else {
        const originalIndex = NUMBER_OPTIONS_SESSION3.indexOf(draggedTile.number);
        const originalX = width * 0.15 + (originalIndex * (width * 0.7) / NUMBER_OPTIONS_SESSION3.length);
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
        <Text style={styles.headerTitle}>Match Numbers</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag the correct number to match the objects</Text>
      </View>

      {/* Objects Display */}
      <View style={styles.objectsContainer} {...panResponder.panHandlers}>
        <View
          style={[
            styles.matchBox,
            {
              left: MATCH_BOX_X,
              top: MATCH_BOX_Y,
            },
          ]}
        >
          <Text style={styles.objectsLabel}>Objects:</Text>
          <View style={styles.starsContainer}>
            {Array.from({ length: STAR_COUNT }).map((_, index) => (
              <Text key={index} style={styles.starEmoji}>⭐</Text>
            ))}
          </View>
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
              opacity: tile.matched ? 0.8 : 1,
            },
          ]}
        >
          <LinearGradient
            colors={tile.matched ? ['#22C55E', '#16A34A'] : ['#6C9EFF', '#818CF8']}
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
          <Text style={styles.successText}>Perfect Match! 🎉</Text>
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
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  objectsContainer: {
    flex: 1,
    position: 'relative',
  },
  matchBox: {
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
  objectsLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  starEmoji: {
    fontSize: 40,
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
