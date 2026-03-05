// Game 5: Mixed Thinking Challenge
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import ReadAnswerGame from './ReadAnswerGame';
import ReadClockGame from './ReadClockGame';
import WhichIsBiggerGame from './WhichIsBiggerGame';

interface MixedThinkingGameProps {
  onComplete: (stats: { correct: number; total: number; accuracy: number; gameId: string }) => void;
  onBack: () => void;
}

const TOTAL_ROUNDS = 6; // 2 rounds of each type

type RoundType = 'reading' | 'clock' | 'measurement';

interface Round {
  type: RoundType;
  roundNum: number;
}

export default function MixedThinkingGame({ onComplete, onBack }: MixedThinkingGameProps) {
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
    
    // Add reading rounds
    for (let i = 0; i < 2; i++) {
      newRounds.push({ type: 'reading', roundNum: i });
    }
    
    // Add clock rounds
    for (let i = 0; i < 2; i++) {
      newRounds.push({ type: 'clock', roundNum: i });
    }
    
    // Add measurement rounds
    for (let i = 0; i < 2; i++) {
      newRounds.push({ type: 'measurement', roundNum: i });
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
        gameId: 'mixed-thinking',
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
  if (currentRound.type === 'reading') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#FEF3C7', '#FEF9E7']} style={StyleSheet.absoluteFill} />
        <ReadAnswerGame
          onComplete={(stats) => handleRoundComplete(stats.accuracy >= 70)}
          onBack={onBack}
        />
      </SafeAreaView>
    );
  } else if (currentRound.type === 'clock') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#FEF3C7', '#FEF9E7']} style={StyleSheet.absoluteFill} />
        <ReadClockGame
          onComplete={(stats) => handleRoundComplete(stats.accuracy >= 70)}
          onBack={onBack}
        />
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#FEF3C7', '#FEF9E7']} style={StyleSheet.absoluteFill} />
        <WhichIsBiggerGame
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
