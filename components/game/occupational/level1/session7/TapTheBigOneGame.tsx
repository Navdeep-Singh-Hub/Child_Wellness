/**
 * OT Level 1 · Session 7 · Game 1 — Tap The Big One
 * Theme: "Giant's Garden" — tap the glowing giant orb.
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

const PALETTES: [string, string][] = [
  ['#34D399', '#059669'], ['#60A5FA', '#2563EB'], ['#FBBF24', '#D97706'],
  ['#F472B6', '#DB2777'], ['#A78BFA', '#7C3AED'], ['#FB923C', '#EA580C'],
];

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

type OrbTarget = { id: 'large' | 'small'; size: number; x: number; y: number; colors: [string, string] };

function spawnOrbs(): OrbTarget[] {
  const margin = 18;
  const minDist = 28;
  let lx = margin + Math.random() * (100 - margin * 2);
  let ly = margin + Math.random() * (100 - margin * 2);
  let sx = 0; let sy = 0;
  for (let i = 0; i < 40; i++) {
    sx = margin + Math.random() * (100 - margin * 2);
    sy = margin + Math.random() * (100 - margin * 2);
    if (Math.hypot(lx - sx, ly - sy) >= minDist) break;
  }
  const p1 = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const p2 = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  return [
    { id: 'large', size: P.bigOne.largeSize, x: lx, y: ly, colors: p1 },
    { id: 'small', size: P.bigOne.smallSize, x: sx, y: sy, colors: p2 },
  ];
}

function OrbButton({ target, glow, onPress, disabled }: {
  target: OrbTarget; glow?: boolean; onPress: () => void; disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);
  const glowOp = useSharedValue(glow ? 0.6 : 0);

  useEffect(() => {
    if (glow) {
      glowOp.value = withRepeat(
        withSequence(withTiming(1, { duration: 400 }), withTiming(0.45, { duration: 400 })),
        Math.ceil(P.glowDurationMs / 800),
        true,
      );
    }
  }, [glow]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
    opacity: 1 - glowOp.value * 0.15 + glowOp.value * 0.15,
  }));

  const pulseRing = useAnimatedStyle(() => ({
    opacity: glowOp.value * 0.7,
    transform: [{ scale: 1 + glowOp.value * 0.12 }],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: `${target.x}%`, top: `${target.y}%`, marginLeft: -target.size / 2, marginTop: -target.size / 2 }, style]}>
      {glow && (
        <Animated.View style={[styles.glowRing, { width: target.size + 24, height: target.size + 24, borderRadius: (target.size + 24) / 2, marginLeft: -12, marginTop: -12 }, pulseRing]} />
      )}
      <Pressable
        onPress={() => {
          onPress();
        }}
        disabled={disabled}
        onPressIn={() => { scale.value = withSpring(0.92, { damping: 14 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      >
        <LinearGradient colors={target.colors} style={[styles.orb, { width: target.size, height: target.size, borderRadius: target.size / 2 }]}>
          <View style={styles.shine} />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const TapTheBigOneGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [orbs, setOrbs] = useState<OrbTarget[]>([]);
  const [sparkleKey, setSparkleKey] = useState(0);

  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 15;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('You found every giant!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'tapTheBigOne', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['size-discrimination', 'target-accuracy', 'inhibition-of-distractor'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  useEffect(() => {
    setOrbs(spawnOrbs());
    roundActiveRef.current = true;
  }, [round]);

  useEffect(() => {
    speakTTS('Tap the big circle!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const handleTap = useCallback((id: 'large' | 'small') => {
    if (!roundActiveRef.current || doneRef.current) return;
    if (id === 'large') {
      setSparkleKey(Date.now());
      playSuccess();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      roundActiveRef.current = false;
      setScore((prev) => {
        const next = prev + 1;
        setTimeout(() => {
          if (next >= TOTAL_ROUNDS) endGame(next);
          else setRound((r) => r + 1);
        }, P.nextRoundDelayMs);
        return next;
      });
    } else {
      playError();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      speakTTS('Tap the big one!', 0.78).catch(() => {});
    }
  }, [endGame, playSuccess, playError]);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Giant Spotter!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#064E3B', '#047857', '#10B981', '#6EE7B7']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🌳 Giant's Garden</Text>
        <Text style={styles.subtitle}>Tap the biggest orb</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.playArea}>
        {orbs.map((o) => (
          <OrbButton key={`${round}-${o.id}`} target={o} glow={o.id === 'large'} onPress={() => handleTap(o.id)} disabled={!roundActiveRef.current} />
        ))}
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#34D399" count={14} size={8} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#047857' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#D1FAE5', textShadowColor: 'rgba(52,211,153,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontSize: 14, color: 'rgba(209,250,229,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.35)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: { flex: 1, position: 'relative', marginHorizontal: 8 },
  orb: { justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 14, elevation: 12 },
  shine: { position: 'absolute', top: '14%', left: '18%', width: '32%', height: '22%', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.4)' },
  glowRing: { position: 'absolute', borderWidth: 4, borderColor: '#FDE047', backgroundColor: 'rgba(253,224,71,0.15)' },
});

export default TapTheBigOneGame;
