/**
 * OT Level 5 · Session 2 · Game 1 — Pop the Bubble (Bubble Garden)
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { useTraceSound } from '@/components/game/occupational/level4/session1/dragUtils';
import { BubbleGardenBackdrop, PopBurstFX } from '@/components/game/occupational/level5/session2/popBubble/PopBubbleVisuals';
import { BUBBLE_SIZE, POP_BUBBLE_COPY as COPY, POP_BUBBLE_THEME as THEME } from '@/components/game/occupational/level5/session2/popBubble/popBubbleTheme';
import { SESSION5_2_PACING as P } from '@/components/game/occupational/level5/session2/session2Pacing';
import { RoundCountdownOverlay, Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Easing, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const POP_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';

interface Bubble { id: string; x: number; y: number }

function InteractiveBubble({ bubble, onPop }: { bubble: Bubble; onPop: (b: Bubble) => void }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const breathe = useSharedValue(1);
  const popping = useRef(false);

  useEffect(() => {
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [breathe]);

  const finish = useCallback(() => onPop(bubble), [bubble, onPop]);
  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * breathe.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    if (popping.current) return;
    popping.current = true;
    scale.value = withSequence(withTiming(1.15, { duration: 70 }), withTiming(1.7, { duration: 180 }));
    opacity.value = withTiming(0, { duration: 260 }, () => runOnJS(finish)());
  };

  return (
    <Pressable onPress={handlePress} style={[styles.bubbleHit, { left: bubble.x - BUBBLE_SIZE / 2, top: bubble.y - BUBBLE_SIZE / 2 }]}>
      <Animated.View style={[styles.bubble, bubbleStyle]}>
        <LinearGradient colors={['rgba(255,255,255,0.95)', 'rgba(186,230,253,0.75)', 'rgba(56,189,248,0.35)']} style={styles.bubbleGrad}>
          <View style={styles.shine} />
          <View style={styles.rainbowRing} />
          <Text style={styles.bubbleEmoji}>🫧</Text>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const PopBubbleGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playPop = useTraceSound(POP_SOUND);
  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'idle'>('idle');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [bursts, setBursts] = useState<{ key: number; x: number; y: number }[]>([]);
  const [hint, setHint] = useState('');

  const playW = useRef(340);
  const playH = useRef(400);
  const advancingRef = useRef(false);
  const scoreRef = useRef(0);

  const spawnBubble = useCallback(() => {
    advancingRef.current = false;
    const pad = BUBBLE_SIZE / 2 + 12;
    setBubbles([{
      id: `b-${Date.now()}`,
      x: Math.random() * (playW.current - pad * 2) + pad,
      y: Math.random() * (playH.current - pad * 2 - 40) + pad + 20,
    }]);
  }, []);

  const endGame = useCallback((finalScore: number) => {
    const total = P.rounds;
    const xp = finalScore * P.xpPerScore;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    setShowCongrats(true);
    speakTTS(COPY.ttsComplete, 0.78);
    recordGame(xp)
      .then(() => logGameAndAward({ type: COPY.logType, correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp, skillTags: [...COPY.skillTags] }))
      .then(() => router.setParams({ refreshStats: Date.now().toString() }))
      .catch(console.error);
  }, [router]);

  const onPop = useCallback((bubble: Bubble) => {
    if (advancingRef.current || done) return;
    advancingRef.current = true;
    const key = Date.now();
    setBursts((b) => [...b, { key, x: bubble.x, y: bubble.y }]);
    setBubbles([]);
    playPop();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    speakTTS(COPY.ttsSuccess, 0.9).catch(() => {});
    setTimeout(() => setBursts((b) => b.filter((x) => x.key !== key)), 560);
    setScore((s) => {
      const ns = s + 1;
      scoreRef.current = ns;
      if (ns >= P.rounds) setTimeout(() => endGame(ns), 700);
      else setTimeout(() => { setRound((r) => r + 1); setPhase('countdown'); }, 750);
      return ns;
    });
  }, [done, endGame, playPop]);

  const startPlaying = useCallback(() => {
    setPhase('playing');
    setHint('Tap the bubble!');
    spawnBubble();
    if (round === 1) speakTTS(COPY.ttsIntro, 0.78).catch(() => {});
  }, [round, spawnBubble]);

  useEffect(() => {
    if (!showInfo && !done && phase === 'idle') setPhase('countdown');
  }, [showInfo, done, round, phase]);

  useEffect(() => () => { stopAllSpeech(); cleanupSounds(); }, []);

  const exit = () => { stopAllSpeech(); cleanupSounds(); onBack?.(); };

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <Session2Intro
          config={{
            theme: THEME,
            emoji: COPY.emoji,
            title: COPY.title,
            tagline: COPY.tagline,
            body: COPY.body,
            chips: [...COPY.chips],
            startLabel: COPY.startLabel,
            startGradient: ['#38BDF8', '#0EA5E9', '#0284C7'],
            backdrop: <BubbleGardenBackdrop />,
          }}
          onStart={() => setShowInfo(false)}
          onBack={exit}
        />
      </SafeAreaView>
    );
  }

  if (showCongrats && done && finalStats) {
    return (
      <CongratulationsScreen
        message={COPY.congrats}
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={exit}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={exit} style={styles.back}><Text style={styles.backText}>← Exit</Text></TouchableOpacity>
      <Session2HUD theme={THEME} gameTitle="Pop" emoji={COPY.emoji} round={round} totalRounds={P.rounds} score={score} scoreLabel="POPS" hint={hint} showHint={phase === 'playing'} />
      <View style={styles.arena} onLayout={(e) => { playW.current = e.nativeEvent.layout.width; playH.current = e.nativeEvent.layout.height; }}>
        <BubbleGardenBackdrop />
        {bursts.map((b) => <PopBurstFX key={b.key} burstKey={b.key} x={b.x} y={b.y} />)}
        {phase === 'playing' && bubbles.map((b) => <InteractiveBubble key={b.id} bubble={b} onPop={onPop} />)}
        {phase === 'countdown' && <RoundCountdownOverlay key={`cd-${round}`} accent={THEME.accent} onDone={startPlaying} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#22D3EE' },
  back: { position: 'absolute', top: 52, left: 12, zIndex: 50, backgroundColor: 'rgba(8,47,73,0.5)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  backText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)' },
  bubbleHit: { position: 'absolute', width: BUBBLE_SIZE, height: BUBBLE_SIZE, zIndex: 5 },
  bubble: { width: BUBBLE_SIZE, height: BUBBLE_SIZE, borderRadius: BUBBLE_SIZE / 2 },
  bubbleGrad: { flex: 1, borderRadius: BUBBLE_SIZE / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)' },
  shine: { position: 'absolute', top: 14, left: 18, width: 24, height: 14, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)', transform: [{ rotate: '-25deg' }] },
  rainbowRing: { ...StyleSheet.absoluteFillObject, borderRadius: BUBBLE_SIZE / 2, borderWidth: 2, borderColor: 'rgba(167,139,250,0.35)' },
  bubbleEmoji: { fontSize: 42 },
});

export default PopBubbleGame;
