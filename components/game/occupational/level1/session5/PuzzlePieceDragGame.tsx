/**
 * OT Level 1 · Session 5 · Game 5 — Puzzle Piece Drag
 * Theme: "Shape Atelier" — snap each shape into its matching slot.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { SESSION5_PACING } from '@/components/game/occupational/level1/session5/session5Pacing';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const P = SESSION5_PACING.puzzlePiece;
const TOTAL_ROUNDS = 8;
const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const STAR_ICON = require('@/assets/icons/star.png');

type PuzzleShape = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond';

const SHAPES: Record<PuzzleShape, { emoji: string; colors: [string, string]; label: string }> = {
  circle: { emoji: '⭕', colors: ['#60A5FA', '#2563EB'], label: 'Circle' },
  square: { emoji: '⬜', colors: ['#A78BFA', '#7C3AED'], label: 'Square' },
  triangle: { emoji: '🔺', colors: ['#F87171', '#DC2626'], label: 'Triangle' },
  star: { emoji: '⭐', colors: ['#FBBF24', '#D97706'], label: 'Star' },
  heart: { emoji: '❤️', colors: ['#F472B6', '#DB2777'], label: 'Heart' },
  diamond: { emoji: '💎', colors: ['#34D399', '#059669'], label: 'Diamond' },
};

const ROUND_SHAPES: PuzzleShape[] = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond', 'circle', 'star'];

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

const PuzzlePieceDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();
  const playSuccess = useSound(SUCCESS_SOUND);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);

  const shape = ROUND_SHAPES[(round - 1) % ROUND_SHAPES.length];
  const shapeInfo = SHAPES[shape];

  const roundActiveRef = useRef(true);
  const matchedRef = useRef(false);
  const doneRef = useRef(false);
  const screenW = useRef(400);
  const screenH = useRef(600);

  const pieceX = useSharedValue(28);
  const pieceY = useSharedValue(32);
  const pieceScale = useSharedValue(1);
  const outlineX = useSharedValue(72);
  const outlineY = useSharedValue(68);
  const startX = useSharedValue(28);
  const startY = useSharedValue(32);

  const endGame = useCallback((finalScore: number) => {
    const total = TOTAL_ROUNDS;
    const xp = finalScore * 20;
    setFinalStats({ correct: finalScore, total, xp });
    setDone(true);
    doneRef.current = true;
    roundActiveRef.current = false;
    setShowCongratulations(true);
    speakTTS('Every shape fits perfectly! Shape master!', 0.78);
    recordGame(xp).then(() =>
      logGameAndAward({
        type: 'puzzlePieceDrag',
        correct: finalScore,
        total,
        accuracy: (finalScore / total) * 100,
        xpAwarded: xp,
        skillTags: ['spatial-problem-solving', 'multi-step-fine-motor-control', 'visual-perception'],
      }),
    ).then(() => router.setParams({ refreshStats: Date.now().toString() })).catch(console.error);
  }, [router]);

  useEffect(() => {
    const ox = 58 + Math.random() * 28;
    const oy = 52 + Math.random() * 30;
    const sx = 12 + Math.random() * 22;
    const sy = 18 + Math.random() * 22;
    outlineX.value = ox;
    outlineY.value = oy;
    startX.value = sx;
    startY.value = sy;
    pieceX.value = sx;
    pieceY.value = sy;
    matchedRef.current = false;
    setIsMatched(false);
    pieceScale.value = 1;
    roundActiveRef.current = true;
    speakTTS(`Drag the ${shapeInfo.label} into its matching slot!`, 0.78);
    return () => { stopAllSpeech(); cleanupSounds(); };
  }, [round, shape]);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      if (!roundActiveRef.current || doneRef.current || matchedRef.current) return;
      setIsDragging(true);
      pieceScale.value = withSpring(1.15, { damping: 10, stiffness: 220 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    })
    .onUpdate((e) => {
      if (!roundActiveRef.current || doneRef.current || matchedRef.current) return;
      pieceX.value = Math.max(4, Math.min(96, (e.x / screenW.current) * 100));
      pieceY.value = Math.max(6, Math.min(94, (e.y / screenH.current) * 100));
    })
    .onEnd(() => {
      if (!roundActiveRef.current || doneRef.current || matchedRef.current) return;
      setIsDragging(false);
      pieceScale.value = withSpring(1, { damping: 12, stiffness: 180 });

      const dx = Math.abs(pieceX.value - outlineX.value);
      const dy = Math.abs(pieceY.value - outlineY.value);
      const dist = Math.hypot(pieceX.value - outlineX.value, pieceY.value - outlineY.value);

      if (dist <= P.matchTolerance && dx <= P.matchTolerance && dy <= P.matchTolerance) {
        matchedRef.current = true;
        setIsMatched(true);
        pieceX.value = withSpring(outlineX.value, { damping: 14, stiffness: 200 });
        pieceY.value = withSpring(outlineY.value, { damping: 14, stiffness: 200 });
        pieceScale.value = withSpring(1.08, { damping: 10, stiffness: 180 });
        setSparkleKey(Date.now());
        playSuccess();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        roundActiveRef.current = false;

        setTimeout(() => {
          setScore((prev) => {
            const next = prev + 1;
            setTimeout(() => {
              if (next >= TOTAL_ROUNDS) endGame(next);
              else { setRound((r) => r + 1); roundActiveRef.current = true; }
            }, P.nextRoundDelayMs);
            return next;
          });
        }, P.snapDelayMs);
      } else {
        pieceX.value = withSpring(startX.value, { damping: 12, stiffness: 140 });
        pieceY.value = withSpring(startY.value, { damping: 12, stiffness: 140 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
      }
    });

  const pieceStyle = useAnimatedStyle(() => ({
    left: `${pieceX.value}%`,
    top: `${pieceY.value}%`,
    transform: [{ translateX: -P.pieceSize / 2 }, { translateY: -P.pieceSize / 2 }, { scale: pieceScale.value }],
  }));

  const outlineStyle = useAnimatedStyle(() => ({
    left: `${outlineX.value}%`,
    top: `${outlineY.value}%`,
    transform: [{ translateX: -P.outlineSize / 2 }, { translateY: -P.outlineSize / 2 }],
  }));

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen message="Shape Artisan!" showButtons correct={finalStats.correct} total={finalStats.total} xpAwarded={finalStats.xp}
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
        <Text style={styles.titleDark}>🎨 Shape Atelier</Text>
        <Text style={styles.subtitleDark}>Match the {shapeInfo.label} to its slot</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPillLight}><Text style={styles.statLabelDark}>Round</Text><Text style={styles.statValueDark}>{round}/{TOTAL_ROUNDS}</Text></View>
          <View style={[styles.statPillLight, styles.starPillLight]}>
            <Image source={STAR_ICON} style={styles.starIcon} /><Text style={styles.statValueDark}>{score}</Text>
          </View>
        </View>
      </View>

      <View style={styles.workbench}>
        <View style={styles.woodGrain} />
      </View>

      <View style={styles.playArea} onLayout={(e) => { screenW.current = e.nativeEvent.layout.width; screenH.current = e.nativeEvent.layout.height; }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.gestureArea}>
            <Animated.View style={[styles.outlineWrap, outlineStyle]}>
              <View style={[styles.outline, isMatched && styles.outlineMatched]}>
                <Text style={[styles.outlineEmoji, isMatched && styles.outlineEmojiMatched]}>{shapeInfo.emoji}</Text>
              </View>
            </Animated.View>

            <Animated.View style={[styles.pieceWrap, pieceStyle]}>
              <LinearGradient colors={shapeInfo.colors} style={styles.piece}>
                <Text style={styles.pieceEmoji}>{shapeInfo.emoji}</Text>
              </LinearGradient>
            </Animated.View>

            {!isDragging && !isMatched && (
              <View style={styles.hintPill}><Text style={styles.hintText}>Drag to the dashed slot 👆</Text></View>
            )}

            <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={shapeInfo.colors[0]} count={16} size={8} />
          </Animated.View>
        </GestureDetector>
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
  statPillLight: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(234,88,12,0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  starPillLight: { backgroundColor: 'rgba(251,191,36,0.2)', borderColor: 'rgba(251,191,36,0.4)' },
  statLabelDark: { fontSize: 11, color: '#C2410C', fontWeight: '700', textTransform: 'uppercase' },
  statValueDark: { fontSize: 20, fontWeight: '900', color: '#9A3412' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  workbench: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', backgroundColor: 'rgba(180,83,9,0.15)', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  woodGrain: { flex: 1, margin: 12, borderRadius: 16, backgroundColor: 'rgba(146,64,14,0.12)' },
  playArea: { flex: 1, marginHorizontal: 8 },
  gestureArea: { flex: 1, position: 'relative' },
  outlineWrap: { position: 'absolute', zIndex: 1 },
  outline: { width: SESSION5_PACING.puzzlePiece.outlineSize, height: SESSION5_PACING.puzzlePiece.outlineSize, borderRadius: 16, borderWidth: 3, borderColor: 'rgba(154,52,18,0.45)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.35)' },
  outlineMatched: { borderColor: '#22C55E', borderStyle: 'solid', backgroundColor: 'rgba(34,197,94,0.15)' },
  outlineEmoji: { fontSize: 48, opacity: 0.35 },
  outlineEmojiMatched: { opacity: 1 },
  pieceWrap: { position: 'absolute', zIndex: 3 },
  piece: { width: SESSION5_PACING.puzzlePiece.pieceSize, height: SESSION5_PACING.puzzlePiece.pieceSize, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, elevation: 10 },
  pieceEmoji: { fontSize: 44 },
  hintPill: { position: 'absolute', bottom: '10%', alignSelf: 'center', left: '18%', right: '18%', backgroundColor: 'rgba(234,88,12,0.88)', paddingVertical: 12, borderRadius: 22, alignItems: 'center' },
  hintText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});

export default PuzzlePieceDragGame;
