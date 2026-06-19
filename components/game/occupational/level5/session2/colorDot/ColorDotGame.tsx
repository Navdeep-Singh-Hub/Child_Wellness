/**
 * OT Level 5 · Session 2 · Game 2 — Color Dot Hit (Paint Studio)
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { ResultToast } from '@/components/game/FX';
import { PaintStudioBackdrop, TargetColorBanner } from '@/components/game/occupational/level5/session2/colorDot/ColorDotVisuals';
import { COLORS, COLOR_DOT_COPY as COPY, COLOR_DOT_THEME as THEME, DOT_SIZE } from '@/components/game/occupational/level5/session2/colorDot/colorDotTheme';
import { SESSION5_2_PACING as P } from '@/components/game/occupational/level5/session2/session2Pacing';
import { Session2HUD, Session2Intro } from '@/components/game/occupational/level5/session2/shared/Session2UI';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Dot { id: string; x: number; y: number; colorIndex: number }
type RoundData = { targetColorIndex: number; dots: Dot[] };

const shuffle = <T,>(items: T[]) => {
  const c = [...items];
  for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j]!, c[i]!]; }
  return c;
};

function PaintDot({ dot, onTap }: { dot: Dot; onTap: () => void }) {
  const c = COLORS[dot.colorIndex]!;
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable onPress={() => { scale.value = withSequence(withTiming(0.9, { duration: 60 }), withTiming(1, { duration: 120 })); onTap(); }} style={[styles.dotHit, { left: dot.x - DOT_SIZE / 2, top: dot.y - DOT_SIZE / 2 }]}>
      <Animated.View style={[styles.dot, { backgroundColor: c.color, shadowColor: c.glow }, style]}>
        <View style={styles.dotGloss} />
        <Text style={styles.dotEmoji}>{c.emoji}</Text>
      </Animated.View>
    </Pressable>
  );
}

const ColorDotGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const [showInfo, setShowInfo] = useState(true);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [missToast, setMissToast] = useState(false);

  const playW = useRef(340);
  const playH = useRef(400);
  const colorDeck = useRef<number[]>([]);
  const advancingRef = useRef(false);

  const refillDeck = () => { colorDeck.current = shuffle(COLORS.map((_, i) => i)); };
  const nextColor = () => { if (!colorDeck.current.length) refillDeck(); return colorDeck.current.pop()!; };

  const buildRound = useCallback((): RoundData => {
    const targetIdx = nextColor();
    const count = 3 + Math.floor(Math.random() * 2);
    const pos = () => ({
      x: Math.random() * (playW.current - DOT_SIZE) + DOT_SIZE / 2,
      y: Math.random() * (playH.current - DOT_SIZE - 60) + DOT_SIZE / 2 + 30,
    });
    const distractors = shuffle(COLORS.map((_, i) => i).filter((i) => i !== targetIdx));
    const dots: Dot[] = [{ id: 't', ...pos(), colorIndex: targetIdx }];
    for (let i = 1; i < count; i++) {
      dots.push({ id: `d-${i}`, ...pos(), colorIndex: distractors[(i - 1) % distractors.length]! });
    }
    return { targetColorIndex: targetIdx, dots: shuffle(dots) };
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

  const startRound = useCallback(() => {
    advancingRef.current = false;
    const data = buildRound();
    setRoundData(data);
    stopTTS();
    setTimeout(() => speakTTS(`Tap the ${COLORS[data.targetColorIndex].name.toLowerCase()} dot!`, 0.8), 300);
  }, [buildRound]);

  const onDotTap = useCallback((dot: Dot) => {
    if (!roundData || advancingRef.current || done) return;
    if (dot.colorIndex === roundData.targetColorIndex) {
      advancingRef.current = true;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speakTTS(`Correct! ${COLORS[roundData.targetColorIndex].name}!`, 0.9);
      setScore((s) => {
        const ns = s + 1;
        if (ns >= P.rounds) setTimeout(() => endGame(ns), 850);
        else setTimeout(() => setRound((r) => r + 1), 850);
        return ns;
      });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Try the correct color!', 0.8);
      setMissToast(true);
      setTimeout(() => setMissToast(false), 700);
    }
  }, [roundData, done, endGame]);

  useEffect(() => { if (!showInfo && !done) startRound(); }, [showInfo, round, done, startRound]);
  useEffect(() => () => { stopAllSpeech(); cleanupSounds(); }, []);

  const exit = () => { stopAllSpeech(); cleanupSounds(); onBack?.(); };
  const targetIdx = roundData?.targetColorIndex ?? 0;

  if (showInfo) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <Session2Intro
          config={{ theme: THEME, emoji: COPY.emoji, title: COPY.title, tagline: COPY.tagline, body: COPY.body, chips: [...COPY.chips], startLabel: COPY.startLabel, startGradient: ['#A855F7', '#7C3AED', '#6D28D9'], backdrop: <PaintStudioBackdrop /> }}
          onStart={() => { refillDeck(); setShowInfo(false); }}
          onBack={exit}
        />
      </SafeAreaView>
    );
  }

  if (showCongrats && done && finalStats) {
    return <CongratulationsScreen message={COPY.congrats} showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp} onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }} onHome={exit} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TouchableOpacity onPress={exit} style={styles.back}><Text style={styles.backText}>← Exit</Text></TouchableOpacity>
      <Session2HUD
        theme={THEME}
        gameTitle="Color Dot"
        emoji={COPY.emoji}
        round={round}
        totalRounds={P.rounds}
        score={score}
        scoreLabel="HITS"
        hint={`Find ${COLORS[targetIdx].emoji} ${COLORS[targetIdx].name}`}
        showHint
        extra={roundData ? <TargetColorBanner colorIndex={roundData.targetColorIndex} /> : null}
      />
      <View style={styles.arena} onLayout={(e) => { playW.current = e.nativeEvent.layout.width; playH.current = e.nativeEvent.layout.height; }}>
        <PaintStudioBackdrop />
        {roundData?.dots.map((d) => <PaintDot key={d.id} dot={d} onTap={() => onDotTap(d)} />)}
        <ResultToast text="Wrong color — try again!" type="bad" show={missToast} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3E8FF' },
  back: { position: 'absolute', top: 52, left: 12, zIndex: 50, backgroundColor: 'rgba(91,33,182,0.45)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  backText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  arena: { flex: 1, margin: 10, marginTop: 4, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(167,139,250,0.4)' },
  dotHit: { position: 'absolute', width: DOT_SIZE, height: DOT_SIZE, zIndex: 5 },
  dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.9)', shadowOpacity: 0.45, shadowRadius: 10, elevation: 8 },
  dotGloss: { position: 'absolute', top: 8, left: 12, width: 18, height: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.55)' },
  dotEmoji: { fontSize: 28 },
});

export default ColorDotGame;
