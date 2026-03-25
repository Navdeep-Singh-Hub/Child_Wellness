// Game 4: Match Number to Objects
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../utils/audio';
import { NUMBERS, OBJECT_GROUPS } from '../utils/gameData';

interface DraggableNumberState {
  id: string;
  number: number;
  x: number;
  y: number;
  isDragging: boolean;
  matchedGroupId: string | null;
}

interface ObjectGroupState {
  id: string;
  emoji: string;
  count: number;
  correctNumber: number;
  matchedNumber: number | null;
  x: number;
  y: number;
}

interface MatchNumberToObjectsGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

export default function MatchNumberToObjectsGame({ onComplete, onBack }: MatchNumberToObjectsGameProps) {
  const { width, height } = useWindowDimensions();
  const TARGET_AREA_X = width * 0.6;
  const TARGET_AREA_Y = height * 0.2;
  const TARGET_AREA_WIDTH = width * 0.35;
  const TARGET_AREA_HEIGHT = height * 0.6;

  const [numbers, setNumbers] = useState<DraggableNumberState[]>(
    NUMBERS.map((num, idx) => ({
      id: `num-${num.number}`,
      number: num.number,
      x: (idx % 3) * (width / 4) + width * 0.1,
      y: Math.floor(idx / 3) * 100 + height * 0.7,
      isDragging: false,
      matchedGroupId: null,
    }))
  );
  const [objectGroups, setObjectGroups] = useState<ObjectGroupState[]>(
    OBJECT_GROUPS.map((group, idx) => ({
      ...group,
      x: TARGET_AREA_X + 20,
      y: TARGET_AREA_Y + idx * 100 + 20,
      matchedNumber: null,
    }))
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const TOTAL_ROUNDS = 3;

  useEffect(() => {
    // Reset for new round
    setNumbers(
      NUMBERS.map((num, idx) => ({
        id: `num-${num.number}`,
        number: num.number,
        x: (idx % 3) * (width / 4) + width * 0.1,
        y: Math.floor(idx / 3) * 100 + height * 0.7,
        isDragging: false,
        matchedGroupId: null,
      }))
    );
    setObjectGroups(
      OBJECT_GROUPS.map((group, idx) => ({
        ...group,
        x: TARGET_AREA_X + 20,
        y: TARGET_AREA_Y + idx * 100 + 20,
        matchedNumber: null,
      }))
    );
    setDraggedId(null);
    speakInstruction('Drag the correct number to each object group.');
    return () => stopAllAudio();
  }, [round]);

  const isPointInGroup = (x: number, y: number, group: ObjectGroupState): boolean => {
    return x >= group.x - 30 && x <= group.x + 200 && y >= group.y - 30 && y <= group.y + 60;
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      const { locationX, locationY } = evt.nativeEvent;
      // Check if touch started on a number
      const number = numbers.find((n) => {
        const dist = Math.sqrt(Math.pow(locationX - n.x, 2) + Math.pow(locationY - n.y, 2));
        return dist < 60;
      });
      if (number && !number.matchedGroupId) {
        setDraggedId(number.id);
        setNumbers((prev) =>
          prev.map((n) => (n.id === number.id ? { ...n, isDragging: true } : n))
        );
        playSoundEffect('click');
        return true;
      }
      return false;
    },
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt) => {
      if (!draggedId) return;
      const { locationX, locationY } = evt.nativeEvent;
      setNumbers((prev) =>
        prev.map((n) => {
          if (n.id === draggedId) {
            return { ...n, x: locationX, y: locationY };
          }
          return n;
        })
      );
    },
    onPanResponderRelease: () => {
      if (!draggedId) return;
      const number = numbers.find((n) => n.id === draggedId);
      if (number) {
        // Check if dropped on a group
        const targetGroup = objectGroups.find((g) => isPointInGroup(number.x, number.y, g) && !g.matchedNumber);
        
        if (targetGroup) {
          const isCorrect = number.number === targetGroup.correctNumber;
          
          if (isCorrect) {
            setScore((prev) => prev + 1);
            playSoundEffect('correct');
            speakFeedback(`Correct! ${number.number} matches ${targetGroup.count} ${targetGroup.emoji}!`);
            
            setNumbers((prev) =>
              prev.map((n) =>
                n.id === draggedId ? { ...n, matchedGroupId: targetGroup.id, isDragging: false } : n
              )
            );
            setObjectGroups((prev) =>
              prev.map((g) =>
                g.id === targetGroup.id ? { ...g, matchedNumber: number.number } : g
              )
            );
            
            // Check if all groups matched
            const allMatched = objectGroups.every((g) => g.id === targetGroup.id || g.matchedNumber !== null);
            if (allMatched) {
              setTimeout(() => {
                if (round < TOTAL_ROUNDS - 1) {
                  setRound((prev) => prev + 1);
                } else {
                  const accuracy = (score / (OBJECT_GROUPS.length * TOTAL_ROUNDS)) * 100;
                  onComplete({
                    correct: score,
                    total: OBJECT_GROUPS.length * TOTAL_ROUNDS,
                    accuracy,
                    gameId: 'match-number-to-objects',
                  });
                }
              }, 2000);
            }
          } else {
            playSoundEffect('incorrect');
            speakFeedback(`Try again! Count the ${targetGroup.emoji} carefully.`);
            // Move number back
            const originalIndex = NUMBERS.findIndex((n) => n.number === number.number);
            setNumbers((prev) =>
              prev.map((n) =>
                n.id === draggedId
                  ? {
                      ...n,
                      x: (originalIndex % 3) * (width / 4) + width * 0.1,
                      y: Math.floor(originalIndex / 3) * 100 + height * 0.7,
                      isDragging: false,
                    }
                  : n
              )
            );
          }
        } else {
          // Not dropped on a group, move back
          const originalIndex = NUMBERS.findIndex((n) => n.number === number.number);
          setNumbers((prev) =>
            prev.map((n) =>
              n.id === draggedId
                ? {
                    ...n,
                    x: (originalIndex % 3) * (width / 4) + width * 0.1,
                    y: Math.floor(originalIndex / 3) * 100 + height * 0.7,
                    isDragging: false,
                  }
                : n
            )
          );
        }
      }
      setDraggedId(null);
    },
  });

  const handleNext = () => {
    if (round < TOTAL_ROUNDS - 1) {
      setRound((prev) => prev + 1);
    } else {
      const accuracy = (score / (OBJECT_GROUPS.length * TOTAL_ROUNDS)) * 100;
      onComplete({
        correct: score,
        total: OBJECT_GROUPS.length * TOTAL_ROUNDS,
        accuracy,
        gameId: 'match-number-to-objects',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Match Number to Objects</Text>
        <Text style={styles.roundText}>Round {round + 1}/{TOTAL_ROUNDS}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag the correct number to each group</Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        {/* Object Groups */}
        <View style={styles.groupsContainer}>
          {objectGroups.map((group) => (
            <View
              key={group.id}
              style={[
                styles.groupCard,
                {
                  left: group.x,
                  top: group.y,
                  backgroundColor: group.matchedNumber ? '#ECFDF5' : '#fff',
                  borderColor: group.matchedNumber === group.correctNumber ? '#10B981' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.groupObjects}>
                {Array.from({ length: group.count }).map((_, idx) => (
                  <Text key={idx} style={styles.groupEmoji}>
                    {group.emoji}
                  </Text>
                ))}
              </View>
              {group.matchedNumber && (
                <View style={styles.matchedNumber}>
                  <Text style={styles.matchedNumberText}>{group.matchedNumber}</Text>
                  {group.matchedNumber === group.correctNumber && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  )}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Numbers */}
        {numbers.map((number) => (
          <View
            key={number.id}
            style={[
              styles.numberCard,
              {
                left: number.x - 40,
                top: number.y - 40,
                opacity: number.matchedGroupId ? 0.5 : 1,
              },
            ]}
          >
            <Text style={styles.numberText}>{number.number}</Text>
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
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  groupsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  groupCard: {
    position: 'absolute',
    width: 180,
    padding: 16,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupObjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  groupEmoji: {
    fontSize: 32,
  },
  matchedNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchedNumberText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#10B981',
  },
  numberCard: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  numberText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },
  controls: {
    padding: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
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
