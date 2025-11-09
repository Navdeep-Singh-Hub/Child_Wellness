// Games.tsx — AAC-friendly games (Tap Timing + Picture Match + Quick Sort + Find Emoji)
// Includes guards for undefined items in FlatList and no conditional/top-level hook misuse.

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated';

import { CATEGORIES, type Tile, tileImages } from '@/constants/aac';
import { ResultToast, SparkleBurst, Stepper } from '@/components/game/FX';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { fetchMyStats, finishTapRound, logGameAndAward, recordGame, startTapRound } from '@/utils/api';
import ResultCard from '@/components/game/ResultCard';

// -------------------- Shared UI helpers --------------------
function Card({ children, style }: any) {
  return (
    <View className="w-full max-w-xl rounded-3xl p-5 bg-white border border-gray-200" style={style}>
      {children}
    </View>
  );
}

function BigButton({
  title,
  color = '#2563EB',
  onPress,
  icon,
}: {
  title: string;
  color?: string;
  onPress: () => void;
  icon?: any;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={{ backgroundColor: color }}
      className="mt-4 px-6 py-4 rounded-2xl flex-row items-center justify-center"
    >
      {icon ? <Image source={icon} style={{ width: 28, height: 28, marginRight: 10 }} /> : null}
      <Text className="text-white font-extrabold text-lg">{title}</Text>
    </TouchableOpacity>
  );
}

function speak(text: string) {
  try {
    Speech.stop();
    Speech.speak(text, { rate: 0.98 });
  } catch {}
}

// -------------------- Data pools (safe, kid-friendly) --------------------
type CatId = 'transport' | 'food' | 'animals' | 'emotions' | 'jobs' | 'actions';
function tilesByCat(id: CatId): Tile[] {
  const cat = CATEGORIES.find((c) => c.id === id);
  return cat ? cat.tiles : [];
}
const TRANSPORT = tilesByCat('transport');
const FOOD = tilesByCat('food');
const ANIMALS = tilesByCat('animals');   // optional, not used directly below but kept for future games
const EMOTIONS = tilesByCat('emotions'); // used by Emoji game
const JOBS = tilesByCat('jobs');
const ACTIONS = tilesByCat('actions');

// Compact pool for picture games (no hooks at module scope)
const PICTURE_POOL: Tile[] = (() => {
  const set = new Map<string, Tile>();
  [...TRANSPORT.slice(0, 12), ...FOOD.slice(0, 12)].forEach((t) => {
    if (t && t.id) set.set(t.id, t);
  });
  return Array.from(set.values());
})();

