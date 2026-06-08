/**
 * OT Level 1 · Session 1 · Game 3 — Balloon Pop (Moving Target Tap)
 * Theme: "Sunset Balloon Carnival" — golden sky parade with floating balloons.
 * UX focus: visual tracking path, gentle bobbing motion, satisfying pop feedback.
 */
import CongratulationsScreen from '@/components/game/CongratulationsScreen';
import { SparkleBurst } from '@/components/game/FX';
import { isTapNearTarget } from '@/components/game/occupational/shared/movingTargetTouch';
import { logGameAndAward, recordGame } from '@/utils/api';
import { cleanupSounds, stopAllSpeech } from '@/utils/soundPlayer';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { speak as speakTTS, stopTTS } from '@/utils/tts';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const MISS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';
const TOTAL_ROUNDS = 8;
const BALLOON_SIZE = 128;
const ROUND_DURATION_MS = 5000;
const TAP_TOLERANCE = 44;
const STAR_ICON = require('@/assets/icons/star.png');

const BALLOON_COLORS = [
  { body: ['#FB7185', '#F43F5E'], string: '#BE123C' },
  { body: ['#FBBF24', '#F59E0B'], string: '#B45309' },
  { body: ['#A78BFA', '#8B5CF6'], string: '#6D28D9' },
  { body: ['#34D399', '#10B981'], string: '#047857' },
  { body: ['#60A5FA', '#3B82F6'], string: '#1D4ED8' },
  { body: ['#F472B6', '#EC4899'], string: '#BE185D' },
];

const useSoundEffect = (uri: string) => {
  const soundRef = useRef<ExpoAudio.Sound | null>(null);
  const ensureSound = useCallback(async () => {
    if (soundRef.current) return;
    try {
      const { sound } = await ExpoAudio.Sound.createAsync({ uri }, { volume: 0.55, shouldPlay: false });
      soundRef.current = sound;
    } catch { /* noop */ }
  }, [uri]);
  useEffect(() => () => { soundRef.current?.unloadAsync().catch(() => {}); }, []);
  return useCallback(async () => {
    try {
      if (Platform.OS === 'web') return;
      await ensureSound();
      await soundRef.current?.replayAsync();
    } catch { /* noop */ }
  }, [ensureSound]);
};

function Cloud({ style }: { style: object }) {
  return (
    <View pointerEvents="none" style={[styles.cloud, style]}>
      <View style={[styles.cloudPuff, { width: 48, height: 32, left: 0 }]} />
      <View style={[styles.cloudPuff, { width: 64, height: 40, left: 28, top: -8 }]} />
      <View style={[styles.cloudPuff, { width: 52, height: 34, left: 72, top: 2 }]} />
    </View>
  );
}

function TimeBar({ progress }: { progress: Animated.Value }) {
  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.timeBarTrack}>
      <Animated.View style={[styles.timeBarFill, { width }]} />
    </View>
  );
}

const MovingTargetTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => {
  const router = useRouter();

  const [round, setRound] = useState(1);
  const [hits, setHits] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [missFlash, setMissFlash] = useState(false);

  const xAnim = useRef(new Animated.Value(0)).current;
  const yBobAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const timeProgress = useRef(new Animated.Value(0)).current;

  const currentAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const bobAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const hitThisRoundRef = useRef(false);
  const xPosRef = useRef(0);
  const yPosRef = useRef(0);
  const xListenerRef = useRef<string | null>(null);
  const roundActiveRef = useRef(false);
  const hasStartedRef = useRef(false);
  const handleMissRef = useRef<() => void>(() => {});

  const [playAreaLayout, setPlayAreaLayout] = useState<{ width: number; height: number } | null>(null);

  const playPop = useSoundEffect(SUCCESS_SOUND);
  const playMiss = useSoundEffect(MISS_SOUND);
  const balloonColor = BALLOON_COLORS[(round - 1) % BALLOON_COLORS.length];

  useEffect(() => { roundActiveRef.current = roundActive; }, [roundActive]);

  const removeXListener = useCallback(() => {
    if (xListenerRef.current) {
      xAnim.removeListener(xListenerRef.current);
      xListenerRef.current = null;
    }
  }, [xAnim]);

  const startRound = useCallback(() => {
    if (!playAreaLayout) return;

    const startX = -BALLOON_SIZE;
    const endX = playAreaLayout.width - BALLOON_SIZE / 2;
    const centerY = playAreaLayout.height / 2 - BALLOON_SIZE / 2;

    hitThisRoundRef.current = false;
    setRoundActive(true);
    roundActiveRef.current = true;
    scaleAnim.setValue(1);
    timeProgress.setValue(0);

    removeXListener();
    xPosRef.current = startX;
    yPosRef.current = centerY + BALLOON_SIZE / 2;
    xAnim.setValue(startX);
    yBobAnim.setValue(0);

    xListenerRef.current = xAnim.addListener(({ value }) => { xPosRef.current = value; });

    bobAnimRef.current?.stop();
    bobAnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(yBobAnim, { toValue: -14, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(yBobAnim, { toValue: 14, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    bobAnimRef.current.start();

    const moveAnim = Animated.timing(xAnim, {
      toValue: endX,
      duration: ROUND_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    const timeAnim = Animated.timing(timeProgress, {
      toValue: 1,
      duration: ROUND_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    currentAnimRef.current = Animated.parallel([moveAnim, timeAnim]);
    currentAnimRef.current.start(({ finished }) => {
      removeXListener();
      bobAnimRef.current?.stop();
      if (finished && !hitThisRoundRef.current) handleMissRef.current();
    });
  }, [xAnim, yBobAnim, scaleAnim, timeProgress, playAreaLayout, removeXListener]);

  useEffect(() => {
    speakTTS('Watch the balloon float across the sky. Tap it before it flies away!', 0.78).catch(() => {});
    return () => { stopTTS(); };
  }, []);

  useEffect(() => {
    if (!playAreaLayout || hasStartedRef.current) return;
    const timer = setTimeout(() => { hasStartedRef.current = true; startRound(); }, 600);
    return () => clearTimeout(timer);
  }, [playAreaLayout, startRound]);

  useEffect(() => () => {
    currentAnimRef.current?.stop();
    bobAnimRef.current?.stop();
    removeXListener();
    stopAllSpeech();
    cleanupSounds();
  }, [removeXListener]);

  const endGame = useCallback(async (finalHits: number) => {
    const xp = finalHits * 15;
    const total = TOTAL_ROUNDS;
    const stats = { correct: finalHits, total, xp };
    setFinalStats(stats);
    setDone(true);
    setShowCongratulations(true);
    speakTTS('You caught the balloons! Amazing tracking!', 0.78);
    try {
      await recordGame(xp);
      await logGameAndAward({
        type: 'movingTarget' as any,
        correct: finalHits,
        total,
        accuracy: (finalHits / total) * 100,
        xpAwarded: xp,
        skillTags: ['hand-eye', 'tracking-tap', 'timing-control'],
      });
      router.setParams({ refreshStats: Date.now().toString() });
    } catch (e) {
      console.error('Failed to log moving target game:', e);
    }
  }, [router]);

  const nextOrFinish = useCallback((justHit: boolean) => {
    const nextRound = round + 1;
    if (nextRound > TOTAL_ROUNDS) {
      endGame(hits + (justHit ? 1 : 0));
    } else {
      if (justHit) setHits((h) => h + 1);
      setRound(nextRound);
      setTimeout(() => startRound(), justHit ? 320 : 480);
    }
  }, [round, hits, startRound, endGame]);

  const handleHit = async () => {
    if (!roundActiveRef.current || hitThisRoundRef.current || done) return;
    hitThisRoundRef.current = true;
    setRoundActive(false);
    roundActiveRef.current = false;
    currentAnimRef.current?.stop();
    bobAnimRef.current?.stop();
    removeXListener();
    setSparkleKey(Date.now());

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0, duration: 180, easing: Easing.in(Easing.back(1.5)), useNativeDriver: true }),
    ]).start();

    try {
      await playPop();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch { /* noop */ }
    nextOrFinish(true);
  };

  const handleMiss = async () => {
    if (hitThisRoundRef.current || done) return;
    setRoundActive(false);
    roundActiveRef.current = false;
    setMissFlash(true);
    setTimeout(() => setMissFlash(false), 500);

    Animated.timing(scaleAnim, { toValue: 0.7, duration: 400, useNativeDriver: true }).start();

    try {
      await playMiss();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      speakTTS('Try again! Tap the balloon next time!', 0.78).catch(() => {});
    } catch { /* noop */ }
    nextOrFinish(false);
  };

  handleMissRef.current = handleMiss;

  const handlePlayAreaLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setPlayAreaLayout({ width, height });
  };

  const handlePlayAreaPress = (event: GestureResponderEvent) => {
    if (!roundActiveRef.current || hitThisRoundRef.current || done || !playAreaLayout) return;
    const targetX = xPosRef.current + BALLOON_SIZE / 2;
    const targetY = yPosRef.current;
    if (isTapNearTarget(event, targetX, targetY, BALLOON_SIZE, TAP_TOLERANCE)) {
      handleHit();
    }
  };

  const handleBack = useCallback(() => {
    stopAllSpeech();
    cleanupSounds();
    onBack?.();
  }, [onBack]);

  if (showCongratulations && done && finalStats) {
    return (
      <CongratulationsScreen
        message="Sky Catcher!"
        showButtons
        correct={finalStats.correct}
        total={finalStats.total}
        xpAwarded={finalStats.xp}
        onContinue={() => { stopAllSpeech(); cleanupSounds(); onComplete ? onComplete() : onBack?.(); }}
        onHome={() => { stopAllSpeech(); cleanupSounds(); onBack?.(); }}
      />
    );
  }
  if (done && finalStats && !showCongratulations) return null;

  const balloonStyle = {
    transform: [
      { translateX: xAnim },
      { translateY: Animated.add(
        playAreaLayout ? playAreaLayout.height / 2 - BALLOON_SIZE / 2 : 0,
        yBobAnim,
      ) },
      { scale: scaleAnim },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#F97316', '#FB923C', '#FDBA74', '#FEF3C7']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.85}>
        <View style={styles.backButtonInner}>
          <Text style={styles.backButtonText}>← Back</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Balloon Carnival</Text>
        <Text style={styles.subtitle}>Track and tap the floating balloon!</Text>
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Round</Text>
            <Text style={styles.statValue}>{round}/{TOTAL_ROUNDS}</Text>
          </View>
          <View style={[styles.statPill, styles.hitPill]}>
            <Image source={STAR_ICON} style={styles.starIcon} />
            <Text style={styles.statValue}>{hits}</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.playArea, missFlash && styles.playAreaMiss]}
        onLayout={handlePlayAreaLayout}
        onPress={handlePlayAreaPress}
        disabled={!roundActive || done}
      >
        <LinearGradient colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'rgba(254,243,199,0.2)']} style={StyleSheet.absoluteFillObject} />

        <Cloud style={{ top: '12%', left: '5%', opacity: 0.7 }} />
        <Cloud style={{ top: '22%', right: '8%', opacity: 0.5, transform: [{ scale: 0.8 }] }} />
        <Cloud style={{ top: '55%', left: '15%', opacity: 0.35, transform: [{ scale: 0.6 }] }} />

        {/* Flight path guide */}
        <View pointerEvents="none" style={styles.flightPath}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View key={i} style={[styles.pathDot, { left: `${8 + i * 7.5}%` }]} />
          ))}
        </View>

        <Animated.View pointerEvents="none" style={[styles.balloonWrapper, balloonStyle]}>
          <View style={styles.balloonColumn}>
            <LinearGradient colors={balloonColor.body as [string, string]} style={styles.balloon}>
              <View style={styles.balloonShine} />
              <View style={styles.balloonShineSmall} />
            </LinearGradient>
            <View style={[styles.balloonString, { backgroundColor: balloonColor.string }]} />
            <View style={[styles.balloonKnot, { backgroundColor: balloonColor.string }]} />
          </View>
        </Animated.View>

        {roundActive && <TimeBar progress={timeProgress} />}
        <SparkleBurst key={sparkleKey} visible={!!sparkleKey} color={balloonColor.body[0]} count={16} size={9} />
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerMain}>Follow the balloon with your eyes, then tap!</Text>
        <Text style={styles.footerSub}>It moves slowly — you can do it 🎈</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F97316' },
  backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  backButtonInner: {
    paddingHorizontal: 18, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: 24,
  },
  backButtonText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  header: { alignItems: 'center', marginTop: 64, paddingHorizontal: 16, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginTop: 4, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
  },
  hitPill: { backgroundColor: 'rgba(251,191,36,0.25)', borderColor: 'rgba(251,191,36,0.45)' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '700', textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#fff' },
  starIcon: { width: 18, height: 18, resizeMode: 'contain' },
  playArea: {
    flex: 1, marginHorizontal: 14, marginBottom: 8,
    borderRadius: 28, overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  playAreaMiss: { borderColor: 'rgba(239,68,68,0.6)' },
  cloud: { position: 'absolute', width: 130, height: 44 },
  cloudPuff: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.55)', borderRadius: 999 },
  flightPath: { position: 'absolute', top: '50%', left: 0, right: 0, height: 2, marginTop: -1 },
  pathDot: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)', top: -2 },
  balloonWrapper: { position: 'absolute', top: 0, left: 0 },
  balloonColumn: { alignItems: 'center' },
  balloon: {
    width: BALLOON_SIZE, height: BALLOON_SIZE * 1.15, borderRadius: BALLOON_SIZE * 0.55,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 12,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  balloonShine: {
    position: 'absolute', top: '15%', left: '18%', width: '32%', height: '22%',
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.55)', transform: [{ rotate: '-25deg' }],
  },
  balloonShineSmall: {
    position: 'absolute', bottom: '28%', right: '22%', width: '12%', height: '8%',
    borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.35)',
  },
  balloonString: { width: 2, height: 36, marginTop: -2 },
  balloonKnot: { width: 8, height: 8, borderRadius: 4, marginTop: -2 },
  timeBarTrack: {
    position: 'absolute', bottom: 14, left: 20, right: 20, height: 8,
    backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 999, overflow: 'hidden',
  },
  timeBarFill: { height: '100%', backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 999 },
  footer: { alignItems: 'center', paddingBottom: 20, paddingHorizontal: 20 },
  footerMain: { fontSize: 15, fontWeight: '800', color: 'rgba(255,255,255,0.95)', textAlign: 'center' },
  footerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, textAlign: 'center' },
});

export default MovingTargetTapGame;
