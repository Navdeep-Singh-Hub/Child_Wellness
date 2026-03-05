// Game 5: Graduate Challenge Mix
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ArrangeStoryGame from './ArrangeStoryGame';
import CompleteDialogueGame from './CompleteDialogueGame';
import WordProblemAdditionGame from './WordProblemAdditionGame';

interface GraduateChallengeGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 6; // 2 rounds of each type

type RoundType = 'story' | 'dialogue' | 'word-problem';

interface Round {
  type: RoundType;
  roundNum: number;
}

export default function GraduateChallengeGame({ onComplete, onBack }: GraduateChallengeGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  useEffect(() => {
    initializeRounds();
  }, []);

  const initializeRounds = () => {
    const newRounds: Round[] = [];
    
    // Add story rounds
    for (let i = 0; i < 2; i++) {
      newRounds.push({ type: 'story', roundNum: i });
    }
    
    // Add dialogue rounds
    for (let i = 0; i < 2; i++) {
      newRounds.push({ type: 'dialogue', roundNum: i });
    }
    
    // Add word problem rounds
    for (let i = 0; i < 2; i++) {
      newRounds.push({ type: 'word-problem', roundNum: i });
    }

    // Shuffle rounds
    const shuffled = newRounds.sort(() => Math.random() - 0.5);
    setRounds(shuffled);
    setCurrentRound(shuffled[0]);
  };

  const handleRoundComplete = (correct: boolean) => {
    if (correct) {
      setScore((s) => s + 1);
      setStreak((st) => {
        const newStreak = st + 1;
        if (newStreak > maxStreak) {
          setMaxStreak(newStreak);
        }
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    if (round + 1 >= TOTAL_ROUNDS) {
      const accuracy = (score / TOTAL_ROUNDS) * 100;
      onComplete({
        correct: score,
        total: TOTAL_ROUNDS,
        accuracy,
        gameId: 'graduate-challenge',
      });
    } else {
      setTimeout(() => {
        setRound((r) => r + 1);
        setCurrentRound(rounds[round + 1]);
      }, 1500);
    }
  };

  if (!currentRound) return null;

  // Render different game types
  if (currentRound.type === 'story') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#FEF3C7', '#FEF9E7']} style={StyleSheet.absoluteFill} />
        <ArrangeStoryGame
          onComplete={(stats) => handleRoundComplete(stats.accuracy >= 70)}
          onBack={onBack}
        />
      </SafeAreaView>
    );
  } else if (currentRound.type === 'dialogue') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#FEF3C7', '#FEF9E7']} style={StyleSheet.absoluteFill} />
        <CompleteDialogueGame
          onComplete={(stats) => handleRoundComplete(stats.accuracy >= 70)}
          onBack={onBack}
        />
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#FEF3C7', '#FEF9E7']} style={StyleSheet.absoluteFill} />
        <WordProblemAdditionGame
          onComplete={(stats) => handleRoundComplete(stats.accuracy >= 70)}
          onBack={onBack}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
