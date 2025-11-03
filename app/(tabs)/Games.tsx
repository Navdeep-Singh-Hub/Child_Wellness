// Games.tsx — AAC-friendly games (Tap Timing + Picture Match + Quick Sort + Find Emoji)
// Includes guards for undefined items in FlatList and no conditional/top-level hook misuse.

import * as Speech from 'expo-speech';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CATEGORIES, type Tile, tileImages } from '@/constants/aac';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { fetchMyStats, finishTapRound, logGameAndAward, recordGame, startTapRound } from '@/utils/api';

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
type CatId = 'transport' | 'food' | 'animals' | 'emotions';
function tilesByCat(id: CatId): Tile[] {
  const cat = CATEGORIES.find((c) => c.id === id);
  return cat ? cat.tiles : [];
}
const TRANSPORT = tilesByCat('transport');
const FOOD = tilesByCat('food');
const ANIMALS = tilesByCat('animals');   // optional, not used directly below but kept for future games
const EMOTIONS = tilesByCat('emotions'); // used by Emoji game

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

  const startClientAt = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

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

  const onStart = async () => {
    try {
      setState('running');
      setMsg(null);
      setElapsedMs(0);
      const { roundId, targetSeconds } = await startTapRound();
      setRoundId(roundId);
      setTargetSec(targetSeconds);
      startClientAt.current = Date.now();
      startTicker();
      speak('Wait and tap at the right time!');
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
      setState('done');
      setMsg(
        `Target ${res.targetSeconds}s · Yours ${(elapsedMs / 1000).toFixed(1)}s · Δ ${Math.round(
          res.deltaMs
        )}ms → +${res.pointsAwarded} XP`
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
          accuracy: Math.max(0, 100 - Math.min(Math.abs(res.deltaMs) / 10, 100)), // crude map
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

  useEffect(() => () => stopTicker(), []);

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
      <TouchableOpacity onPress={onBack} className="absolute top-12 left-6 px-4 py-2 rounded-full bg-gray-700">
        <Text className="text-white font-semibold">← Back</Text>
      </TouchableOpacity>

      <Card style={{ alignItems: 'center' }}>
        <Image source={images.tapIcon} style={{ width: 64, height: 64, marginBottom: 6 }} />
        <Text className="font-extrabold text-2xl text-blue-600">Tap Timing</Text>
        <Text className="text-gray-600 mt-1 text-center">
          Wait for the target time, then tap. Targets are 10s, 13s, or 34s.
        </Text>

        <View className="items-center mt-6">
          <Text className="text-6xl font-black text-gray-900">{(elapsedMs / 1000).toFixed(1)}s</Text>
          {targetSec != null ? <Text className="text-gray-500 mt-1">Target: {targetSec}s</Text> : null}
        </View>

        {state !== 'running' ? (
          <BigButton title="Start round" color="#16A34A" onPress={onStart} icon={icons.play} />
        ) : (
          <BigButton title="Tap!" color="#2563EB" onPress={onTap} icon={images.tapNowIcon} />
        )}

        {msg ? <Text className="mt-4 text-center text-gray-800">{msg}</Text> : null}

        {summary ? (
          <View className="mt-4 bg-gray-50 rounded-2xl p-4 w-full">
            <Text className="font-semibold text-gray-800">Total XP: {summary.xp}</Text>
            <Text className="font-semibold text-gray-800 mt-1">Streak: {summary.streak} days</Text>
            <Text className="font-semibold text-gray-800 mt-1">Games: {summary.games}</Text>
          </View>
        ) : null}
      </Card>
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

  const pulse = useSharedValue(1);
  const pulseStyle = useScaleStyle(pulse);

  const next = useCallback(() => {
    const pool = PICTURE_POOL;
    if (!pool.length) return;

    const correct = pool[Math.floor(Math.random() * pool.length)];
    const wrongs = pool.filter((t) => t && t.id !== correct.id);
    shuffle(wrongs);
    const opts = [correct, ...wrongs.slice(0, 2)].filter(Boolean) as Tile[];

    setTarget(correct);
    setChoices(opts);
    if (correct?.label) speak(correct.label);
    pulse.value = 1;
  }, [pulse]);

  useEffect(() => {
    next();
  }, [next]);

  const onPick = async (t: Tile) => {
    const ok = !!target && t?.id === target.id;
    animatePulse(pulse, ok);
    if (ok) setScore((s) => s + 1);

    if (round >= 5) {
      setDone(true);
      const correctCount = score + (ok ? 1 : 0);
      const total = 5;
      const xp = 5 + correctCount * 2;
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
      setTimeout(next, 450);
    }
  };

  if (!target || !(choices && choices.length)) return null;

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
      <TouchableOpacity onPress={onBack} className="absolute top-12 left-6 px-4 py-2 rounded-full bg-gray-700">
        <Text className="text-white font-semibold">← Back</Text>
      </TouchableOpacity>

      <Card>
        <Text className="text-xs text-gray-500">Round {round}/5</Text>
        <Text className="text-2xl font-extrabold text-gray-900 mt-1 text-center">Find: “{target.label}”</Text>

        <Animated.View style={[{ marginTop: 12, alignItems: 'center' }, pulseStyle]}>
          <Text className="text-gray-500 mb-2">Tap the correct picture</Text>
        </Animated.View>

        <View className="mt-2">
          <FlatList
            data={(choices || []).filter(Boolean)}
            keyExtractor={(t, i) => (t && t.id ? String(t.id) : `choice-${i}`)}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (item ? <ChoiceCard tile={item} onPress={() => onPick(item)} /> : null)}
          />
        </View>

        <View className="items-center mt-3">
          <Text className="text-gray-700">
            Score: <Text className="font-extrabold">{score}</Text>
          </Text>
        </View>

        {done ? <Text className="mt-3 text-green-600 font-semibold text-center">Saved! XP updated ✅</Text> : null}
      </Card>
    </SafeAreaView>
  );
}

