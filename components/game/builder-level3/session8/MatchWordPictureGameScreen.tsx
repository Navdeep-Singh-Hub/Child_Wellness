// Game 2: Match Word to Picture - Drag word to picture
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakInstruction, speakFeedback, stopAllAudio } from '../../builder/utils/audio';
import { CVC_WORDS } from './gameData';

interface MatchWordPictureGameScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

interface WordState {
  id: string;
  word: string;
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

export default function MatchWordPictureGameScreen({ onComplete, onBack }: MatchWordPictureGameScreenProps) {
  const { width, height } = useWindowDimensions();
  const PICTURE_SIZE = 120;
  const WORD_SIZE = 100;
  const PICTURE_Y = height * 0.3;
  const WORD_Y = height * 0.65;
  const PICTURE_SPACING = (width - 40 - PICTURE_SIZE * 2) / 3;
  const WORD_SPACING = (width - 40 - WORD_SIZE * 2) / 3;

  const [pictures] = useState<PictureState[]>(
    CVC_WORDS.slice(0, 4).map((word, idx) => ({
      id: `picture-${word.word}`,
      word: word.word,
      emoji: word.emoji,
      x: 20 + idx * (PICTURE_SIZE + PICTURE_SPACING),
      y: PICTURE_Y,
      matched: false,
    }))
  );

  const [words, setWords] = useState<WordState[]>(
    CVC_WORDS.slice(0, 4).map((word, idx) => ({
      id: `word-${word.word}`,
      word: word.word,
      x: 20 + idx * (WORD_SIZE + WORD_SPACING),
      y: WORD_Y,
      isDragging: false,
      matchedPictureId: null,
    }))
  );

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [matchedCount, setMatchedCount] = useState(0);

  useEffect(() => {
    speakInstruction('Drag each word to its matching picture.').catch(() => {});
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

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const word = words.find((w) => {
        const dist = Math.sqrt(Math.pow(locationX - w.x, 2) + Math.pow(locationY - w.y, 2));
        return dist < 60 && !w.matchedPictureId;
      });
      if (word && !completed) {
        setDraggedId(word.id);
        setWords((prev) =>
          prev.map((w) => (w.id === word.id ? { ...w, isDragging: true } : w))
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
      setWords((prev) =>
        prev.map((w) =>
          w.id === draggedId ? { ...w, x: locationX, y: locationY } : w
        )
      );
    },
    onPanResponderRelease: async () => {
      if (!draggedId || completed) return;
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
          setWords((prev) =>
            prev.map((w) =>
              w.id === draggedId
                ? {
                    ...w,
                    x: picture.x + PICTURE_SIZE / 2 - WORD_SIZE / 2,
                    y: picture.y + PICTURE_SIZE + 10,
                    isDragging: false,
                    matchedPictureId: picture.id,
                  }
                : w
            )
          );
          await playSoundEffect('correct');
          await speakFeedback('Perfect match!');
          
          setMatchedCount((prev) => {
            const newCount = prev + 1;
            if (newCount >= pictures.length) {
              setTimeout(() => {
                setCompleted(true);
                playSoundEffect('celebration');
                speakFeedback('Excellent! All words matched!');
                setTimeout(() => {
                  onComplete();
                }, 2000);
              }, 1000);
            }
            return newCount;
          });
          break;
        }
      }

      if (!matched) {
        const originalIndex = words.findIndex((w) => w.id === draggedId);
        const originalX = 20 + originalIndex * (WORD_SIZE + WORD_SPACING);
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
        <Text style={styles.headerTitle}>Match Word to Picture</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Drag words to matching pictures</Text>
      </View>

      {/* Pictures */}
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
  },
  picturesContainer: {
    flex: 1,
    position: 'relative',
  },
  pictureBox: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 20,
    borderWidth: 4,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pictureEmoji: {
    fontSize: 64,
  },
  matchedWord: {
    position: 'absolute',
    bottom: -30,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchedWordText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  wordCard: {
    position: 'absolute',
    width: 100,
    height: 100,
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
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
