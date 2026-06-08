/**
 * OT Level 1 · Session 7 · Game 5 — Match Shape To Outline
 * Theme: "Puzzle Dock" — tap the shape that fits the glowing outline.
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
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION7_PACING;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const ERROR_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

type ShapeType = 'circle' | 'triangle';
const EMOJIS: Record<ShapeType, string> = { circle: '⭕', triangle: '🔺' };

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

const MatchShapeToOutlineGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);
  const playError = useSound(ERROR_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [target, setTarget] = useState<ShapeType>('circle');
  const [shapes, setShapes] = useState<{ type: ShapeType; x: number; y: number }[]>([]);
  const [sparkleKey, setSparkleKey] = useState(0);

  const targetRef = useRef<ShapeType>('circle');
  const roundActiveRef = useRef(true);
  const doneRef = useRef(false);

  const outlinePulse = useSharedValue(1);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 15;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    setShowCongratulations(true);
    speakTTS('Puzzle dock complete!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({ type: 'matchShapeToOutline', correct: finalScore, total, accuracy: (finalScore / total) * 100, xpAwarded: xp,
        skillTags: ['spatial-reasoning', 'early-puzzle-foundation', 'visual-form-constancy'] }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  useEffect(() => {
    const types: ShapeType[] = ['circle', 'triangle'];
    const t = types[Math.floor(Math.random() * 2)];
    const other = t === 'circle' ? 'triangle' : 'circle';
    const shuffled = Math.random() > 0.5 ? [t, other] : [other, t];
    targetRef.current = t;
    setTarget(t);
    setShapes([
      { type: shuffled[0], x: 28 + Math.random() * 12, y: 55 + Math.random() * 20 },
      { type: shuffled[1], x: 58 + Math.random() * 12, y: 55 + Math.random() * 20 },
    ]);
    roundActiveRef.current = true;
    outlinePulse.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 500 }), withTiming(1, { duration: 500 })),
      -1,
      true,
    );
  }, [round]);

  useEffect(() => {
    speakTTS('Tap the shape that matches the glowing outline!', 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, []);

  const handleTap = useCallback((type: ShapeType) => {
    if (!roundActiveRef.current || doneRef.current) return;
    if (type === targetRef.current) {
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
      speakTTS('Match the outline shape!', 0.78).catch(() => {});
    }
  }, [endGame, playSuccess, playError]);

  const outlineStyle = useAnimatedStyle(() => ({ transform: [{ scale: outlinePulse.value }] }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Puzzle Captain!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#451A03', '#78350F', '#92400E', '#B45309']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }} style={styles.backBtn} activeOpacity={0.85}>
        <View style={styles.backInner}><Text style={styles.backText}>← Back</Text></View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>🧩 Puzzle Dock</Text>
        <Text style={styles.subtitle}>Match shape to outline</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}><Text style={styles.statLabel}>Round</Text><Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPill, styles.starPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValue}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.dock}>
        <Animated.View style={[styles.outlineSlot, outlineStyle]}>
          <View style={styles.outlineInner}>
            <Text style={styles.outlineEmoji}>{EMOJIS[target]}</Text>
          </View>
          <Text style={styles.outlineLabel}>MATCH THIS</Text>
        </Animated.View>

        <View style={styles.shapesArea}>
          {shapes.map((s, i) => (
            <Pressable
              key={`${round}-${i}`}
              onPress={() => handleTap(s.type)}
              style={[styles.shapeBtn, { left: `${s.x}%`, top: `${s.y}%` }]}
            >
              <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.08)']} style={styles.shapeInner}>
                <Text style={styles.shapeEmoji}>{EMOJIS[s.type]}</Text>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </View>

      <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color="#FBBF24" count={14} size={8} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#78350F' },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backInner: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  backText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#FEF3C7', textShadowColor: 'rgba(251,191,36,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  subtitle: { fontSize: 14, color: 'rgba(254,243,199,0.85)', fontWeight: '600', marginTop: 4, marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPill: { backgroundColor: 'rgba(251,191,36,0.15)', borderColor: 'rgba(251,191,36,0.35)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  dock: { flex: 1, paddingHorizontal: 16 },
  outlineSlot: { alignSelf: 'center', alignItems: 'center', marginTop: 12, marginBottom: 24 },
  outlineInner: {
    width: P.matchOutline.outlineSize, height: P.matchOutline.outlineSize, borderRadius: 20,
    borderWidth: 4, borderColor: '#FDE047', borderStyle: 'dashed',
    backgroundColor: 'rgba(253,224,71,0.12)', justifyContent: 'center', alignItems: 'center',
  },
  outlineEmoji: { fontSize: 52, opacity: 0.85 },
  outlineLabel: { marginTop: 10, fontSize: 13, fontWeight: '900', color: '#FDE047', letterSpacing: 2 },
  shapesArea: { flex: 1, position: 'relative' },
  shapeBtn: { position: 'absolute', marginLeft: -P.matchOutline.shapeSize / 2, marginTop: -P.matchOutline.shapeSize / 2 },
  shapeInner: {
    width: P.matchOutline.shapeSize, height: P.matchOutline.shapeSize, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  shapeEmoji: { fontSize: 44 },
});

export default MatchShapeToOutlineGame;