// -------------------- Game: Quick Sort (Food vs Transport) --------------------
function QuickSort({ onBack }: { onBack: () => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [item, setItem] = useState<Tile | null>(null);
  const [done, setDone] = useState(false);

  const jiggle = useSharedValue(0);
  const jiggleStyle = useJiggleStyle(jiggle);

  const QUESTIONS = useMemo(() => {
    const mix = shuffle([...(FOOD || []).slice(0, 8), ...(TRANSPORT || []).slice(0, 8)]);
    return mix.filter(Boolean).slice(0, 8);
  }, []);

  const next = useCallback(() => {
    const t = QUESTIONS[qIndex];
    if (!t) return;
    setItem(t);
    if (t.label) speak(t.label);
  }, [QUESTIONS, qIndex]);

  useEffect(() => {
    next();
  }, [next]);

  const answer = async (cat: 'Food' | 'Transport') => {
    if (!item) return;
    const isFood = (FOOD || []).some((f) => f?.id === item.id);
    const ok = (cat === 'Food' && isFood) || (cat === 'Transport' && !isFood);

    if (ok) {
      setScore((s) => s + 1);
      animateCorrect(jiggle);
    } else {
      animateWrong(jiggle);
    }

    if (qIndex >= 7) {
      setDone(true);
      const finalCorrect = score + (ok ? 1 : 0);
      const total = 8;
      const xp = 6 + finalCorrect * 2;

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
      setTimeout(next, 400);
    }
  };

  if (!item) return null;

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
      <TouchableOpacity onPress={onBack} className="absolute top-12 left-6 px-4 py-2 rounded-full bg-gray-700">
        <Text className="text-white font-semibold">← Back</Text>
      </TouchableOpacity>

      <Card style={{ alignItems: 'center' }}>
        <Text className="text-xs text-gray-500">Question {qIndex + 1}/8</Text>

        <Animated.View
          style={[
            {
              width: 180,
              height: 140,
              borderRadius: 16,
              overflow: 'hidden',
              marginTop: 8,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            },
            jiggleStyle,
          ]}
        >
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : item.imageKey && tileImages[item.imageKey] ? (
            <Image source={tileImages[item.imageKey]} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View className="flex-1 bg-gray-100 items-center justify-center">
              <Text className="text-5xl">🧩</Text>
            </View>
          )}
        </Animated.View>

        <Text className="mt-3 text-2xl font-extrabold text-gray-900">{item.label}</Text>
        <Text className="text-gray-500 mt-1">Choose the right group</Text>

        <View className="w-full flex-row justify-between mt-4">
          <TouchableOpacity
            onPress={() => answer('Food')}
            activeOpacity={0.92}
            className="flex-1 mr-2 rounded-2xl p-4 items-center justify-center"
            style={{ backgroundColor: '#10B981' }}
          >
            <Text className="text-white font-extrabold text-lg">Food</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => answer('Transport')}
            activeOpacity={0.92}
            className="flex-1 ml-2 rounded-2xl p-4 items-center justify-center"
            style={{ backgroundColor: '#F59E0B' }}
          >
            <Text className="text-white font-extrabold text-lg">Transport</Text>
          </TouchableOpacity>
        </View>

        <Text className="mt-3 text-gray-700">
          Score: <Text className="font-extrabold">{score}</Text>
        </Text>
        {done ? <Text className="mt-2 text-green-600 font-semibold text-center">Saved! XP updated ✅</Text> : null}
      </Card>
    </SafeAreaView>
  );
}

