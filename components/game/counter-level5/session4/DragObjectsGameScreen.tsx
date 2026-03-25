// Game 4: Drag Objects Addition - Drag blocks into container (3+1)
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../counter/utils/audio';
import { ADDITION_3_PLUS_1 } from './gameData';

interface DragObjectsGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

interface BlockState {
  id: string;
  x: number;
  y: number;
  isDragging: boolean;
  inContainer: boolean;
}

export default function DragObjectsGameScreen({ onComplete, onBack }: DragObjectsGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const BLOCK_SIZE = 80;
  const CONTAINER_X = width / 2 - 100;
  const CONTAINER_Y = height * 0.5;
  const CONTAINER_WIDTH = 200;
  const CONTAINER_HEIGHT = 180;
  const BLOCK_START_Y = height * 0.2;

  const [blocks, setBlocks] = useState<BlockState[]>([
    { id: 'block-1', x: width * 0.15, y: BLOCK_START_Y, isDragging: false, inContainer: false },
    { id: 'block-2', x: width * 0.35, y: BLOCK_START_Y, isDragging: false, inContainer: false },
    { id: 'block-3', x: width * 0.55, y: BLOCK_START_Y, isDragging: false, inContainer: false },
    { id: 'block-4', x: width * 0.75, y: BLOCK_START_Y, isDragging: false, inContainer: false },
  ]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [blocksInContainer, setBlocksInContainer] = useState(0);

  useEffect(() => {
    speakInstruction('Drag the blocks into the container').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const isPointInContainer = (x: number, y: number): boolean => {
    return (
      x >= CONTAINER_X &&
      x <= CONTAINER_X + CONTAINER_WIDTH &&
      y >= CONTAINER_Y &&
      y <= CONTAINER_Y + CONTAINER_HEIGHT
    );
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const block = blocks.find((b) => {
        const dist = Math.sqrt(Math.pow(locationX - b.x, 2) + Math.pow(locationY - b.y, 2));
        return dist < 50 && !b.inContainer;
      });
      if (block && !completed) {
        setDraggedId(block.id);
        setBlocks((prev) =>
          prev.map((b) => (b.id === block.id ? { ...b, isDragging: true } : b))
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
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === draggedId ? { ...b, x: locationX, y: locationY } : b
        )
      );
    },
    onPanResponderRelease: async () => {
      if (!draggedId || completed) return;
      const draggedBlock = blocks.find((b) => b.id === draggedId);
      if (!draggedBlock) return;

      if (isPointInContainer(draggedBlock.x, draggedBlock.y)) {
        const blockIndex = blocks.findIndex((b) => b.id === draggedId);
        const positionInContainer = blocksInContainer;
        
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === draggedId
              ? {
                  ...b,
                  x: CONTAINER_X + CONTAINER_WIDTH / 2 - BLOCK_SIZE / 2 + (positionInContainer % 2) * 60 - 30,
                  y: CONTAINER_Y + CONTAINER_HEIGHT / 2 - BLOCK_SIZE / 2 + Math.floor(positionInContainer / 2) * 70 - 35,
                  isDragging: false,
                  inContainer: true,
                }
              : b
          )
        );
        
        setBlocksInContainer((prev) => {
          const newCount = prev + 1;
          if (newCount === 4) {
            setTimeout(() => {
              setCompleted(true);
              playSoundEffect('celebration');
              speakFeedback('Perfect! 3 plus 1 equals 4!');
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
        const originalPositions = [
          { x: width * 0.15, y: BLOCK_START_Y },
          { x: width * 0.35, y: BLOCK_START_Y },
          { x: width * 0.55, y: BLOCK_START_Y },
          { x: width * 0.75, y: BLOCK_START_Y },
        ];
        const blockIndex = blocks.findIndex((b) => b.id === draggedId);
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === draggedId
              ? {
                  ...b,
                  x: originalPositions[blockIndex].x,
                  y: originalPositions[blockIndex].y,
                  isDragging: false,
                }
              : b
          )
        );
        await playSoundEffect('incorrect');
        await speakFeedback('Try dragging to the container!');
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
        <Text style={styles.headerTitle}>Drag Objects</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag blocks into the container</Text>
        <Text style={styles.equationText}>3 + 1 = ?</Text>
      </View>

      {/* Container */}
      <View style={styles.containerArea} {...panResponder.panHandlers}>
        <View
          style={[
            styles.containerBox,
            {
              left: CONTAINER_X,
              top: CONTAINER_Y,
            },
          ]}
        >
          {blocksInContainer > 0 && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{blocksInContainer}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Blocks */}
      {blocks.map((block) => (
        <View
          key={block.id}
          style={[
            styles.blockCard,
            {
              left: block.x - BLOCK_SIZE / 2,
              top: block.y - BLOCK_SIZE / 2,
              opacity: block.inContainer ? 0.8 : 1,
            },
          ]}
        >
          <LinearGradient
            colors={block.inContainer ? ['#22C55E', '#16A34A'] : ['#6C9EFF', '#818CF8']}
            style={styles.blockGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.blockEmoji}>🧱</Text>
          </LinearGradient>
        </View>
      ))}

      {/* Success Message */}
      {completed && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.successContainer}>
          <Text style={styles.successText}>3 + 1 = 4! 🎉</Text>
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
  containerArea: {
    flex: 1,
    position: 'relative',
  },
  containerBox: {
    position: 'absolute',
    width: 200,
    height: 180,
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
  blockCard: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  blockGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockEmoji: {
    fontSize: 50,
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
