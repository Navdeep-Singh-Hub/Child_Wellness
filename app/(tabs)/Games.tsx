import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { fetchMyStats, finishTapRound, recordGame, startTapRound } from '@/utils/api';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

type Stats = {
  xp?: number;
  coins?: number;
  hearts?: number;
  streakDays?: number;
  lastPlayedDate?: string | null;
};

type TapStats = { points: number; streakDays: number; totalGamesPlayed: number };

export default function GamesScreen() {
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentGame, setCurrentGame] = useState<'menu' | 'tap-timing'>('menu');

  // Tap timing game states
  const [roundId, setRoundId] = useState<string | null>(null);
  const [targetSec, setTargetSec] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [tapStatus, setTapStatus] = useState<'idle'|'running'|'done'|'error'>('idle');
  const [tapMessage, setTapMessage] = useState<string | null>(null);
  const [tapStats, setTapStats] = useState<TapStats | null>(null);

  const startClientAt = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  // Tap timing game functions
  function stopTicker() {
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = null;
  }
  
  function startTicker() {
    const t0 = Date.now();
    const tick = () => {
      setElapsedMs(Date.now() - (startClientAt.current ?? t0));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }

  const onTapStart = async () => {
    try {
      setTapStatus('running');
      setTapMessage(null);
      setElapsedMs(0);
      const { roundId, targetSeconds } = await startTapRound();
      setRoundId(roundId);
      setTargetSec(targetSeconds);
      startClientAt.current = Date.now();
      startTicker();
    } catch (e: any) {
      setTapStatus('error');
      setTapMessage(`Could not start round: ${e?.message || 'network'}`);
    }
  };

  const onTapFinish = async () => {
    if (tapStatus !== 'running' || !roundId) return;
    stopTicker();
    try {
      const res = await finishTapRound(roundId);
      setTapStatus('done');
      setTapMessage(
        `Target ${res.targetSeconds}s · Your tap ${Math.round(elapsedMs/1000)}s · ` +
        `Δ = ${Math.round(res.deltaMs)}ms → +${res.pointsAwarded} XP`
      );
      setTapStats(res.stats);
    } catch (e: any) {
      setTapStatus('error');
      setTapMessage(`Finish failed: ${e?.message || 'network'}`);
    } finally {
      setRoundId(null);
      setTargetSec(null);
      startClientAt.current = null;
    }
  };

  useEffect(() => () => stopTicker(), []);

  const onPlay = async () => {
    setLoading(true);
    setLastResult(null);
    try {
      const updated = await recordGame(10);
      setLastResult('Recorded +10 XP');
      setStats(updated);
    } catch (e: any) {
      console.error('recordGame failed:', e?.message ?? e);
      setLastResult(`Failed to record${e?.message ? `: ${e.message}` : ''}`);
      Alert.alert('Record game failed', e?.message || 'network error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setLoading(true);
    try {
      const s = await fetchMyStats();
      setStats(s);
    } catch (e: any) {
      console.error('fetchMyStats failed:', e?.message ?? e);
      setLastResult(`Failed to load stats${e?.message ? `: ${e.message}` : ''}`);
      Alert.alert('Fetch stats failed', e?.message || 'network error');
    } finally {
      setLoading(false);
    }
  };

  if (currentGame === 'tap-timing') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6">
        <TouchableOpacity onPress={() => setCurrentGame('menu')} className="absolute top-12 left-6 px-4 py-2 rounded-full bg-gray-600">
          <Text className="text-white font-medium">← Back</Text>
        </TouchableOpacity>
        
        <View className="items-center mb-4">
          <Image source={images.tapIcon} style={{ width: 64, height: 64, marginBottom: 8 }} />
          <Text className="font-bold text-2xl text-blue-500">Tap-Timing</Text>
          <Text className="text-gray-600 mt-1 text-center">
            Wait for the target time, then tap. Targets are 10s, 13s, or 34s.
          </Text>
        </View>

        <View className="mt-8 items-center">
          <View className="flex-row items-center mb-4">
            <Image source={images.timerIcon} style={{ width: 32, height: 32, marginRight: 8 }} />
            <Text className="text-6xl font-extrabold text-gray-800">
              {(elapsedMs/1000).toFixed(1)}s
            </Text>
          </View>
          {targetSec != null && (
            <View className="flex-row items-center">
              <Image source={images.trophyIcon} style={{ width: 24, height: 24, marginRight: 8 }} />
              <Text className="text-gray-500 text-lg">Target: {targetSec}s</Text>
            </View>
          )}
        </View>

        {tapStatus !== 'running' ? (
          <TouchableOpacity onPress={onTapStart} className="mt-8 px-6 py-4 rounded-2xl bg-green-600 flex-row items-center">
            <Image source={icons.play} style={{ width: 24, height: 24, marginRight: 8 }} />
            <Text className="text-white font-semibold text-lg">Start round</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onTapFinish} className="mt-8 px-6 py-6 rounded-full bg-blue-600 flex-row items-center">
            <Image source={images.tapNowIcon} style={{ width: 32, height: 32, marginRight: 8 }} />
            <Text className="text-white font-semibold text-lg">Tap!</Text>
          </TouchableOpacity>
        )}

        {tapMessage ? <Text className="mt-6 text-center text-gray-800">{tapMessage}</Text> : null}

        {tapStats ? (
          <View className="mt-6 items-center bg-gray-100 p-4 rounded-lg">
            <View className="flex-row items-center mb-2">
              <Image source={images.xpIcon} style={{ width: 24, height: 24, marginRight: 8 }} />
              <Text className="text-gray-800 font-semibold">Total XP: {tapStats.points}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Image source={images.streakIcon} style={{ width: 24, height: 24, marginRight: 8 }} />
              <Text className="text-gray-800 font-semibold">Streak: {tapStats.streakDays} days</Text>
            </View>
            <View className="flex-row items-center">
              <Image source={images.starIcon} style={{ width: 24, height: 24, marginRight: 8 }} />
              <Text className="text-gray-800 font-semibold">Games: {tapStats.totalGamesPlayed}</Text>
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center p-6">
      <View className="items-center mb-6">
        <Image source={icons.games} style={{ width: 64, height: 64, marginBottom: 8 }} />
        <Text className="font-bold text-3xl text-blue-400">Games Section</Text>
      </View>

      <TouchableOpacity onPress={() => setCurrentGame('tap-timing')} className="mt-6 px-6 py-4 rounded-full bg-purple-600 flex-row items-center w-full max-w-xs">
        <Image source={images.tapIcon} style={{ width: 32, height: 32, marginRight: 12 }} />
        <Text className="text-white font-medium text-lg">Tap Timing Game</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onPlay} className="mt-3 px-6 py-4 rounded-full bg-green-600 flex-row items-center w-full max-w-xs">
        <Image source={icons.play} style={{ width: 32, height: 32, marginRight: 12 }} />
        <Text className="text-white font-medium text-lg">Play sample game (+10)</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onRefresh} className="mt-3 px-6 py-3 rounded-full bg-blue-600 flex-row items-center w-full max-w-xs">
        <Image source={icons.save} style={{ width: 24, height: 24, marginRight: 12 }} />
        <Text className="text-white text-lg">Refresh stats</Text>
      </TouchableOpacity>

      {loading ? <ActivityIndicator className="mt-4" /> : null}

      {lastResult ? <Text className="mt-4 text-gray-700 text-center">{lastResult}</Text> : null}

      {stats ? (
        <View className="mt-6 items-center bg-gray-100 p-4 rounded-lg w-full max-w-xs">
          <View className="flex-row items-center mb-2">
            <Image source={images.xpIcon} style={{ width: 24, height: 24, marginRight: 8 }} />
            <Text className="text-gray-800 font-semibold">XP: {stats.xp ?? 0}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Image source={images.starIcon} style={{ width: 24, height: 24, marginRight: 8 }} />
            <Text className="text-gray-800 font-semibold">Coins: {stats.coins ?? 0}</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <Image source={images.streakIcon} style={{ width: 24, height: 24, marginRight: 8 }} />
            <Text className="text-gray-800 font-semibold">Hearts: {stats.hearts ?? 5}</Text>
          </View>
          <View className="flex-row items-center">
            <Image source={images.trophyIcon} style={{ width: 24, height: 24, marginRight: 8 }} />
            <Text className="text-gray-800 font-semibold">Streak: {stats.streakDays ?? 0}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