// -------------------- NEW Game: Find the Emoji --------------------
function FindEmoji({ onBack }: { onBack: () => void }) {
  const POOL = (EMOTIONS.length ? EMOTIONS : []).filter((t) => !!t && !!t.emoji);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [target, setTarget] = useState<Tile | null>(null);
  const [choices, setChoices] = useState<Tile[]>([]);
  const [done, setDone] = useState(false);

  const pulse = useSharedValue(1);
  const pulseStyle = useScaleStyle(pulse);

  const next = useCallback(() => {
    if (!POOL.length) return;
    const correct = POOL[Math.floor(Math.random() * POOL.length)];
    const wrongs = POOL.filter((t) => t && t.id !== correct.id);
    const opts = [correct, ...wrongs.slice(0, 2)].filter(Boolean) as Tile[];
    setTarget(correct);
    setChoices(opts);
    if (correct?.emoji) speak(correct.emoji);
    pulse.value = 1;
  }, [POOL, pulse]);

  useEffect(() => {
    if (POOL.length) next();
  }, [next, POOL.length]);

  const onPick = async (t: Tile) => {
    const ok = !!target && t?.id === target.id;
    animatePulse(pulse, ok);
    if (ok) setScore((s) => s + 1);

    if (round >= 6) {
      setDone(true);
      const correctCount = score + (ok ? 1 : 0);
      const total = 6;
      const xp = 5 + correctCount * 2;
      try {
        await recordGame(xp);
        await logGameAndAward({
          type: 'emoji',
          correct: correctCount,
          total,
          accuracy: (correctCount / total) * 100,
          xpAwarded: xp,
        });
      } catch {}
      speak('Awesome!');
    } else {
      setRound((r) => r + 1);
      setTimeout(next, 420);
    }
  };

  if (!POOL.length || !target || !(choices && choices.length)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
        <TouchableOpacity onPress={onBack} className="absolute top-12 left-6 px-4 py-2 rounded-full bg-gray-700">
          <Text className="text-white font-semibold">← Back</Text>
        </TouchableOpacity>
        <Card>
          <Text>No emoji tiles found in Emotions category.</Text>
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
      <TouchableOpacity onPress={onBack} className="absolute top-12 left-6 px-4 py-2 rounded-full bg-gray-700">
        <Text className="text-white font-semibold">← Back</Text>
      </TouchableOpacity>

      <Card style={{ alignItems: 'center' }}>
        <Text className="text-xs text-gray-500">Round {round}/6</Text>

        <Animated.View style={[{ marginTop: 12, alignItems: 'center' }, pulseStyle]}>
          <Text style={{ fontSize: 64 }}>{target.emoji || '🙂'}</Text>
        </Animated.View>

        <Text className="text-gray-600 mt-2">What feeling is this?</Text>

        <View className="w-full mt-3">
          <FlatList
            data={(choices || []).filter(Boolean)}
            keyExtractor={(t, i) => (t && t.id ? String(t.id) : `emoji-${i}`)}
            numColumns={1}
            renderItem={({ item }) =>
              item ? (
                <TouchableOpacity
                  onPress={() => onPick(item)}
                  activeOpacity={0.92}
                  className="mb-2 rounded-2xl p-4 items-center justify-center"
                  style={{ backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' }}
                >
                  <Text className="font-extrabold text-lg text-gray-900">{item.label}</Text>
                </TouchableOpacity>
              ) : null
            }
          />
        </View>

        <Text className="mt-2 text-gray-700">
          Score: <Text className="font-extrabold">{score}</Text>
        </Text>
        {done ? <Text className="mt-2 text-green-600 font-semibold text-center">Saved! XP updated ✅</Text> : null}
      </Card>
    </SafeAreaView>
  );
}

// -------------------- Menu screen --------------------
type GameKey = 'menu' | 'tap' | 'match' | 'sort' | 'emoji';

export default function GamesScreen() {
  const [screen, setScreen] = useState<GameKey>('menu');
  const [stats, setStats] = useState<{ xp?: number; streakDays?: number } | null>(null);

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

  // Menu UI (no refresh/sample buttons)
  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6 bg-white">
      <View className="items-center mb-6">
        <Image source={icons.games} style={{ width: 64, height: 64, marginBottom: 8 }} />
        <Text className="font-extrabold text-3xl text-blue-500">Games</Text>
        {stats ? <Text className="text-gray-600 mt-1">XP {stats.xp} · Streak {stats.streakDays}🔥</Text> : null}
      </View>

      <Card>
        <Text className="text-gray-800 font-bold text-lg">Play & Learn</Text>
        <Text className="text-gray-600 mt-1">Fun, simple games to build everyday knowledge.</Text>

        <BigButton title="🎯 Tap Timing" color="#6366F1" onPress={() => setScreen('tap')} icon={images.tapIcon} />
        <BigButton title="🖼️ Picture Match" color="#22C55E" onPress={() => setScreen('match')} />
        <BigButton title="🍎 vs 🚗 Quick Sort" color="#F59E0B" onPress={() => setScreen('sort')} />
        <BigButton title="😊 Find the Emoji" color="#06B6D4" onPress={() => setScreen('emoji')} />
      </Card>
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
          cancelAnimation(scale);
          scale.value = withTiming(1.05, { duration: 90 }, (f) => {
            if (f) scale.value = withSpring(1, { damping: 18, stiffness: 260 }, () => runOnJS(onPress)());
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
    [arr[i], arr[j]] = [arr[j]];
  }
  return arr;
}
