/**
 * OT Level 1 · Session 7 · Game 4 — Tap The Shape I Show You
 * Theme: "Shape Flash Studio" — memorize the flash, tap the match.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION7_PACING } from '@/components/game/occupational/level1/session7/session7Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION7_PACING;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

type ShapeType = 'circle' | 'square' | 'triangle';
const EMOJIS: Record<ShapeType, string> = { circle: '⭕', square: '⬜', triangle: '🔺' };
const COLORS: Record<ShapeType, [string, string]> = {
  circle: ['#60A5FA', '#2563EB'],
  square: ['#F472B6', '#DB2777'],
  triangle: ['#FBBF24', '#D97706'],
};

const useSound = (uri: string) => {
  const ref = useRef<ExpoAudio.Sound | null>(null);
  useEffect(() => () => { ref.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        if (!ref.current) {
          const { sound } = await ExpoAudio.Sound.createAsync({ uri }, { volume: 0.55 });
          ref.current = sound;
        }
        await ref.current.replayAsync();
      } catch { /* noop */ }
    })();
  }, [uri]);
};

const TapTheShapeIShowYouGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [phase, setPhase] = useState<'preview' | 'choose'>('preview');
  const [choices, setChoices] = useState<ShapeType[]>([]);
  const [sparkleKey, setSparkleKey] = useState(0);

  const targetRef = useRef<ShapeType>('circle');
  const roundActiveRef = useRef(false);
  const doneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const previewScale = useSharedValue(1);
  const previewOpacity = useSharedValue(1);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 15;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Shape flash master!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'tapTheShapeIShowYou', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['shape-recognition-and-matching', 'working-memory', 'controlled-tapping'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const startRound = useCallback(() => {
    const shapes: ShapeType[] = ['circle', 'square', 'triangle'];
    const target = shapes[Math.floor(Math.random() * shapes.length)];
    targetRef.current = target;
    setPhase('preview');
    roundActiveRef.current = false;
    previewScale.value = 1;
    previewOpacity.value = 1;
    previewScale.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 350 }), withTiming(1, { duration: 350 })),
      2,
      true,
    );

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      previewOpacity.value = withTiming(0, { duration: 280 });
      setTimeout(() => {
        setChoices([...shapes].sort(() => Math.random() - 0.5));
        setPhase('choose');
        roundActiveRef.current = true;
        previewOpacity.value = 1;
      }, 300);
    }, P.showShapeMs);
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    startRound();
  }, [round]);

  useEffect(() => {
    speakTTS('Watch the shape flash, then tap the same one!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleTap = useCallback((shape: ShapeType) => {
    if (!roundActiveRef.current || doneRef.current || phase !== 'choose') return;
    if (shape === targetRef.current) {
      setSparkleKey(Date.now());
      playSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      roundActiveRef.current = false;
      setScore((prev) => {
        const next = prev + 1;
        setTimeout(() => { if (next >= TOTAL_ROUNDS) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
        return next;
      });
    } else {
      playError();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Try again!', 0.78).catch(() => {});
    }
  }, [phase, endGame, playSuccess, playError]);

  const previewStyle = useAnimatedStyle(() => ({
    transform: [{ scale: previewScale.value }],
    opacity: previewOpacity.value,
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Flash Master!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backTextDark}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.titleDark}>📸 Shape Flash Studio</Text>
        <Text style={styles.subtitleDark}>{phase === 'preview' ? 'Memorize the shape!' : 'Tap the matching shape'}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabelDark}>Round</Text><Text style={styles.statValueDark}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValueDark}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        {phase === 'preview' ? (
          <Animated.View style={previewStyle}>
            <LinearGradient colors={COLORS[targetRef.current]} style={styles.preview}>
              <Text style={styles.previewEmoji}>{EMOJIS[targetRef.current]}</Text>
            </LinearGradient>
            <Text style={styles.flashLabel}>👀 Watch closely!</Text>
          </Animated.View>
        ) : (
          <View style={styles.choicesRow}>
            {choices.map((s) => (
              <Pressable key={s} onPress={() => handleTap(s)} style={styles.choiceWrap}>
                <LinearGradient colors={COLORS[s]} style={styles.choice}>
                  <Text style={styles.choiceEmoji}>{EMOJIS[s]}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        )}
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#F97316" count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(234,88,12,0.25)' },
  backTextDark: { color: '#9A3412', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  titleDark: { fontSize: 28, fontWeight: '900', color: '#9A3412' },
  subtitleDark: { fontSize: 14, color: '#C2410C', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(234,88,12,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabelDark: { fontSize: 11, color: '#C2410C', fontWeight: '700', textTransform: 'uppercase' },
  statValueDark: { fontSize: 20, fontWeight: '900', color: '#9A3412' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  preview: { width: P.shapeShow.previewSize + 20, height: P.shapeShow.previewSize + 20, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#EA580C', shadowOpacity: 0.35, shadowRadius: 16, elevation: 12 },
  previewEmoji: { fontSize: 64 },
  flashLabel: { marginTop: 20, fontSize: 18, fontWeight: '800', color: '#9A3412', textAlign: 'center' },
  choicesRow: { flexDirection: 'row', gap: 16 },
  choiceWrap: { borderRadius: 20, overflow: 'hidden' },
  choice: { width: P.shapeShow.choiceSize, height: P.shapeShow.choiceSize, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  choiceEmoji: { fontSize: 48 },
});

export default TapTheShapeIShowYouGame;
