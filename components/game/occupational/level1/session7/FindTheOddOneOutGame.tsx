/**
 * OT Level 1 · Session 7 · Game 3 — Find The Odd One Out
 * Theme: "Spotlight Stage" — which shape doesn't belong?
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
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION7_PACING;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

type ItemType = 'circle' | 'square' | 'triangle' | 'star';
const EMOJIS: Record<ItemType, string> = { circle: '⭕', square: '⬜', triangle: '🔺', star: '⭐' };

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

function buildRound() {
  const types: ItemType[] = ['circle', 'square', 'triangle', 'star'];
  const common = types[Math.floor(Math.random() * types.length)];
  const odd = types.filter((t) => t !== common)[Math.floor(Math.random() * 3)];
  const items = [
    { type: common, isOdd: false }, { type: common, isOdd: false }, { type: common, isOdd: false }, { type: odd, isOdd: true },
  ].sort(() => Math.random() - 0.5);
  return items;
}

function StageTile({ emoji, onPress, disabled }: { emoji: string; onPress: () => void; disabled: boolean }) {
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateX: shake.value }] }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={() => {
          onPress();
        }}
        disabled={disabled}
        onPressIn={() => { scale.value = withSpring(0.92, { damping: 14 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      >
        <LinearGradient colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']} style={styles.tile}>
          <Text style={styles.emoji}>{emoji}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const FindTheOddOneOutGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [items, setItems] = useState<{ type: ItemType; isOdd: boolean }[]>([]);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);
  const shakingRef = useRef(false);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 15;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Spotlight star! You spotted every odd one!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'findTheOddOneOut', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['figure-ground-perception', 'discrimination', 'early-classification'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  useEffect(() => { setItems(buildRound()); roundActiveRef.current = true; shakingRef.current = false; }, [round]);
  useEffect(() => { speakTTS('Find the one that is different!', 0.78); return () => { stopAllSpeech(); cleanupSounds(); }; }, []);

  const handleTap = useCallback((index: number) => {
    if (!roundActiveRef.current || doneRef.current || shakingRef.current) return;
    const item = items[index];
    if (!item) return;

    if (item.isOdd) {
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
      speakTTS('Find the different one!', 0.78).catch(() => {});
    }
  }, [items, endGame, playSuccess, playError]);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Spotlight Star!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1A0A2E', '#3B0764', '#581C87', '#7E22CE']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🎭 Spotlight Stage</Text>
        <Text style={styles.subtitle}>Tap the shape that doesn't belong</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        {items.map((item, i) => (
          <StageTile key={`${round}-${i}`} emoji={EMOJIS[item.type]} onPress={() => handleTap(i)} disabled={!roundActiveRef.current} />
        ))}
      </View>

      <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#C084FC" count={16} size={8} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3B0764' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#F3E8FF', textShadowColor: 'rgba(192,132,252,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontSize: 14, color: 'rgba(243,232,255,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: 18, paddingHorizontal: 24, paddingBottom: 40 },
  tile: { width: P.oddOne.itemSize + 28, height: P.oddOne.itemSize + 28, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  emoji: { fontSize: P.oddOne.itemSize * 0.55 },
});

export default FindTheOddOneOutGame;
