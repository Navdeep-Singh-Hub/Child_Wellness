import { fetchMyStats } from '@/utils/api';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';
import AnimatedAccuracyRing from '@/components/AnimatedAccuracyRing';

type Stats = { xp: number; coins: number; hearts: number; streakDays: number; bestStreak?: number; accuracy?: number; totalGamesPlayed?: number };

export default function Index() {
  const params = useLocalSearchParams();
  const [stats, setStats] = useState<Stats | null>(null);
  // Enable scroll only when needed
  const [containerH, setContainerH] = useState(0);
  const [contentH, setContentH] = useState(0);
  const prevAccRef = useRef<number>(0);

  const loadStats = useCallback(async () => {
    try {
      const s = await fetchMyStats();
      // animate from previous to new: we just store previous for side effects if you want confetti, etc.
      prevAccRef.current = stats?.accuracy ?? s?.accuracy ?? 0;
      setStats(s);
    } catch {}
  }, [stats?.accuracy]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Refresh stats when refreshStats param changes (triggered by games)
  useEffect(() => {
    if (params.refreshStats) {
      loadStats();
    }
  }, [params.refreshStats, loadStats]);

  useFocusEffect(
    useCallback(() => {
      // Refetch whenever the Home tab gains focus (e.g., after finishing a game)
      loadStats();
      return () => {};
    }, [loadStats])
  );

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  const xp = stats?.xp ?? 0;
  const coins = stats?.coins ?? 0;
  const hearts = stats?.hearts ?? 5;
  const streak = stats?.streakDays ?? 0;
  const bestStreak = stats?.bestStreak ?? 0;
  const accuracy = stats?.accuracy ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        onLayout={(e) => setContainerH(e.nativeEvent.layout.height)}
        onContentSizeChange={(_, h) => setContentH(h)}
        scrollEnabled={contentH > containerH + 1}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome */}
        <View className="items-center mb-8 mt-10">
          <Text className="text-4xl font-extrabold text-gray-900">Welcome to Child Wellness</Text>
          <Text className="text-gray-600 mt-2 mb-2 text-base">Track progress and keep the streak!</Text>
        </View>

        {/* Streak + Resources cards */}
        <View className="flex-row justify-between">
          {/* Current Streak Card */}
          <View className="w-[48%] bg-[#EEF2FF] border border-[#DBEAFE] rounded-3xl p-5">
            <Text className="text-sm font-semibold text-[#3730A3]">Current Streak</Text>
            <Text className="text-4xl font-extrabold text-[#1E3A8A] mt-2">{streak}🔥</Text>
            <Text className="text-xs text-[#1E3A8A] mt-1">days in a row</Text>
          </View>

          {/* Best Streak Card */}
          <View className="w-[48%] bg-[#ECFEFF] border border-[#CFFAFE] rounded-3xl p-5">
            <Text className="text-sm font-semibold text-[#0E7490]">Best Streak</Text>
            <Text className="text-4xl font-extrabold text-[#155E75] mt-2">{bestStreak}⭐</Text>
            <Text className="text-xs text-[#155E75] mt-1">personal best</Text>
          </View>
        </View>

        {/* Resource sections (same UI style) */}
        <View className="flex-row justify-between mt-4">
          {/* XP Card */}
          <View className="w-[48%] bg-[#F0F9FF] border border-[#BAE6FD] rounded-3xl p-5">
            <Text className="text-sm font-semibold text-[#0369A1]">XP</Text>
            <Text className="text-4xl font-extrabold text-[#0C4A6E] mt-2">{xp}</Text>
            <Text className="text-xs text-[#0C4A6E] mt-1">total experience</Text>
          </View>

          {/* Coins Card */}
          <View className="w-[48%] bg-[#FFFBEB] border border-[#FDE68A] rounded-3xl p-5">
            <Text className="text-sm font-semibold text-[#92400E]">Coins</Text>
            <Text className="text-4xl font-extrabold text-[#B45309] mt-2">{coins}</Text>
            <Text className="text-xs text-[#B45309] mt-1">spend in rewards</Text>
          </View>
        </View>

        {/* Hearts Card */}
        <View className="w-full bg-[#FFF1F2] border border-[#FECDD3] rounded-3xl p-5 mt-4">
          <Text className="text-sm font-semibold text-[#9F1239]">Hearts</Text>
          <Text className="text-4xl font-extrabold text-[#BE123C] mt-2">{hearts}</Text>
          <Text className="text-xs text-[#BE123C] mt-1">lives remaining</Text>
        </View>

        {/* Accuracy Card with Animated Ring */}
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 24,
            padding: 20,
            marginTop: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 20,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 2,
            borderWidth: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <AnimatedAccuracyRing
            value={accuracy}
            size={110}
            stroke={12}
            progressColor="#22c55e"
            trackColor="#eef2ff"
            label="Accuracy"
            showPercentText={true}
            durationMs={600}
          />

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}>{Math.round(accuracy)}%</Text>
            <Text style={{ color: "#6b7280", marginTop: 4, fontSize: 13 }}>
              Updated after each game. Keep playing to improve your recent streak!
            </Text>
            {/* Optional: show lifetime totals if you want */}
            {typeof stats?.totalGamesPlayed === "number" && stats.totalGamesPlayed > 0 ? (
              <Text style={{ color: "#9ca3af", marginTop: 6, fontSize: 12 }}>
                Games played: {stats.totalGamesPlayed}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
