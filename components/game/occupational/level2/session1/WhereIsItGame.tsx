/**
 * OT Level 2 · Session 1 · Game 2 — Where Is It?
 * Theme: "Star Seeker" — find and tap the hidden star.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION1_PACING } from '@/components/game/occupational/level2/session1/session1Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { speak as speakTTS } from '@/utils/tts';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION1_PACING;
const TOTAL = P.totalRounds;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR_ICON = require('@/assets/icons/star.png');
const DOT_COLORS = ['#CBD5E1', '#94A3B8', '#E2E8F0', '#F1F5F9'];

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

type Dot = { id: number; x: number; y: number; isStar: boolean; color: string };

export const WhereIsItGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [dots, setDots] = useState<Dot[]>([]);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const starScale = useSharedValue(1);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL;
    const xp = finalScore * 12;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Star seeker complete!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'whereIsIt', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['visual-scanning', 'visual-discrimination', 'eye-hand-coordination'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  const spawn = useCallback(() => {
    const count = 8 + Math.floor(Math.random() * 4);
    const starIdx = Math.floor(Math.random() * count);
    const m = 10;
    const next: Dot[] = [];
    for (let i = 0; i < count; i++) {
      next.push({
        id: i,
        x: m + Math.random() * (100 - m * 2),
        y: m + Math.random() * (100 - m * 2),
        isStar: i === starIdx,
        color: DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)],
      });
    }
    setDots(next);
    roundActiveRef.current = true;
    starScale.value = withSpring(1, { damping: 12 });
  }, []);

  useEffect(() => {
    if (doneRef.current) return;
    spawn();
  }, [round]);

  useEffect(() => {
    speakTTS('Find the star and tap it!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const handleTap = useCallback((dot: Dot) => {
    if (!roundActiveRef.current || doneRef.current) return;
    if (!dot.isStar) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    roundActiveRef.current = false;
    setSparkleKey(Date.now());
    playSuccess();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    starScale.value = withSequence(withTiming(1.3, { duration: 100 }), withTiming(0, { duration: P.successPopMs }));
    setScore((prev) => {
      const next = prev + 1;
      setTimeout(() => { if (next >= TOTAL) endGame(next); else setRound((r) => r + 1); }, P.nextRoundDelayMs);
      return next;
    });
  }, [endGame, playSuccess]);

  const starStyle = useAnimatedStyle(() => ({ transform: [{ scale: starScale.value }] }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Star Hunter!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backTextDark}>← Back</Text></View>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.titleDark}>⭐ Star Seeker</Text>
        <Text style={styles.subtitleDark}>Scan the field and tap the star</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabelDark}>Round</Text><Text style={styles.statValueDark}>{round}/{TOTAL}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValueDark}>{score}</Text>
          </View>
        </View>
      </View>
      <View style={styles.playArea}>
        {dots.map((dot) => (
          <Pressable key={dot.id} onPress={() => handleTap(dot)}
            style={[styles.dotWrap, { left: `${dot.x}%`, top: `${dot.y}%` }]}>
            {dot.isStar ? (
              <Animated.View style={starStyle}>
                <Text style={styles.starEmoji}>⭐</Text>
              </Animated.View>
            ) : (
              <View style={[styles.dot, { backgroundColor: dot.color }]} />
            )}
          </Pressable>
        ))}
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#FBBF24" count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const D = 36;
const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)' },
  backTextDark: { color: '#1D4ED8', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  titleDark: { fontSize: 28, fontWeight: '900', color: '#1D4ED8' },
  subtitleDark: { fontSize: 14, color: '#2563EB', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabelDark: { fontSize: 11, color: '#2563EB', fontWeight: '700', textTransform: 'uppercase' },
  statValueDark: { fontSize: 20, fontWeight: '900', color: '#1D4ED8' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, marginHorizontal: 8, marginBottom: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)', backgroundColor: 'rgba(255,255,255,0.35)' },
  dotWrap: { position: 'absolute', marginLeft: -D / 2, marginTop: -D / 2, width: D + 20, height: D + 20, justifyContent: 'center', alignItems: 'center' },
  dot: { width: D, height: D, borderRadius: D / 2 },
  starEmoji: { fontSize: 36 },
});

export default WhereIsItGame;