// -------------------- Game: Tap Timing --------------------
function TapTiming({ onBack }: { onBack: () => void }) {
  const [roundId, setRoundId] = useState<string | null>(null);
  const [targetSec, setTargetSec] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ xp: number; streak: number; games: number } | null>(null);
  const [tapDeltaMs, setTapDeltaMs] = useState<number | null>(null);

  const startClientAt = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const prefetch = useRef<{ roundId: string; targetSeconds: number } | null>(null);
  // removed per-second speech

  const stopTicker = () => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = null;
  };
  const startTicker = () => {
    const t0 = Date.now();
    const tick = () => {
      setElapsedMs(Date.now() - (startClientAt.current ?? t0));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const prefetchRound = useCallback(async () => {
    try {
      const data = await startTapRound();
      prefetch.current = data;
    } catch (e: any) {
      console.log('Prefetch tap round failed', e?.message || e);
      prefetch.current = null;
    }
  }, []);

  useEffect(() => {
    prefetchRound();
  }, [prefetchRound]);

  const onStart = async () => {
    try {
      setState('running');
      setMsg(null);
      setElapsedMs(0);
      let round = prefetch.current;
      if (!round) {
        round = await startTapRound();
      }
      prefetch.current = null;
      setRoundId(round.roundId);
      setTargetSec(round.targetSeconds);
      startClientAt.current = Date.now();
      // reset per-second speech (removed)
      startTicker();
      speak('Wait and tap at the right time!');
      prefetchRound();
    } catch (e: any) {
      setState('error');
      setMsg(e?.message || 'Could not start round');
    }
  };

  const onTap = async () => {
    if (state !== 'running' || !roundId) return;
    stopTicker();
    try {
      const res = await finishTapRound(roundId);
      const delta = typeof (res as any).deltaMs === 'number' && !isNaN((res as any).deltaMs)
        ? Math.abs((res as any).deltaMs)
        : Math.abs(elapsedMs - (targetSec ?? 0) * 1000);
      setState('done');
      setTapDeltaMs(delta);
      setMsg(
        `Target ${res.targetSeconds}s · Yours ${(elapsedMs / 1000).toFixed(1)}s · Δ ${Math.round(delta)}ms → +${res.pointsAwarded} XP`
      );
      setSummary({
        xp: res.stats.points,
        streak: res.stats.streakDays,
        games: res.stats.totalGamesPlayed,
      });
      try {
        await logGameAndAward({
          type: 'tap',
          correct: 1,
          total: 1,
          // Softer mapping: 0ms -> 100, 2000ms -> 0
          accuracy: Math.max(0, 100 - Math.min(delta / 20, 100)),
          xpAwarded: res.pointsAwarded,
          durationMs: elapsedMs,
        });
      } catch {}
      speak('Great job!');
    } catch (e: any) {
      setState('error');
      setMsg(e?.message || 'Finish failed');
    } finally {
      setRoundId(null);
      setTargetSec(null);
      startClientAt.current = null;
    }
  };

  // Ensure ticker stops on unmount regardless of render branch
  useEffect(() => () => stopTicker(), []);

  // Completion screen
  if (state === 'done' && summary && msg) {
    // Prefer numeric delta captured from API; fallback to parsing string
    const deltaMatch = msg.match(/Δ\s*(-?\d+)ms/);
    const parsed = deltaMatch ? Math.abs(parseInt(deltaMatch[1])) : null;
    const deltaMs = tapDeltaMs ?? parsed ?? 0;
    // Softer mapping: 0ms => 100, 1000ms => 50, 2000ms => 0
    const accuracy = Math.max(0, 100 - Math.min(deltaMs / 20, 100));
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
        <TouchableOpacity onPress={onBack} className="absolute top-12 left-6 px-4 py-2 rounded-full" style={{ backgroundColor: '#000' }}>
          <Text className="text-white font-semibold">← Back</Text>
        </TouchableOpacity>

        <View className="w-full max-w-xl rounded-3xl p-6 bg-white border border-gray-200 items-center">
          <Text className="text-6xl mb-4">🎯</Text>
          <Text className="text-3xl font-extrabold text-gray-900 mb-2">Game Complete!</Text>
          <Text className="text-xl text-gray-600 mb-6 text-center">
            {msg}
          </Text>

          <View className="w-full bg-gray-50 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-700 font-semibold">Accuracy:</Text>
              <Text className="text-gray-900 font-extrabold text-lg">
                {Math.round(accuracy)}%
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-700 font-semibold">Total XP:</Text>
              <Text className="text-gray-900 font-extrabold text-lg">{summary.xp}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-700 font-semibold">Streak:</Text>
              <Text className="text-gray-900 font-extrabold text-lg">{summary.streak} days 🔥</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700 font-semibold">Games Played:</Text>
              <Text className="text-gray-900 font-extrabold text-lg">{summary.games}</Text>
            </View>
          </View>

          <Text className="text-green-600 font-semibold text-center mb-4">Saved! XP updated ✅</Text>

          <BigButton title="Play Again" color="#2563EB" onPress={() => {
            setState('idle');
            setSummary(null);
            setMsg(null);
            prefetchRound();
          }} />
        </View>
      </SafeAreaView>
    );
  }

  // per-second speech removed per user feedback

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6" style={{ backgroundColor: '#F0F9FF' }}>
      <TouchableOpacity 
        onPress={onBack} 
        className="absolute top-12 left-6 px-4 py-2 rounded-full" 
        style={{ 
          backgroundColor: '#111827',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Text className="text-white font-semibold">← Back</Text>
      </TouchableOpacity>

      <View style={{
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 32,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
      }}>
        <View className="items-center mb-6">
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: '#6366F1',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            shadowColor: '#6366F1',
            shadowOpacity: 0.3,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}>
            <Text style={{ fontSize: 48 }}>🎯</Text>
          </View>
          <Text className="font-extrabold text-3xl text-gray-900 mb-2">Tap Timing</Text>
          <Text className="text-gray-600 text-center text-base">
            Wait for the target time, then tap!
          </Text>
        </View>

        <View className="items-center my-8" style={{
          backgroundColor: '#F8FAFC',
          borderRadius: 24,
          padding: 32,
          borderWidth: 2,
          borderColor: '#E2E8F0',
        }}>
          <Text style={{ 
            fontSize: 72, 
            fontWeight: '900', 
            color: state === 'running' ? '#2563EB' : '#1F2937',
            letterSpacing: -2,
          }}>
            {Math.floor(elapsedMs / 1000)}s
          </Text>
          {targetSec != null ? (
            <View style={{
              marginTop: 12,
              backgroundColor: '#FEF3C7',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 16,
            }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '700', 
                color: '#92400E',
              }}>
                Target: {targetSec}s
              </Text>
            </View>
          ) : null}
        </View>

        {state !== 'running' ? (
          <BigButton 
            title="Start Round" 
            color="#16A34A" 
            onPress={onStart} 
            icon={icons.play}
          />
        ) : (
          <BigButton 
            title="TAP NOW!" 
            color="#2563EB" 
            onPress={onTap} 
            icon={images.tapNowIcon}
          />
        )}

        {msg && state !== 'done' ? (
          <View style={{
            marginTop: 16,
            backgroundColor: '#F0F9FF',
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#BFDBFE',
          }}>
            <Text className="text-center text-gray-800 font-semibold">{msg}</Text>
          </View>
        ) : null}

        {summary && state === 'done' ? (
          <View style={{
            marginTop: 16,
            backgroundColor: '#F0FDF4',
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: '#BBF7D0',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>Total XP:</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#166534' }}>{summary.xp}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>Streak:</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#166534' }}>{summary.streak} days 🔥</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>Games:</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#166534' }}>{summary.games}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

// -------------------- Game: Picture Match --------------------
function PictureMatch({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<Tile | null>(null);
  const [choices, setChoices] = useState<Tile[]>([]);
  const [done, setDone] = useState(false);
  const [pmFeedback, setPmFeedback] = useState<null | 'ok' | 'bad'>(null);
  const [fxKey, setFxKey] = useState(0);
  const [locked, setLocked] = useState(false);
  const [finalScore, setFinalScore] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const pmToastOpacity = useSharedValue(0);
  const pmToastY = useSharedValue(12);
  const pmToastStyle = useAnimatedStyle(() => ({ opacity: pmToastOpacity.value, transform: [{ translateY: pmToastY.value }] }));

  const pulse = useSharedValue(1);
  const pulseStyle = useScaleStyle(pulse);

  const next = useCallback(() => {
    const pool = PICTURE_POOL;
    if (!pool.length) return;

    const correct = pool[Math.floor(Math.random() * pool.length)];
    const wrongs = pool.filter((t) => t && t.id !== correct.id);
    shuffle(wrongs);
    // Shuffle final options so correct isn't always first
    const opts = shuffle([correct, ...wrongs.slice(0, 2)]).filter(Boolean) as Tile[];

    setTarget(correct);
    setChoices(opts);
    setPmFeedback(null);
    setLocked(false);
    if (correct?.label) speak(correct.label);
    pulse.value = 1;
  }, [pulse]);

  useEffect(() => {
    next();
  }, [next]);

  const onPick = async (t: Tile) => {
    if (locked || !target) return; // guard
    setLocked(true);
    const ok = t?.id === target.id;
    animatePulse(pulse, ok);
    if (ok) setScore((s) => s + 1);
    setPmFeedback(ok ? 'ok' : 'bad');
    setFxKey((k) => k + 1);
    pmToastOpacity.value = 0; pmToastY.value = 12;
    pmToastOpacity.value = withTiming(1, { duration: 140 });
    pmToastY.value = withTiming(0, { duration: 140 });

    if (round >= 5) {
      setDone(true);
      const correctCount = score + (ok ? 1 : 0);
      const total = 5;
      const xp = correctCount * 10;
      setFinalScore({ correct: correctCount, total, xp });
      try {
        await recordGame(xp); // legacy XP
        await logGameAndAward({
          type: 'match',
          correct: correctCount,
          total,
          accuracy: (correctCount / total) * 100,
          xpAwarded: xp,
        });
      } catch {}
      speak('Well done!');
    } else {
      setRound((r) => r + 1);
      setTimeout(() => {
        pmToastOpacity.value = withTiming(0, { duration: 120 });
        next();
      }, 180);
    }
  };

  // Completion screen
  if (done && finalScore) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
        <TouchableOpacity onPress={onBack} className="absolute top-12 left-6 px-4 py-2 rounded-full" style={{ backgroundColor: '#000' }}>
          <Text className="text-white font-semibold">← Back</Text>
        </TouchableOpacity>
        <View className="w-full max-w-xl rounded-3xl p-6 bg-white border border-gray-200 items-center">
          <ResultCard
            correct={finalScore.correct}
            total={finalScore.total}
            onPlayAgain={() => {
              setRound(1);
              setScore(0);
              setDone(false);
              setFinalScore(null);
              setPmFeedback(null);
              next();
            }}
            onHome={onBack}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!target || !(choices && choices.length)) return null;

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6" style={{ backgroundColor: '#F0FDF4' }}>
      <TouchableOpacity 
        onPress={onBack} 
        className="absolute top-12 left-6 px-4 py-2 rounded-full" 
        style={{ 
          backgroundColor: '#111827',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Text className="text-white font-semibold">← Back</Text>
      </TouchableOpacity>

      <View style={{
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 28,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
      }}>
        {/* HUD */}
        <Stepper step={round} total={5} />
        <View style={{ alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: '#111827', marginBottom: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>Score: {score}</Text>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' }}>
            Find: "{target.label}"
          </Text>
          <Animated.View style={[{ alignItems: 'center' }, pulseStyle]}>
            <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '600' }}>
              Tap the correct picture
            </Text>
          </Animated.View>
        </View>

        {/* Fireworks on correct */}
        {pmFeedback === 'ok' && <SparkleBurst key={fxKey} visible color="#22C55E" />}

        <View style={{ marginBottom: 20 }}>
          <FlatList
            data={(choices || []).filter(Boolean)}
            keyExtractor={(t, i) => (t && t.id ? String(t.id) : `choice-${i}`)}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'space-between', gap: 12 }}
            contentContainerStyle={{ gap: 12 }}
            bounces={false}
            overScrollMode="never"
            renderItem={({ item }) => (item ? <ChoiceCard tile={item} onPress={() => onPick(item)} /> : null)}
          />
        </View>

        {/* Toast overlay */}
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', zIndex: 40 }}>
          <ResultToast text={pmFeedback === 'ok' ? 'Correct!' : 'Oops!'} type={pmFeedback === 'ok' ? 'ok' : 'bad'} show={!!pmFeedback} />
        </View>

        {done ? <Text className="mt-3 text-green-600 font-semibold text-center">Saved! XP updated ✅</Text> : null}
      </View>
    </SafeAreaView>
  );
}

// -------------------- Game: Quick Sort (Food vs Transport) --------------------
function QuickSort({ onBack }: { onBack: () => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [item, setItem] = useState<Tile | null>(null);
  const [done, setDone] = useState(false);
  const [choices, setChoices] = useState<CatId[]>(['food', 'transport']);
  const [correctCat, setCorrectCat] = useState<CatId | null>(null);
  const [qsFeedback, setQsFeedback] = useState<null | 'correct' | 'wrong'>(null);
  const [finalScore, setFinalScore] = useState<{ correct: number; total: number; xp: number } | null>(null);
  const qsToastOpacity = useSharedValue(0);
  const qsToastY = useSharedValue(12);
  const qsToastStyle = useAnimatedStyle(() => ({ opacity: qsToastOpacity.value, transform: [{ translateY: qsToastY.value }] }));

  const jiggle = useSharedValue(0);
  const jiggleStyle = useJiggleStyle(jiggle);

  const QUESTIONS = useMemo(() => {
    const pool = [
      ...(FOOD || []).slice(0, 10),
      ...(TRANSPORT || []).slice(0, 10),
      ...(JOBS || []).slice(0, 10),
      ...(EMOTIONS || []).slice(0, 10),
      ...(ACTIONS || []).slice(0, 10),
    ];
    return shuffle(pool.filter(Boolean)).slice(0, 8);
  }, []);

  const detectCategory = (t: Tile): CatId | null => {
    const id = t.id;
    if ((FOOD || []).some((x) => x?.id === id)) return 'food';
    if ((TRANSPORT || []).some((x) => x?.id === id)) return 'transport';
    if ((JOBS || []).some((x) => x?.id === id)) return 'jobs';
    if ((EMOTIONS || []).some((x) => x?.id === id)) return 'emotions';
    if ((ACTIONS || []).some((x) => x?.id === id)) return 'actions';
    return null;
  };

  const next = useCallback(() => {
    const t = QUESTIONS[qIndex];
    if (!t) return;
    setItem(t);
    const correct = detectCategory(t);
    setCorrectCat(correct);
    const allCats: CatId[] = ['food', 'transport', 'jobs', 'emotions', 'actions'];
    const other = shuffle(allCats.filter((c) => c !== correct))[0] as CatId;
    setChoices(shuffle([correct as CatId, other]));
    if (t.label) speak(t.label);
  }, [QUESTIONS, qIndex]);

  useEffect(() => {
    next();
  }, [next]);

  const answer = async (cat: CatId) => {
    if (!item) return;
    const ok = correctCat != null && cat === correctCat;

    if (ok) {
      setScore((s) => s + 1);
      animateCorrect(jiggle);
    } else {
      animateWrong(jiggle);
    }
    setQsFeedback(ok ? 'correct' : 'wrong');
    qsToastOpacity.value = 0; qsToastY.value = 12;
    qsToastOpacity.value = withTiming(1, { duration: 180 });
    qsToastY.value = withTiming(0, { duration: 180 });

    if (qIndex >= 7) {
      setDone(true);
      const finalCorrect = score + (ok ? 1 : 0);
      const total = 8;
      const xp = finalCorrect * 10;
      setFinalScore({ correct: finalCorrect, total, xp });

      try {
        await recordGame(xp);
        await logGameAndAward({
          type: 'sort',
          correct: finalCorrect,
          total,
          accuracy: (finalCorrect / total) * 100,
          xpAwarded: xp,
        });
      } catch {}

      speak('Great sorting!');
    } else {
      setQIndex((i) => i + 1);
      setTimeout(() => { qsToastOpacity.value = withTiming(0, { duration: 220 }); next(); }, 400);
    }
  };

  // Completion screen
  if (done && finalScore) {
    const allCorrect = finalScore.correct === finalScore.total;
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
        <TouchableOpacity onPress={onBack} className="absolute top-12 left-6 px-4 py-2 rounded-full" style={{ backgroundColor: '#000' }}>
          <Text className="text-white font-semibold">← Back</Text>
        </TouchableOpacity>

        <View className="w-full max-w-xl rounded-3xl p-6 bg-white border border-gray-200 items-center">
          <Text className="text-6xl mb-4">{allCorrect ? '🎉' : '🎊'}</Text>
          <Text className="text-3xl font-extrabold text-gray-900 mb-2">
            {allCorrect ? 'Perfect Score!' : 'Game Complete!'}
          </Text>
          <Text className="text-xl text-gray-600 mb-6">
            You got {finalScore.correct} out of {finalScore.total} correct!
          </Text>

          <View className="w-full bg-gray-50 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-700 font-semibold">Final Score:</Text>
              <Text className="text-gray-900 font-extrabold text-lg">
                {finalScore.correct}/{finalScore.total}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-700 font-semibold">Accuracy:</Text>
              <Text className="text-gray-900 font-extrabold text-lg">
                {Math.round((finalScore.correct / finalScore.total) * 100)}%
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700 font-semibold">XP Earned:</Text>
              <Text className="text-green-600 font-extrabold text-lg">+{finalScore.xp} XP</Text>
            </View>
          </View>

          <Text className="text-green-600 font-semibold text-center mb-4">Saved! XP updated ✅</Text>

          <BigButton title="Play Again" color="#F59E0B" onPress={() => {
            setQIndex(0);
            setScore(0);
            setDone(false);
            setFinalScore(null);
            setQsFeedback(null);
            next();
          }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) return null;

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6" style={{ backgroundColor: '#FFF7ED' }}>
      <TouchableOpacity 
        onPress={onBack} 
        className="absolute top-12 left-6 px-4 py-2 rounded-full" 
        style={{ 
          backgroundColor: '#111827',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Text className="text-white font-semibold">← Back</Text>
      </TouchableOpacity>

      <View style={{
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 28,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
      }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <View style={{
            backgroundColor: '#F59E0B',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
          }}>
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
              Question {qIndex + 1}/8
            </Text>
          </View>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FEF3C7',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#92400E' }}>
              Score: {score}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Animated.View
            style={[
              {
                width: 220,
                height: 180,
                borderRadius: 24,
                overflow: 'hidden',
                borderWidth: 3,
                borderColor: '#F59E0B',
                shadowColor: '#F59E0B',
                shadowOpacity: 0.3,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 8,
              },
              jiggleStyle,
            ]}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : item.imageKey && tileImages[item.imageKey] ? (
              <Image source={tileImages[item.imageKey]} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 64 }}>🧩</Text>
              </View>
            )}
          </Animated.View>

          <Text style={{ fontSize: 26, fontWeight: '800', color: '#111827', marginTop: 16, textAlign: 'center' }}>
            {item.label}
          </Text>
          <Text style={{ color: '#6B7280', fontSize: 14, fontWeight: '600', marginTop: 4 }}>
            Choose the right category
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => answer(choices[0])}
            activeOpacity={0.9}
            style={{
              flex: 1,
              borderRadius: 20,
              padding: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#10B981',
              shadowColor: '#10B981',
              shadowOpacity: 0.3,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', textTransform: 'uppercase' }}>
              {choices[0]?.toUpperCase()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => answer(choices[1])}
            activeOpacity={0.9}
            style={{
              flex: 1,
              borderRadius: 20,
              padding: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F59E0B',
              shadowColor: '#F59E0B',
              shadowOpacity: 0.3,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', textTransform: 'uppercase' }}>
              {choices[1]?.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[{ marginTop: 8 }, qsToastStyle]}>
          {qsFeedback === 'correct' ? (
            <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 }}>
              <Text className="text-green-800 font-extrabold">✅ Correct! +10 XP</Text>
            </View>
          ) : qsFeedback === 'wrong' ? (
            <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 }}>
              <Text className="text-red-800 font-extrabold">✗ Not this group</Text>
            </View>
          ) : null}
        </Animated.View>

        {done ? <Text className="mt-2 text-green-600 font-semibold text-center">Saved! XP updated ✅</Text> : null}
      </View>
    </SafeAreaView>
  );
}

/* ======================= FIND EMOJI — Reanimated v3 (web-safe) ======================= */
function FindEmoji({ onBack }: { onBack: () => void }) {
// Create a safe pool: must have a visual (emoji/image) and always have a label
const POOL: Tile[] = useMemo(() => {
  const list = (EMOTIONS || []).filter(Boolean).filter(t => t.emoji || (t as any).imageKey);
  return list.map((t) => ({
    ...t,
    // derive a readable label if missing
    label: t.label ?? (typeof t.id === 'string'
      ? t.id.replace(/[_-]+/g, ' ')
      : String(t.id)
    ),
  }));
}, []);


  const TOTAL = 6;
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  // Frozen per-round data
  const [target, setTarget] = useState<Tile | null>(null);
  const [options, setOptions] = useState<Tile[]>([]);
  const [freezeKey, setFreezeKey] = useState(0);
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const [feedback, setFeedback] = useState<null | "correct" | "wrong">(null);
  const [finalScore, setFinalScore] = useState<{ correct: number; total: number; xp: number } | null>(null);

  // Reanimated values (already imported at top of file)
  const scale = useSharedValue(1);
  const toastOpacity = useSharedValue(0);
  const toastY = useSharedValue(12);

  const emojiStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
    transform: [{ translateY: toastY.value }],
  }));

  const pulse = () => {
    scale.value = 1;
    scale.value = withSpring(1.06, { damping: 14, stiffness: 240 }, () => {
      scale.value = withSpring(1, { damping: 14, stiffness: 220 });
    });
  };

  const showToast = () => {
    toastOpacity.value = 0;
    toastY.value = 12;
    toastOpacity.value = withTiming(1, { duration: 180 });
    toastY.value = withTiming(0, { duration: 180 });
    setTimeout(() => { toastOpacity.value = withTiming(0, { duration: 220 }); }, 420);
  };

  const makeRound = useCallback(() => {
    if (!POOL.length) return;
    const correct = POOL[Math.floor(Math.random() * POOL.length)];
    const wrongs = shuffle(POOL.filter(t => t.id !== correct.id)).slice(0, 3);
    const opts = shuffle([correct, ...wrongs]); // 4 options, frozen for this round

    setTarget(correct);
    setOptions(opts);
    setFreezeKey(Date.now());   // keep FlatList stable this round
    setFeedback(null);
    setLocked(false);
    pulse();
  }, [POOL]);

  useEffect(() => { if (POOL.length) makeRound(); }, [POOL.length, makeRound]);

  const afterAnswer = (ok: boolean) => {
    if (round >= TOTAL) {
      const finalCorrect = score + (ok ? 1 : 0);
      const xp = finalCorrect * 10;
      setFinalScore({ correct: finalCorrect, total: TOTAL, xp });
      setFinished(true);
      setAllCorrect(finalCorrect === TOTAL);
      speak(finalCorrect === TOTAL ? 'Perfect score! Amazing!' : `Well done! You got ${finalCorrect} out of ${TOTAL}!`);
      (async () => {
        try {
          await recordGame(xp);
          await logGameAndAward({
            type: "emoji",
            correct: finalCorrect,
            total: TOTAL,
            accuracy: (finalCorrect / TOTAL) * 100,
            xpAwarded: xp,
          });
        } catch {}
      })();
    } else {
      setRound(r => r + 1);
      setTimeout(makeRound, 420);
    }
  };

  const onPick = (item: Tile) => {
    if (locked || !target) return;
    setLocked(true);
    const ok = item.id === target.id;
    setFeedback(ok ? "correct" : "wrong");
    if (ok) setScore(s => s + 1);
    showToast();
    pulse();
    setTimeout(() => afterAnswer(ok), 260);
  };

  if (!POOL.length || !target || options.length !== 4) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
        <TouchableOpacity onPress={onBack} className="absolute top-12 left-6 px-4 py-2 rounded-full" style={{ backgroundColor: '#000' }}>
          <Text className="text-white font-semibold">← Back</Text>
        </TouchableOpacity>
        <View className="rounded-3xl p-6 bg-white border border-gray-200">
          <Text>No emoji tiles found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Game finished - show completion screen
  if (finished && finalScore) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
        <TouchableOpacity onPress={onBack} className="absolute top-12 left-6 px-4 py-2 rounded-full" style={{ backgroundColor: '#000' }}>
          <Text className="text-white font-semibold">← Back</Text>
        </TouchableOpacity>

        <View className="w-full max-w-xl rounded-3xl p-6 bg-white border border-gray-200 items-center">
          <Text className="text-6xl mb-4">{allCorrect ? '🎉' : '🎊'}</Text>
          <Text className="text-3xl font-extrabold text-gray-900 mb-2">
            {allCorrect ? 'Perfect Score!' : 'Game Complete!'}
          </Text>
          <Text className="text-xl text-gray-600 mb-6">
            You got {finalScore.correct} out of {finalScore.total} correct!
          </Text>

          <View className="w-full bg-gray-50 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-700 font-semibold">Final Score:</Text>
              <Text className="text-gray-900 font-extrabold text-lg">
                {finalScore.correct}/{finalScore.total}
              </Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-700 font-semibold">Accuracy:</Text>
              <Text className="text-gray-900 font-extrabold text-lg">
                {Math.round((finalScore.correct / finalScore.total) * 100)}%
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700 font-semibold">XP Earned:</Text>
              <Text className="text-green-600 font-extrabold text-lg">+{finalScore.xp} XP</Text>
            </View>
          </View>

          <Text className="text-green-600 font-semibold text-center mb-4">Saved! XP updated ✅</Text>

          <BigButton title="Play Again" color="#2563EB" onPress={() => {
            setRound(1);
            setScore(0);
            setFinished(false);
            setAllCorrect(false);
            setFinalScore(null);
            setFeedback(null);
            setLocked(false);
            makeRound();
          }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
      <TouchableOpacity onPress={onBack} className="absolute top-12 left-6 px-4 py-2 rounded-full" style={{ backgroundColor: '#000' }}>
        <Text className="text-white font-semibold">← Back</Text>
      </TouchableOpacity>

      <View className="w-full max-w-xl rounded-3xl p-6 bg-white border border-gray-200 items-center">
        <Text className="text-xs text-gray-500">Round {round}/{TOTAL}</Text>

        <Animated.View style={[{ marginTop: 12, alignItems: "center" }, emojiStyle]}>
          <Text style={{ fontSize: 72 }}>{target.emoji || "🙂"}</Text>
        </Animated.View>
        <Text className="text-gray-600 mt-2">What feeling is this?</Text>

        <FlatList
          style={{ width: "100%", marginTop: 10 }}
          data={options.map(o => ({ ...o, _k: freezeKey }))} // frozen keys
          keyExtractor={(it, i) => `${it.id}-${freezeKey}-${i}`}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          bounces={false}
          overScrollMode="never"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onPick(item)}
              activeOpacity={0.9}
              disabled={locked}
              style={{
                width: "48%",
                paddingVertical: 14,
                marginBottom: 10,
                borderRadius: 16,
                backgroundColor: "#F3F4F6",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
             <Text className="font-extrabold text-gray-900">
                {item.label ?? (typeof item.id === 'string' ? item.id.replace(/[_-]+/g, ' ') : String(item.id))}
        </Text>


            </TouchableOpacity>
          )}
        />

        <Animated.View style={[{ marginTop: 6 }, toastStyle]}>
          {feedback === "correct" ? (
            <View style={{ backgroundColor: "#DCFCE7", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 }}>
              <Text className="text-green-800 font-extrabold">✅ Correct! +10 XP</Text>
            </View>
          ) : feedback === "wrong" ? (
            <View style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 }}>
              <Text className="text-red-800 font-extrabold">✗ Oops! Try the next one</Text>
            </View>
          ) : null}
        </Animated.View>

        <Text className="mt-3 text-gray-700">
          Score: <Text className="font-extrabold">{score}</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}





