import { ReactionShell, useReactionExit } from '@/components/game/occupational/level5/session9/ReactionShell';
import { SESSION5_9_PACING } from '@/components/game/occupational/level5/session9/session9Pacing';
import { FlashBurst, TimerBar } from '@/components/game/occupational/level5/session9/shared/ReactionFX';
import { ReactionCountdown } from '@/components/game/occupational/level5/session9/shared/ReactionUI';
import { SynesthesiaLabBackdrop } from '@/components/game/occupational/level5/session9/synesthesiaLab/SynesthesiaLabVisuals';
import { SYNESTHESIA_LAB_COPY, SYNESTHESIA_LAB_THEME } from '@/components/game/occupational/level5/session9/synesthesiaLab/synesthesiaLabTheme';
import { logGameAndAward } from '@/utils/api';
import { cleanupSounds, playSound } from '@/utils/soundPlayer';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const TOTAL_ROUNDS = SESSION5_9_PACING.sensoryRounds;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TARGET_SIZE = 100;
const TOLERANCE = 60;

const COLORS = [
  { name: 'Red', emoji: '🔴', color: '#EF4444', sound: 'drum' as const },
  { name: 'Blue', emoji: '🔵', color: '#3B82F6', sound: 'bell' as const },
  { name: 'Green', emoji: '🟢', color: '#10B981', sound: 'clap' as const },
];

const SoundLightGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const exit = useReactionExit(onBack);
  const [showInfo, setShowInfo] = useState(true);
  const [showCountdown, setShowCountdown] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [targetColor, setTargetColor] = useState<typeof COLORS[0] | null>(null);
  const [lightColor, setLightColor] = useState<typeof COLORS[0] | null>(null);
  const [soundPlayed, setSoundPlayed] = useState(false);

  const lightX = useSharedValue(SCREEN_WIDTH * 0.5);
  const lightY = useSharedValue(SCREEN_HEIGHT * 0.5);
  const lightOpacity = useSharedValue(0);
  const lightScale = useSharedValue(1);
  const screenWidth = useRef(SCREEN_WIDTH);
  const screenHeight = useRef(SCREEN_HEIGHT);
  const soundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedRef = useRef(false);

  const endGame = useCallback(async (finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * SESSION5_9_PACING.sensoryXp;
    if (soundTimerRef.current) clearTimeout(soundTimerRef.current);
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    try {
      await logGameAndAward({
        type: 'sound-light', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['multi-sensory', 'auditory-visual-integration', 'matching'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) { console.error(e); }
  }, [router]);

  const generateRound = useCallback(() => {
    const target = COLORS[Math.floor(Math.random() * COLORS.length)]!;
    setTargetColor(target);
    setSoundPlayed(false);
    playSound(target.sound, 0.7, 1.0);
    setSoundPlayed(true);
    const lightMatches = Math.random() > 0.3;
    const light = lightMatches ? target : COLORS.find((c) => c.name !== target.name)!;
    setLightColor(light);
    lightX.value = Math.random() * (screenWidth.current - TARGET_SIZE) + TARGET_SIZE / 2;
    lightY.value = Math.random() * (screenHeight.current - TARGET_SIZE - 80) + TARGET_SIZE / 2 + 40;
    lightOpacity.value = withTiming(1, { duration: 300 });
    lightScale.value = withSpring(1.2, {}, () => { lightScale.value = withSpring(1); });
    if (soundTimerRef.current) clearTimeout(soundTimerRef.current);
    soundTimerRef.current = setTimeout(() => { lightOpacity.value = withTiming(0, { duration: 200 }); }, 2000);
  }, [lightX, lightY, lightOpacity, lightScale]);

  const handleTap = useCallback((event: { nativeEvent: { locationX: number; locationY: number } }) => {
    if (done || !targetColor || !lightColor || !soundPlayed) return;
    const { locationX: tapX, locationY: tapY } = event.nativeEvent;
    if (Math.hypot(tapX - lightX.value, tapY - lightY.value) > TOLERANCE + TARGET_SIZE / 2) return;
    const isMatch = lightColor.name === targetColor.name;
    if (isMatch) {
      if (soundTimerRef.current) clearTimeout(soundTimerRef.current);
      lightOpacity.value = withTiming(0, { duration: 200 });
      setScore((s) => {
        const newScore = s + 1;
        if (newScore >= TOTAL_ROUNDS) setTimeout(() => endGame(newScore), 800);
        else setTimeout(() => { setRound((r) => r + 1); generateRound(); }, 1200);
        return newScore;
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS('Match!', 0.9, 'en-US');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Sound and light must match!', 0.8, 'en-US');
    }
  }, [done, targetColor, lightColor, soundPlayed, lightX, lightY, lightOpacity, generateRound, endGame]);

  useEffect(() => {
    if (!showInfo && !done && !showCountdown && !startedRef.current) {
      startedRef.current = true;
      setShowCountdown(true);
    }
  }, [showInfo, done, showCountdown]);

  useEffect(() => () => {
    stopTTS();
    cleanupSounds();
    if (soundTimerRef.current) clearTimeout(soundTimerRef.current);
  }, []);

  const lightStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: lightX.value - TARGET_SIZE / 2,
    top: lightY.value - TARGET_SIZE / 2,
    opacity: lightOpacity.value,
    transform: [{ scale: lightScale.value }],
  }));

  return (
    <ReactionShell
      theme={SYNESTHESIA_LAB_THEME} copy={SYNESTHESIA_LAB_COPY} backdrop={<SynesthesiaLabBackdrop />}
      showInfo={showInfo} showCongrats done={done} finalStats={finalStats}
      round={round} totalRounds={TOTAL_ROUNDS} score={score}
      hint={targetColor ? `Hear ${targetColor.name} — tap if light matches` : 'Match sound and light!'}
      showHint={!showInfo && !done}
      onStart={() => setShowInfo(false)} onExit={exit} onContinue={onComplete} onBack={onBack}
    >
      <Pressable
        style={styles.gameArea}
        onLayout={(e) => { screenWidth.current = e.nativeEvent.layout.width; screenHeight.current = e.nativeEvent.layout.height; }}
        onPress={handleTap}
      >
        {lightColor && (
          <Animated.View style={lightStyle} pointerEvents="none">
            <View style={[styles.lightRing, { borderColor: lightColor.color }]}>
              <FlashBurst size={TARGET_SIZE} color={lightColor.color} emoji={lightColor.emoji} />
            </View>
          </Animated.View>
        )}
      </Pressable>
      {showCountdown && (
        <ReactionCountdown
          accent={SYNESTHESIA_LAB_THEME.accent}
          onDone={() => {
            setShowCountdown(false);
            stopTTS();
            generateRound();
            setTimeout(() => speakTTS('Match sound and light!', 0.8, 'en-US'), 400);
          }}
        />
      )}
    </ReactionShell>
  );
};

const styles = StyleSheet.create({
  gameArea: { flex: 1, position: 'relative' },
  lightRing: { borderWidth: 3, borderRadius: TARGET_SIZE / 2 + 6, padding: 3 },
});
export default SoundLightGame;
