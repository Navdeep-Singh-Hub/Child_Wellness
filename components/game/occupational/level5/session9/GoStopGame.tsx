<<<<<<< HEAD
export { default } from './signalControl/SignalControlGame';
=======
import { RoundCountdownOverlay } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { ReactionShell, useReactionExit } from '@/components/game/occupational/level5/session9/ReactionShell';
import { SESSION5_9_PACING } from '@/components/game/occupational/level5/session9/session9Pacing';
import { SignalButton } from '@/components/game/occupational/level5/session9/VisualReactionVisuals';
import { GO_STOP_COPY, GO_STOP_THEME } from '@/components/game/occupational/level5/session9/visualReactionThemes';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';

const TOTAL_ROUNDS = SESSION5_9_PACING.standardRounds;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 120;
const TOLERANCE = 60;
const SIGNAL_MS = 2000;

type SignalKind = 'go' | 'stop';

const GoStopGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const exit = useReactionExit(onBack);
  const [showInfo, setShowInfo] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showGo, setShowGo] = useState(false);
  const [showStop, setShowStop] = useState(false);

  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const buttonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);
  const resolvingRef = useRef(false);
  const roundRef = useRef(1);
  const scoreRef = useRef(0);
  const doneRef = useRef(false);
  const signalRef = useRef<SignalKind | null>(null);
  const showGoRef = useRef(false);
  const showStopRef = useRef(false);
  const endGameRef = useRef<((finalScore: number) => Promise<void>) | null>(null);
  const finishRoundRef = useRef<((awardPoint: boolean) => void) | null>(null);
  const showButtonRef = useRef<(() => void) | null>(null);

  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { doneRef.current = done; }, [done]);
  useEffect(() => { showGoRef.current = showGo; }, [showGo]);
  useEffect(() => { showStopRef.current = showStop; }, [showStop]);

  const clearButtonTimer = useCallback(() => {
    if (buttonTimerRef.current) {
      clearTimeout(buttonTimerRef.current);
      buttonTimerRef.current = null;
    }
  }, []);

  const hideSignal = useCallback(() => {
    setShowGo(false);
    setShowStop(false);
    showGoRef.current = false;
    showStopRef.current = false;
    signalRef.current = null;
  }, []);

  const endGame = useCallback(async (finalScore: number) => {
    clearButtonTimer();
    hideSignal();
    const total = TOTAL_ROUNDS;
    const xp = finalScore * SESSION5_9_PACING.standardXp;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    try {
      await logGameAndAward({
        type: 'go-stop',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['inhibition', 'impulse-control', 'response-inhibition'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error(e);
    }
  }, [clearButtonTimer, hideSignal, router]);

  useEffect(() => {
    endGameRef.current = endGame;
  }, [endGame]);

  const finishRound = useCallback((awardPoint: boolean) => {
    if (resolvingRef.current || doneRef.current) return;
    resolvingRef.current = true;
    clearButtonTimer();
    hideSignal();

    let newScore = scoreRef.current;
    if (awardPoint) {
      newScore += 1;
      scoreRef.current = newScore;
      setScore(newScore);
    }

    if (roundRef.current >= TOTAL_ROUNDS) {
      setTimeout(() => {
        resolvingRef.current = false;
        endGameRef.current?.(newScore);
      }, awardPoint ? 700 : 500);
      return;
    }

    setTimeout(() => {
      resolvingRef.current = false;
      setRound((r) => {
        const next = r + 1;
        roundRef.current = next;
        return next;
      });
    }, awardPoint ? 800 : 600);
  }, [clearButtonTimer, hideSignal]);

  useEffect(() => {
    finishRoundRef.current = finishRound;
  }, [finishRound]);

  const showButton = useCallback(() => {
    if (doneRef.current || resolvingRef.current) return;

    const isGo = Math.random() > 0.5;
    setShowGo(isGo);
    setShowStop(!isGo);
    showGoRef.current = isGo;
    showStopRef.current = !isGo;
    signalRef.current = isGo ? 'go' : 'stop';
    speakTTS(isGo ? 'Go!' : 'Stop!', 0.9, 'en-US');

    clearButtonTimer();
    buttonTimerRef.current = setTimeout(() => {
      const signal = signalRef.current;
      hideSignal();
      if (signal === 'go') {
        finishRoundRef.current?.(false);
      } else if (signal === 'stop') {
        finishRoundRef.current?.(false);
      }
    }, SIGNAL_MS);
  }, [clearButtonTimer, hideSignal]);

  useEffect(() => {
    showButtonRef.current = showButton;
  }, [showButton]);

  useEffect(() => {
    if (!playing || done || showCountdown) return;
    const t = setTimeout(() => showButtonRef.current?.(), 350);
    return () => clearTimeout(t);
  }, [round, playing, done, showCountdown]);

  const handleTap = useCallback((event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (doneRef.current) return;
    const { locationX: tapX, locationY: tapY } = event.nativeEvent;
    const centerX = screenWidth.current / 2;
    const centerY = screenHeight.current / 2;
    if (Math.hypot(tapX - centerX, tapY - centerY) > TOLERANCE + BUTTON_SIZE / 2) return;

    if (showGoRef.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS('Good!', 0.9, 'en-US');
      finishRoundRef.current?.(true);
    } else if (showStopRef.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Stop means no tap!', 0.8, 'en-US');
      finishRoundRef.current?.(false);
    }
  }, []);

  useEffect(() => {
    if (!showInfo && !done && !showCountdown && !startedRef.current) {
      startedRef.current = true;
      setShowCountdown(true);
    }
  }, [showInfo, done, showCountdown]);

  useEffect(() => () => {
    stopTTS();
    cleanupSounds();
    clearButtonTimer();
  }, [clearButtonTimer]);

  const hint = showGo ? 'TAP!' : showStop ? "DON'T TAP!" : 'Get ready...';

  return (
    <ReactionShell
      theme={GO_STOP_THEME}
      copy={GO_STOP_COPY}
      showInfo={showInfo}
      showCongrats
      done={done}
      finalStats={finalStats}
      round={round}
      totalRounds={TOTAL_ROUNDS}
      score={score}
      hint={hint}
      showHint={!showInfo && !done}
      onStart={() => setShowInfo(false)}
      onExit={exit}
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
        <View style={styles.center} pointerEvents="none">
          {showGo && <SignalButton type="go" size={BUTTON_SIZE} />}
          {showStop && <SignalButton type="stop" size={BUTTON_SIZE} />}
        </View>
      </Pressable>
      {showCountdown && (
        <RoundCountdownOverlay
          accent={GO_STOP_THEME.accent}
          onDone={() => {
            setShowCountdown(false);
            stopTTS();
            setPlaying(true);
            speakTTS('Green tap, red no tap!', 0.8, 'en-US');
          }}
        />
      )}
    </ReactionShell>
  );
};

const styles = StyleSheet.create({
  gameArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  center: { justifyContent: 'center', alignItems: 'center' },
});
export default GoStopGame;
>>>>>>> parent of d0342ff (Revert "fgh")