// -------------------- Menu screen --------------------
type GameKey = 'menu' | 'tap' | 'match' | 'sort' | 'emoji';

type MenuGame = {
  id: GameKey;
  title: string;
  emoji: string;
  description: string;
  color: string;
  gradient: [string, string];
  icon?: any;
};

function GameCard({ game, index, onPress }: { game: MenuGame; index: number; onPress: () => void }) {
  const press = useSharedValue(0);
  const softGradient = useMemo<[string, string]>(
    () => [`${game.gradient[0]}1C`, `${game.gradient[1]}05`],
    [game.gradient]
  );

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.04 }],
  }));

  return (
    <Animated.View
      style={menuStyles.gameCardWrapper}
      entering={FadeInUp.delay(index * 90).springify().damping(14)}
    >
      <TouchableOpacity
        onPressIn={() => (press.value = withTiming(1, { duration: 100 }))}
        onPressOut={() => (press.value = withTiming(0, { duration: 160 }))}
        onPress={onPress}
        activeOpacity={0.92}
      >
        <Animated.View style={[menuStyles.gameCard, pressStyle]}
        >
          <LinearGradient colors={softGradient} style={menuStyles.cardGlow} />

          <View style={menuStyles.cardHeader}>
            <View style={[menuStyles.iconBadge, { backgroundColor: game.color + '1A' }]}>
              <Text style={menuStyles.iconEmoji}>{game.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={menuStyles.cardTitle}>{game.title}</Text>
              <Text style={menuStyles.cardSubtitle}>{game.description}</Text>
            </View>
            <View style={[menuStyles.playBadge, { backgroundColor: game.color + '1F' }]}
            >
              <Ionicons name="play" size={20} color={game.color} />
            </View>
          </View>

          <LinearGradient
            colors={game.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={menuStyles.progressBar}
          />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function GamesScreen() {
  // Enable scrolling only when content exceeds viewport
  const [containerH, setContainerH] = useState(0);
  const [contentH, setContentH] = useState(0);
  const [screen, setScreen] = useState<GameKey>('menu');
  const [stats, setStats] = useState<{ xp?: number; streakDays?: number } | null>(null);

  const heroFloat = useSharedValue(0);
  const headerReveal = useSharedValue(0);

  useEffect(() => {
    headerReveal.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
    heroFloat.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [headerReveal, heroFloat]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerReveal.value,
    transform: [{ translateY: (1 - headerReveal.value) * 24 }],
  }));

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (heroFloat.value - 0.5) * 10 }],
  }));

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchMyStats();
        setStats({ xp: s?.xp ?? 0, streakDays: s?.streakDays ?? 0 });
      } catch {}
    })();
  }, []);

  if (screen === 'tap') return <TapTiming onBack={() => setScreen('menu')} />;
  if (screen === 'match') return <PictureMatch onBack={() => setScreen('menu')} />;
  if (screen === 'sort') return <QuickSort onBack={() => setScreen('menu')} />;
  if (screen === 'emoji') return <FindEmoji onBack={() => setScreen('menu')} />;

  // Menu UI with beautiful cards
  const games: MenuGame[] = [
    {
      id: 'tap',
      title: 'Tap Timing',
      emoji: '🎯',
      description: 'Test your timing skills! Tap when the timer matches the target.',
      color: '#6366F1',
      gradient: ['#6366F1', '#8B5CF6'] as [string, string],
      icon: images.tapIcon,
    },
    {
      id: 'match',
      title: 'Picture Match',
      emoji: '🖼️',
      description: 'Find the matching picture from the options shown.',
      color: '#22C55E',
      gradient: ['#22C55E', '#10B981'] as [string, string],
    },
    {
      id: 'sort',
      title: 'Quick Sort',
      emoji: '🍎',
      description: 'Sort items into the correct categories!',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#F97316'] as [string, string],
    },
    {
      id: 'emoji',
      title: 'Find the Emoji',
      emoji: '😊',
      description: 'Match the feeling shown by the emoji!',
      color: '#06B6D4',
      gradient: ['#06B6D4', '#3B82F6'] as [string, string],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={['#E0F2FE', '#F1F5FF', '#FFFFFF'] as [string, string, string]}
          style={StyleSheet.absoluteFillObject}
        />
        <ScrollView
          style={{ flex: 1 }}
          onLayout={(e) => setContainerH(e.nativeEvent.layout.height)}
          onContentSizeChange={(_, h) => setContentH(h)}
          scrollEnabled={contentH > containerH + 10}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          alwaysBounceVertical={false}
          overScrollMode="never"
          nestedScrollEnabled={false}
        >
          {/* Header */}
          <Animated.View style={[menuStyles.headerWrap, headerStyle]}>
            <Animated.View style={[menuStyles.heroBadge, heroStyle]}>
              <LinearGradient
                colors={['#3B82F6', '#6366F1']}
                style={menuStyles.heroGradient}
              >
                <Ionicons name="game-controller" size={40} color="#fff" />
              </LinearGradient>
            </Animated.View>
            <Text style={menuStyles.heroTitle}>Games</Text>
            {stats && (
              <Animated.View
                entering={FadeInDown.delay(120).springify().damping(18)}
                style={menuStyles.statsRow}
              >
                <View style={menuStyles.statChip}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={menuStyles.statText}>{stats.xp} XP</Text>
                </View>
                <View style={menuStyles.statChip}>
                  <Ionicons name="flame" size={16} color="#F97316" />
                  <Text style={menuStyles.statText}>{stats.streakDays} days</Text>
                </View>
              </Animated.View>
            )}
          </Animated.View>

          {/* Games Grid */}
          <Animated.Text
            entering={FadeInDown.delay(220)}
            style={menuStyles.sectionHeading}
          >
            Choose a Game
          </Animated.Text>
          <View style={{ gap: 18 }}>
            {games.map((game, index) => (
              <GameCard
                key={game.id}
                game={game}
                index={index}
                onPress={() => setScreen(game.id as GameKey)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// -------------------- Tiny animation helpers --------------------
function useScaleStyle(v: any) {
  return useAnimatedStyle(() => ({ transform: [{ scale: v.value }] }));
}
function animatePulse(v: any, good: boolean) {
  v.value = withTiming(good ? 1.06 : 0.94, { duration: 160 }, () => {
    v.value = withSpring(1, { damping: 14, stiffness: 240 });
  });
}
function useJiggleStyle(v: any) {
  return useAnimatedStyle(() => ({ transform: [{ translateX: v.value }] }));
}
function animateCorrect(v: any) {
  v.value = 0;
  v.value = withTiming(8, { duration: 90 }, () => {
    v.value = withSpring(0, { damping: 12, stiffness: 240 });
  });
}
function animateWrong(v: any) {
  v.value = 0;
  v.value = withTiming(-8, { duration: 90 }, () => {
    v.value = withSpring(0, { damping: 12, stiffness: 240 });
  });
}

// -------------------- Small components --------------------
function ChoiceCard({ tile, onPress }: { tile?: Tile; onPress: () => void }) {
  if (!tile || !tile.id) return null;
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      style={[{ width: '31%', aspectRatio: 1, marginBottom: 10, borderRadius: 14, overflow: 'hidden' }, style]}
    >
      <TouchableOpacity
        onPress={() => {
          // Call the game callback immediately — no waiting
          onPress();
          // Run button pop animation in parallel (purely visual)
          cancelAnimation(scale);
          scale.value = withTiming(1.05, { duration: 70 }, (f) => {
            if (f) scale.value = withSpring(1, { damping: 16, stiffness: 280 });
          });
        }}
        activeOpacity={0.9}
        style={{ flex: 1, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' }}
      >
        {tile.imageUrl ? (
          <Image source={{ uri: tile.imageUrl }} style={{ width: '100%', height: '78%' }} resizeMode="cover" />
        ) : tile.imageKey && tileImages[tile.imageKey] ? (
          <Image source={tileImages[tile.imageKey]} style={{ width: '100%', height: '78%' }} resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-4xl">🧩</Text>
          </View>
        )}
        <View style={{ height: '22%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
          <Text className="font-bold text-gray-800" numberOfLines={1}>
            {tile.label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// -------------------- utils --------------------
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const menuStyles = StyleSheet.create({
  headerWrap: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 16,
  },
  heroBadge: {
    width: 94,
    height: 94,
    borderRadius: 47,
    marginBottom: 14,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  heroGradient: {
    flex: 1,
    borderRadius: 47,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 4,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statText: {
    marginLeft: 6,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  gameCardWrapper: {
    width: '100%',
  },
  gameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '65%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 16,
  },
  iconBadge: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 34,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  playBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 5,
    borderRadius: 999,
  },
});
