import { RoundCountdownOverlay } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { ReactionShell, useReactionExit } from '@/components/game/occupational/level5/session9/ReactionShell';
import { SESSION5_9_PACING } from '@/components/game/occupational/level5/session9/session9Pacing';
import { ChoiceTile, TimerBar } from '@/components/game/occupational/level5/session9/VisualReactionVisuals';
import { QUICK_CHOICE_COPY, QUICK_CHOICE_THEME } from '@/components/game/occupational/level5/session9/visualReactionThemes';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const TOTAL_ROUNDS = SESSION5_9_PACING.standardRounds;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OPTION_SIZE = 100;
const TOLERANCE = 60;
const TIME_LIMIT = 2000;

const OPTIONS = [
  { emoji: '🍎', name: 'Apple' },
  { emoji: '🍌', name: 'Banana' },
  { emoji: '🍊', name: 'Orange' },
  { emoji: '🍇', name: 'Grape' },
  { emoji: '🍓', name: 'Strawberry' },
  { emoji: '🥝', name: 'Kiwi' },
];

interface ChoiceOption {
  id: string;
  x: number;
  y: number;
  emoji: string;
  name: string;
  isCorrect: boolean;
  scale: number;
}

const QuickChoiceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const exit = useReactionExit(onBack);
  const [showInfo, setShowInfo] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [options, setOptions] = useState<ChoiceOption[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [targetName, setTargetName] = useState('');

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(0);
  const roundRef = useRef(1);
  const startedRef = useRef(false);

  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { roundRef.current = round; }, [round]);

  const endGame = useCallback(async (finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * SESSION5_9_PACING.standardXp;
    if (timerRef.current) clearInterval(timerRef.current);
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    try {
      await logGameAndAward({
        type: 'quick-choice', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['decision-speed', 'quick-thinking', 'choice-making'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) { console.error(e); }
  }, [router]);

  const generateOptions = useCallback(() => {
    const correctOption = OPTIONS[Math.floor(Math.random() * OPTIONS.length)]!;
    const wrongOption = OPTIONS.find((o) => o.name !== correctOption.name)!;
    setTargetName(correctOption.name);

    const newOptions: ChoiceOption[] = [
      { id: 'a', x: screenWidth.current * 0.3, y: screenHeight.current * 0.5, emoji: correctOption.emoji, name: correctOption.name, isCorrect: true, scale: 1 },
      { id: 'b', x: screenWidth.current * 0.7, y: screenHeight.current * 0.5, emoji: wrongOption.emoji, name: wrongOption.name, isCorrect: false, scale: 1 },
    ];
    if (Math.random() > 0.5) {
      newOptions[0]!.x = screenWidth.current * 0.7;
      newOptions[1]!.x = screenWidth.current * 0.3;
    }
    setOptions(newOptions);
    setTimeLeft(TIME_LIMIT);

    if (timerRef.current) clearInterval(timerRef.current);
    let remaining = TIME_LIMIT;
    timerRef.current = setInterval(() => {
      remaining -= 100;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setTimeout(() => {
          if (roundRef.current < TOTAL_ROUNDS) {
            setRound((r) => r + 1);
          } else {
            endGame(scoreRef.current);
          }
        }, 600);
      }
    }, 100);

    stopTTS();
    speakTTS(`Tap the ${correctOption.name}!`, 0.85, 'en-US');
  }, [endGame]);

  const handleTap = useCallback((event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (done || options.length === 0 || timeLeft <= 0) return;
    const { locationX: tapX, locationY: tapY } = event.nativeEvent;
    for (const option of options) {
      if (Math.hypot(tapX - option.x, tapY - option.y) > TOLERANCE + OPTION_SIZE / 2) continue;
      if (timerRef.current) clearInterval(timerRef.current);
      if (option.isCorrect) {
        setOptions((prev) => prev.map((o) => (o.id === option.id ? { ...o, scale: 1.2 } : o)));
        setTimeout(() => setOptions((prev) => prev.map((o) => (o.id === option.id ? { ...o, scale: 1 } : o))), 200);
        setScore((s) => {
          const newScore = s + 1;
          if (newScore >= TOTAL_ROUNDS) setTimeout(() => endGame(newScore), 800);
          else setTimeout(() => { setRound((r) => r + 1); }, 1200);
          return newScore;
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speakTTS('Quick choice!', 0.9, 'en-US');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        speakTTS('Choose the correct one!', 0.8, 'en-US');
        setTimeout(() => generateOptions(), 1200);
      }
      return;
    }
  }, [done, options, timeLeft, endGame, generateOptions]);

  useEffect(() => {
    if (!showInfo && !done && round > 1 && !showCountdown) generateOptions();
  }, [round, showInfo, done, showCountdown, generateOptions]);

  useEffect(() => {
    if (!showInfo && !done && !showCountdown && !startedRef.current) {
      startedRef.current = true;
      setShowCountdown(true);
    }
  }, [showInfo, done, showCountdown]);

  useEffect(() => () => {
    stopTTS();
    cleanupSounds();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const timePercent = (timeLeft / TIME_LIMIT) * 100;
  const timerHud = (
    <View style={styles.timerWrap}>
      <TimerBar percent={timePercent} accent={QUICK_CHOICE_THEME.accent} />
      <Text style={[styles.timerText, { color: QUICK_CHOICE_THEME.cue }]}>{(timeLeft / 1000).toFixed(1)}s</Text>
    </View>
  );

  return (
    <ReactionShell
      theme={QUICK_CHOICE_THEME} copy={QUICK_CHOICE_COPY}
      showInfo={showInfo} showCongrats done={done} finalStats={finalStats}
      round={round} totalRounds={TOTAL_ROUNDS} score={score}
      hint={targetName ? `Tap the ${targetName}!` : 'Choose quickly!'}
      showHint={!showInfo && !done}
      hudExtra={!showInfo && !done ? timerHud : undefined}
      onStart={() => setShowInfo(false)} onExit={exit} onContinue={onComplete} onBack={onBack}
    >
      <Pressable
        style={styles.gameArea}
        onLayout={(e) => { screenWidth.current = e.nativeEvent.layout.width; screenHeight.current = e.nativeEvent.layout.height; }}
        onPress={handleTap}
      >
        {options.map((option) => (
          <View
            key={option.id}
            pointerEvents="none"
            style={{ position: 'absolute', left: option.x - OPTION_SIZE / 2, top: option.y - OPTION_SIZE / 2 }}
          >
            <ChoiceTile size={OPTION_SIZE} emoji={option.emoji} scale={option.scale} accent={QUICK_CHOICE_THEME.accent} />
          </View>
        ))}
      </Pressable>
      {showCountdown && (
        <RoundCountdownOverlay
          accent={QUICK_CHOICE_THEME.accent}
          onDone={() => {
            setShowCountdown(false);
            stopTTS();
            generateOptions();
          }}
        />
      )}
    </ReactionShell>
  );
};

const styles = StyleSheet.create({
  gameArea: { flex: 1, position: 'relative' },
  timerWrap: { width: 140, marginTop: 4 },
  timerText: { fontSize: 12, fontWeight: '800', textAlign: 'center', marginTop: 2 },
});
export default QuickChoiceGame;
