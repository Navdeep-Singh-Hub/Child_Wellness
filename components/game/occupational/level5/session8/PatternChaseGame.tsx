import { TrackOrb } from '@/components/game/occupational/level5/session8/MultiTrackVisuals';
import { MultiTrackShell, useMultiTrackExit } from '@/components/game/occupational/level5/session8/MultiTrackShell';
import { getMultiTrackTheme } from '@/components/game/occupational/level5/session8/multiTrackThemes';
import { SESSION5_8_PACING as P } from '@/components/game/occupational/level5/session8/session8Pacing';
import { RoundCountdownOverlay } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';

const LOG_TYPE = 'pattern-chase';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OBJECT_SIZE = 52;
const TOLERANCE = 50;

const PATTERNS = [
  ['🔴', '🔵', '🟢', '🟡'],
  ['⭐', '💎', '🎈', '🎁'],
  ['🔴', '🔴', '🔵', '🔵'],
  ['🟢', '🟡', '🟢', '🟡'],
];

interface PatternObject {
  id: string;
  x: number;
  y: number;
  emoji: string;
  index: number;
  scale: number;
  isCorrect: boolean;
}

const PatternChaseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const { theme, copy } = getMultiTrackTheme(LOG_TYPE);
  const handleExit = useMultiTrackExit(onBack);

  const [showInfo, setShowInfo] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);

  const [pattern, setPattern] = useState<string[]>([]);
  const [objects, setObjects] = useState<PatternObject[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPattern, setShowPattern] = useState(true);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const patternTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endGameRef = useRef<((s: number) => Promise<void>) | null>(null);

  const clearPatternTimer = useCallback(() => {
    if (patternTimerRef.current) {
      clearTimeout(patternTimerRef.current);
      patternTimerRef.current = null;
    }
  }, []);

  const endGame = useCallback(
    async (finalScore: number) => {
      clearPatternTimer();
      const total = P.patternRounds;
      const xp = finalScore * P.patternXp;
      setFinalStats({ correct: finalScore, total, xp });
      setDone(true);
      setShowCongrats(true);
      setPhase('idle');

      try {
        await logGameAndAward({
          type: LOG_TYPE,
          correct: finalScore,
          total,
          accuracy: (finalScore / total) * 100,
          xpAwarded: xp,
          skillTags: ['visual-memory', 'pattern-recognition', 'sequence-following'],
        });
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (error) {
        console.error('Failed to log game:', error);
      }
    },
    [clearPatternTimer, router],
  );

  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  const generateRound = useCallback(() => {
    clearPatternTimer();
    const selectedPattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)]!;
    setPattern(selectedPattern);
    setCurrentIndex(0);
    setShowPattern(true);

    let patternStep = 0;
    const showPatternStep = () => {
      if (patternStep < selectedPattern.length) {
        const newObjects: PatternObject[] = [];
        for (let i = 0; i <= patternStep; i++) {
          newObjects.push({
            id: `pattern-${i}`,
            x: (screenWidth.current / (selectedPattern.length + 1)) * (i + 1),
            y: screenHeight.current * 0.32,
            emoji: selectedPattern[i]!,
            index: i,
            scale: 1,
            isCorrect: true,
          });
        }
        setObjects(newObjects);
        patternStep++;
        patternTimerRef.current = setTimeout(showPatternStep, 800);
      } else {
        patternTimerRef.current = setTimeout(() => {
          setShowPattern(false);
          const choiceObjects: PatternObject[] = [];
          const allEmojis = [...new Set(PATTERNS.flat())];

          for (let i = 0; i < selectedPattern.length; i++) {
            const correctEmoji = selectedPattern[i]!;
            const wrongEmoji = allEmojis.filter((e) => e !== correctEmoji)[Math.floor(Math.random() * (allEmojis.length - 1))]!;
            choiceObjects.push({
              id: `choice-${i}-correct`,
              x: (screenWidth.current / (selectedPattern.length + 1)) * (i + 1) - 30,
              y: screenHeight.current * 0.58,
              emoji: correctEmoji,
              index: i,
              scale: 1,
              isCorrect: true,
            });
            choiceObjects.push({
              id: `choice-${i}-wrong`,
              x: (screenWidth.current / (selectedPattern.length + 1)) * (i + 1) + 30,
              y: screenHeight.current * 0.58,
              emoji: wrongEmoji,
              index: i,
              scale: 1,
              isCorrect: false,
            });
          }
          setObjects(choiceObjects);
          setCurrentIndex(0);
          speakTTS('Follow the pattern!', 0.8, 'en-US');
        }, 1000);
      }
    };
    showPatternStep();
  }, [clearPatternTimer]);

  const handleTap = useCallback(
    (event: { nativeEvent: { locationX: number; locationY: number } }) => {
      if (done || phase !== 'playing' || showPattern || objects.length === 0 || pattern.length === 0) return;
      const tapX = event.nativeEvent.locationX;
      const tapY = event.nativeEvent.locationY;

      for (const obj of objects) {
        if (Math.hypot(tapX - obj.x, tapY - obj.y) > TOLERANCE + OBJECT_SIZE / 2) continue;

        const isCorrect = obj.isCorrect && obj.emoji === pattern[currentIndex];

        if (isCorrect) {
          setObjects((prev) => prev.map((o) => (o.id === obj.id ? { ...o, scale: 1.4 } : o)));
          setTimeout(() => setObjects((prev) => prev.map((o) => ({ ...o, scale: 1 }))), 200);

          if (currentIndex < pattern.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            speakTTS('Next!', 0.9, 'en-US');
          } else {
            setScore((s) => {
              const newScore = s + 1;
              if (newScore >= P.patternRounds) {
                setTimeout(() => endGameRef.current?.(newScore), 900);
              } else {
                setTimeout(() => setRound((r) => r + 1), 1200);
              }
              return newScore;
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            speakTTS('Pattern complete!', 0.9, 'en-US');
          }
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          speakTTS('Follow the pattern!', 0.8, 'en-US');
        }
        return;
      }
    },
    [currentIndex, done, objects, pattern, phase, showPattern],
  );

  useEffect(() => {
    if (!showInfo && !done && phase === 'playing') {
      stopTTS();
      generateRound();
      setTimeout(() => speakTTS('Watch the pattern!', 0.8, 'en-US'), 350);
    }
  }, [showInfo, round, done, phase, generateRound]);

  useEffect(() => () => {
    try { stopTTS(); } catch { /* ignore */ }
    cleanupSounds();
    clearPatternTimer();
  }, [clearPatternTimer]);

  const hint = showPattern
    ? 'Watch the sequence…'
    : `Step ${currentIndex + 1} of ${pattern.length}`;

  return (
    <MultiTrackShell
      theme={theme}
      copy={copy}
      showInfo={showInfo}
      showCongrats={showCongrats}
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={P.patternRounds}
      score={score}
      hint={hint}
      showHint={phase === 'playing'}
      onStart={() => { setShowInfo(false); setPhase('countdown'); }}
      onExit={() => { clearPatternTimer(); handleExit(); }}
      onContinue={onComplete}
      onBack={onBack}
    >
      <Pressable
        style={styles.gameArea}
        onLayout={(e) => {
          screenWidth.current = e.nativeEvent.layout.width;
          screenHeight.current = e.nativeEvent.layout.height;
        }}
        onPress={handleTap}
      >
        {phase === 'playing' &&
          objects.map((obj) => (
            <View
              key={obj.id}
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: obj.x - OBJECT_SIZE / 2,
                top: obj.y - OBJECT_SIZE / 2,
                zIndex: 10,
                opacity: showPattern ? 1 : obj.index < currentIndex ? 0.45 : obj.index === currentIndex ? 1 : 0.55,
              }}
            >
              <TrackOrb size={OBJECT_SIZE} color="#FFFFFF" emoji={obj.emoji} scale={obj.scale} pulse={showPattern && obj.id.startsWith('pattern')} />
            </View>
          ))}
        {phase === 'countdown' && <RoundCountdownOverlay accent={theme.accent} onDone={() => setPhase('playing')} />}
      </Pressable>
    </MultiTrackShell>
  );
};

const styles = StyleSheet.create({ gameArea: { flex: 1, position: 'relative' } });

export default PatternChaseGame;
