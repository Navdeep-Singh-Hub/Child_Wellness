// Game 4: Mixed Puzzle - Word + Shape combination
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../builder/utils/audio';
import { CHALLENGE_WORDS, SHAPE_OBJECTS, SHAPES } from './gameData';

interface MixedPuzzleGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

interface WordState {
  id: string;
  word: string;
  emoji: string;
  x: number;
  y: number;
  isDragging: boolean;
  matchedPictureId: string | null;
}

interface PictureState {
  id: string;
  word: string;
  emoji: string;
  x: number;
  y: number;
  matched: boolean;
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
}

export default function MixedPuzzleGameScreen({ onComplete, onBack }: MixedPuzzleGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const PICTURE_Y = height * 0.25;
  const WORD_Y = height * 0.45;
  const OBJECT_Y = height * 0.65;
  const CATEGORY_Y = height * 0.85;
  const PICTURE_SIZE = 100;
  const WORD_SIZE = 80;
  const OBJECT_SIZE = 80;
  const CATEGORY_WIDTH = (width - 60) / 3;

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [wordTaskCompleted, setWordTaskCompleted] = useState(false);
  const [shapeTaskCompleted, setShapeTaskCompleted] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Word task
  const [pictures] = useState<PictureState[]>(
    CHALLENGE_WORDS.slice(0, 3).map((word, idx) => ({
      id: `picture-${word.word}`,
      word: word.word,
      emoji: word.emoji,
      x: 20 + idx * (PICTURE_SIZE + 40),
      y: PICTURE_Y,
      matched: false,
    }))
  );

  const [words, setWords] = useState<WordState[]>(
    CHALLENGE_WORDS.slice(0, 3).map((word, idx) => ({
      id: `word-${word.word}`,
      word: word.word,
      emoji: word.emoji,
      x: 20 + idx * (WORD_SIZE + 40),
      y: WORD_Y,
      isDragging: false,
      matchedPictureId: null,
    }))
  );

  // Shape task
  const [categories] = useState<CategoryState[]>(
    SHAPES.map((shape, idx) => ({
      id: shape.id,
      name: shape.name,
      emoji: shape.emoji,
      color: shape.color,
      x: 20 + idx * (CATEGORY_WIDTH + 10),
      y: CATEGORY_Y,
    }))
  );

  const [objects, setObjects] = useState<ObjectState[]>(
    SHAPE_OBJECTS.slice(0, 3).map((obj, idx) => ({
      id: obj.id,
      name: obj.name,
      emoji: obj.emoji,
      shape: obj.shape,
      x: 20 + idx * (OBJECT_SIZE + 40),
      y: OBJECT_Y,
      isDragging: false,
      matchedCategoryId: null,
    }))
  );

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<'word' | 'object' | null>(null);

  useEffect(() => {
    speakInstruction('Drag words to pictures and objects to shape boxes.').catch(() => {});
    return () => stopAllAudio();
  }, []);

  const isPointInPicture = (x: number, y: number, picture: PictureState): boolean => {
    return (
      x >= picture.x &&
      x <= picture.x + PICTURE_SIZE &&
      y >= picture.y &&
      y <= picture.y + PICTURE_SIZE
    );
  };

  const isPointInCategory = (x: number, y: number, category: CategoryState): boolean => {
    return (
      x >= category.x &&
      x <= category.x + CATEGORY_WIDTH &&
      y >= category.y &&
      y <= category.y + 60
    );
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      
      // Check for word
      const word = words.find((w) => {
        const dist = Math.sqrt(Math.pow(locationX - w.x, 2) + Math.pow(locationY - w.y, 2));
        return dist < 50 && !w.matchedPictureId;
      });
      if (word) {
        setDraggedId(word.id);
        setDraggedType('word');
        setWords((prev) =>
          prev.map((w) => (w.id === word.id ? { ...w, isDragging: true } : w))
        );
        playSoundEffect('click');
        return true;
      }

      // Check for object
      const obj = objects.find((o) => {
        const dist = Math.sqrt(Math.pow(locationX - o.x, 2) + Math.pow(locationY - o.y, 2));
        return dist < 50 && !o.matchedCategoryId;
      });
      if (obj) {
        setDraggedId(obj.id);
        setDraggedType('object');
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
      
      if (draggedType === 'word') {
        setWords((prev) =>
          prev.map((w) =>
            w.id === draggedId ? { ...w, x: locationX, y: locationY } : w
          )
        );
      } else if (draggedType === 'object') {
        setObjects((prev) =>
          prev.map((o) =>
            o.id === draggedId ? { ...o, x: locationX, y: locationY } : o
          )
        );
      }
    },
    onPanResponderRelease: async () => {
      if (!draggedId || completed) return;

      if (draggedType === 'word') {
        const draggedWord = words.find((w) => w.id === draggedId);
        if (!draggedWord) return;

        let matched = false;
        for (const picture of pictures) {
          if (
            isPointInPicture(draggedWord.x, draggedWord.y, picture) &&
            draggedWord.word === picture.word &&
            !picture.matched
          ) {
            matched = true;
            setWords((prev) => {
              const updated = prev.map((w) =>
                w.id === draggedId
                  ? {
                      ...w,
                      x: picture.x + PICTURE_SIZE / 2 - WORD_SIZE / 2,
                      y: picture.y + PICTURE_SIZE + 10,
                      isDragging: false,
                      matchedPictureId: picture.id,
                    }
                  : w
              );
              const allMatched = updated.every((w) => w.matchedPictureId);
              if (allMatched) {
                setWordTaskCompleted(true);
              }
              return updated;
            });
            await playSoundEffect('correct');
            await speakFeedback('Perfect match!');
            break;
          }
        }

        if (!matched) {
          const originalIndex = words.findIndex((w) => w.id === draggedId);
          const originalX = 20 + originalIndex * (WORD_SIZE + 40);
          setWords((prev) =>
            prev.map((w) =>
              w.id === draggedId
                ? {
                    ...w,
                    x: originalX,
                    y: WORD_Y,
                    isDragging: false,
                  }
                : w
            )
          );
          await playSoundEffect('incorrect');
          await speakFeedback('Try again!');
        }
      } else if (draggedType === 'object') {
        const draggedObject = objects.find((o) => o.id === draggedId);
        if (!draggedObject) return;

        let matched = false;
        for (const category of categories) {
          if (
            isPointInCategory(draggedObject.x, draggedObject.y, category) &&
            draggedObject.shape === category.id
          ) {
            matched = true;
            setObjects((prev) => {
              const updated = prev.map((o) =>
                o.id === draggedId
                  ? {
                      ...o,
                      x: category.x + CATEGORY_WIDTH / 2 - OBJECT_SIZE / 2,
                      y: category.y + 20,
                      isDragging: false,
                      matchedCategoryId: category.id,
                    }
                  : o
              );
              const allMatched = updated.every((o) => o.matchedCategoryId);
              if (allMatched) {
                setShapeTaskCompleted(true);
              }
              return updated;
            });
            await playSoundEffect('correct');
            await speakFeedback('Perfect!');
            break;
          }
        }

        if (!matched) {
          const originalIndex = objects.findIndex((o) => o.id === draggedId);
          const originalX = 20 + originalIndex * (OBJECT_SIZE + 40);
          setObjects((prev) =>
            prev.map((o) =>
              o.id === draggedId
                ? {
                    ...o,
                    x: originalX,
                    y: OBJECT_Y,
                    isDragging: false,
                  }
                : o
            )
          );
          await playSoundEffect('incorrect');
          await speakFeedback('Try again!');
        }
      }

      setDraggedId(null);
      setDraggedType(null);
    },
  });

  useEffect(() => {
    if (wordTaskCompleted && shapeTaskCompleted && !completed) {
      setTimeout(() => {
        setCompleted(true);
        playSoundEffect('celebration');
        speakFeedback('Excellent! You completed the mixed puzzle!');
        setTimeout(() => {
          onComplete();
        }, 2000);
      }, 1000);
    }
  }, [wordTaskCompleted, shapeTaskCompleted, completed]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Mixed Puzzle</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Match words to pictures AND sort objects by shape</Text>
      </View>

      {/* Word Task Section */}
      <View style={styles.taskSection}>
        <Text style={styles.taskLabel}>Task 1: Match Words to Pictures</Text>
        <View style={styles.picturesContainer} {...panResponder.panHandlers}>
          {pictures.map((picture) => {
            const matchedWord = words.find((w) => w.matchedPictureId === picture.id);
            return (
              <View
                key={picture.id}
                style={[
                  styles.pictureBox,
                  {
                    left: picture.x,
                    top: picture.y,
                    backgroundColor: matchedWord ? '#ECFDF5' : '#F8FAFC',
                    borderColor: matchedWord ? '#10B981' : '#E2E8F0',
                  },
                ]}
              >
                <Text style={styles.pictureEmoji}>{picture.emoji}</Text>
                {matchedWord && (
                  <View style={styles.matchedWord}>
                    <Text style={styles.matchedWordText}>{matchedWord.word}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Words */}
        {words.map((word) => (
          <View
            key={word.id}
            style={[
              styles.wordCard,
              {
                left: word.x - WORD_SIZE / 2,
                top: word.y - WORD_SIZE / 2,
                opacity: word.matchedPictureId ? 0.7 : 1,
              },
            ]}
          >
            <LinearGradient
              colors={word.matchedPictureId ? ['#10B981', '#16A34A'] : ['#6C9EFF', '#818CF8']}
              style={styles.wordCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.wordText}>{word.word}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>

      {/* Shape Task Section */}
      <View style={styles.taskSection}>
        <Text style={styles.taskLabel}>Task 2: Sort Objects by Shape</Text>
        <View style={styles.categoriesContainer}>
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
                        top: 60 + idx * 40,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  taskSection: {
    flex: 1,
    position: 'relative',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  taskLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  picturesContainer: {
    position: 'relative',
    height: 120,
  },
  pictureBox: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 4,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pictureEmoji: {
    fontSize: 48,
  },
  matchedWord: {
    position: 'absolute',
    bottom: -25,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchedWordText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  wordCard: {
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
  wordCardGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  categoriesContainer: {
    position: 'relative',
    height: 80,
  },
  categoryBox: {
    position: 'absolute',
    width: 100,
    minHeight: 60,
    borderRadius: 16,
    borderWidth: 3,
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  matchedObject: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchedObjectEmoji: {
    fontSize: 20,
  },
  objectCard: {
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
  objectCardGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  objectEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  objectName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
});
