import { logGameAndAward, recordGame } from '@/utils/api';
import { Audio as ExpoAudio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ResultCard from './ResultCard';

const SUCCESS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/balloon_pop.ogg';
const MISS_SOUND = 'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg';

const TOTAL_ROUNDS = 8;
const BALLOON_SIZE = 120;
const ROUND_DURATION_MS = 5000; // slow movement (5s)

const useSoundEffect = (uri: string) => {
  const soundRef = useRef<ExpoAudio.Sound | null>(null);

  const ensureSound = useCallback(async () => {
    if (soundRef.current) return;
    try {
      const { sound } = await ExpoAudio.Sound.createAsync(
        { uri },
        { volume: 0.6, shouldPlay: false },
      );
      soundRef.current = sound;
    } catch {
      console.warn('Failed to load sound:', uri);
    }
  }, [uri]);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const play = useCallback(async () => {
    try {
      if (Platform.OS === 'web') return;
      await ensureSound();
      if (soundRef.current) await soundRef.current.replayAsync();
    } catch {}
  }, [ensureSound]);

  return play;
};

const MovingTargetTapGame: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const router = useRouter();

  const [round, setRound] = useState(1);
  const [hits, setHits] = useState(0);
  const [done, setDone] = useState(false);
  const [finalStats, setFinalStats] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const [logTimestamp, setLogTimestamp] = useState<string | null>(null);
  const [roundActive, setRoundActive] = useState(false);
  const [balloonPopped, setBalloonPopped] = useState(false);

  const xAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const currentAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const hitThisRoundRef = useRef(false);

  const playPop = useSoundEffect(SUCCESS_SOUND);
  const playMiss = useSoundEffect(MISS_SOUND);

  const startRound = useCallback(() => {
    const { width } = Dimensions.get('window');
    const startX = -BALLOON_SIZE;
    const endX = width - BALLOON_SIZE / 2;

    hitThisRoundRef.current = false;
    setRoundActive(true);
    setBalloonPopped(false);
    scaleAnim.setValue(1);

    xAnim.setValue(startX);

    const anim = Animated.timing(xAnim, {
      toValue: endX,
      duration: ROUND_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    currentAnimRef.current = anim;

    anim.start(({ finished }) => {
      if (finished && !hitThisRoundRef.current) {
        // child didn’t tap in time – miss
        handleMiss();
      }
    });
  }, [xAnim, scaleAnim]);

  useEffect(() => {
    startRound();
    return () => {
      currentAnimRef.current?.stop();
    };
  }, [startRound]);

  const endGame = useCallback(
    async (finalHits: number) => {
      const xp = finalHits * 15;
      const total = TOTAL_ROUNDS;
      const accuracy = (finalHits / total) * 100;

      setFinalStats({ correct: finalHits, total, xp });
      setDone(true);

      try {
        await recordGame(xp);
        const result = await logGameAndAward({
          type: 'movingTarget' as any,
          correct: finalHits,
          total,
          accuracy,
          xpAwarded: xp,
          skillTags: ['hand-eye', 'tracking-tap', 'timing-control'],
        });
        setLogTimestamp(result?.last?.at ?? null);
        router.setParams({ refreshStats: Date.now().toString() });
      } catch (e) {
        console.error('Failed to log moving target game:', e);
      }
    },
    [router],
  );

  const nextOrFinish = useCallback(
    (justHit: boolean) => {
      const nextRound = round + 1;
      if (nextRound > TOTAL_ROUNDS) {
        const finalHits = hits + (justHit ? 1 : 0);
        endGame(finalHits);
      } else {
        if (justHit) setHits((h) => h + 1);
        setRound(nextRound);
        setTimeout(() => {
          startRound();
        }, 600);
      }
    },
    [round, hits, startRound, endGame],
  );

  const handleHit = async () => {
    if (!roundActive || hitThisRoundRef.current || done) return;

    hitThisRoundRef.current = true;
    setRoundActive(false);
    setBalloonPopped(true);

    currentAnimRef.current?.stop();

    // pop animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 120,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await playPop();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    nextOrFinish(true);
  };

  const handleMiss = async () => {
    if (hitThisRoundRef.current || done) return;
    setRoundActive(false);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await playMiss();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    nextOrFinish(false);
  };

  const handleBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  // ---------- Result screen ----------
  if (done && finalStats) {
    const accuracyPct = Math.round((finalStats.correct / finalStats.total) * 100);
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backChip}
        >
          <Text style={styles.backChipText}>← Back</Text>
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <View style={styles.resultCard}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🎈</Text>
            <Text style={styles.resultTitle}>Great tracking!</Text>
            <Text style={styles.resultSubtitle}>
              You popped the balloon {finalStats.correct} out of {finalStats.total} times.
            </Text>
            <ResultCard
              correct={finalStats.correct}
              total={finalStats.total}
              xpAwarded={finalStats.xp}
              accuracy={accuracyPct}
              logTimestamp={logTimestamp}
              onPlayAgain={() => {
                setRound(1);
                setHits(0);
                setDone(false);
                setFinalStats(null);
                setLogTimestamp(null);
                startRound();
              }}
            />
            <Text style={styles.savedText}>Saved! XP updated ✅</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const balloonStyle = {
    transform: [
      { translateX: xAnim },
      { scale: scaleAnim },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backChip}
      >
        <Text style={styles.backChipText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.headerBlock}>
        <Text style={styles.title}>Moving Balloon Tap</Text>
        <Text style={styles.subtitle}>
          Round {round}/{TOTAL_ROUNDS} • 🎯 Hits: {hits}
        </Text>
        <Text style={styles.helper}>
          Watch the slow balloon and tap it before it reaches the other side.
        </Text>
      </View>

      <View style={styles.playArea}>
        <Animated.View style={[styles.balloonWrapper, balloonStyle]}>
          <Pressable
            onPress={handleHit}
            style={styles.balloonHitArea}
          >
            <View style={styles.balloon}>
              <Text style={{ fontSize: 46 }}>🎈</Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>

      <View style={styles.footerBox}>
        <Text style={styles.footerMain}>
          Skills: hand–eye coordination • tracking + tapping • timing control
        </Text>
        <Text style={styles.footerSub}>
          Let the child visually follow the moving balloon and tap when ready.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFEFF',
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  backChip: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backChipText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  headerBlock: {
    marginTop: 72,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 6,
  },
  helper: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 18,
  },
  playArea: {
    flex: 1,
    justifyContent: 'center',
  },
  balloonWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  balloonHitArea: {
    padding: 10,
  },
  balloon: {
    width: BALLOON_SIZE,
    height: BALLOON_SIZE,
    borderRadius: BALLOON_SIZE / 2,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  footerBox: {
    paddingVertical: 14,
    marginBottom: 20,
  },
  footerMain: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  resultCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 16,
    textAlign: 'center',
  },
  savedText: {
    color: '#22C55E',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default MovingTargetTapGame;
