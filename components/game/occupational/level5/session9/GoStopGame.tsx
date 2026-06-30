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

const GoStopGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const exit = useReactionExit(onBack);
  const [showInfo, setShowInfo] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
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

  const endGame = useCallback(async (finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * SESSION5_9_PACING.standardXp;
    if (buttonTimerRef.current) clearTimeout(buttonTimerRef.current);
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    try {
      await logGameAndAward({
        type: 'go-stop', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['inhibition', 'impulse-control', 'response-inhibition'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) { console.error(e); }
  }, [router]);

  const showButton = useCallback(() => {
    const isGo = Math.random() > 0.5;
    setShowGo(isGo);
    setShowStop(!isGo);
    speakTTS(isGo ? 'Go!' : 'Stop!', 0.9, 'en-US');
    if (buttonTimerRef.current) clearTimeout(buttonTimerRef.current);
    buttonTimerRef.current = setTimeout(() => { setShowGo(false); setShowStop(false); }, 2000);
  }, []);

  const handleTap = useCallback((event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (done) return;
    const { locationX: tapX, locationY: tapY } = event.nativeEvent;
    const centerX = screenWidth.current / 2;
    const centerY = screenHeight.current / 2;
    if (Math.hypot(tapX - centerX, tapY - centerY) > TOLERANCE + BUTTON_SIZE / 2) return;

    if (showGo) {
      if (buttonTimerRef.current) clearTimeout(buttonTimerRef.current);
      setShowGo(false);
      setScore((s) => {
        const newScore = s + 1;
        if (newScore >= TOTAL_ROUNDS) setTimeout(() => endGame(newScore), 800);
        else setTimeout(() => { setRound((r) => r + 1); setTimeout(showButton, 900); }, 1200);
        return newScore;
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS('Good!', 0.9, 'en-US');
    } else if (showStop) {
      if (buttonTimerRef.current) clearTimeout(buttonTimerRef.current);
      setShowStop(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Stop means no tap!', 0.8, 'en-US');
      setTimeout(() => { setRound((r) => r + 1); setTimeout(showButton, 900); }, 1200);
    }
  }, [done, showGo, showStop, showButton, endGame]);

  useEffect(() => {
    if (!showInfo && !done && !showCountdown && !startedRef.current) {
      startedRef.current = true;
      setShowCountdown(true);
    }
  }, [showInfo, done, showCountdown]);

  useEffect(() => () => {
    stopTTS();
    cleanupSounds();
    if (buttonTimerRef.current) clearTimeout(buttonTimerRef.current);
  }, []);

  const hint = showGo ? 'TAP!' : showStop ? "DON'T TAP!" : 'Get ready...';

  return (
    <ReactionShell
      theme={GO_STOP_THEME} copy={GO_STOP_COPY}
      showInfo={showInfo} showCongrats done={done} finalStats={finalStats}
      round={round} totalRounds={TOTAL_ROUNDS} score={score}
      hint={hint} showHint={!showInfo && !done}
      onStart={() => setShowInfo(false)} onExit={exit} onContinue={onComplete} onBack={onBack}
    >
      <Pressable
        style={styles.gameArea}
        onLayout={(e) => { screenWidth.current = e.nativeEvent.layout.width; screenHeight.current = e.nativeEvent.layout.height; }}
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
            showButton();
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
