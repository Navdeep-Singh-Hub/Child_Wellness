import { fetchMyStats } from '@/utils/api';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, Text, View } from 'react-native';

type Stats = { xp: number; coins: number; hearts: number; streakDays: number; bestStreak?: number };

export default function Index() {
  const [stats, setStats] = useState<Stats | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const s = await fetchMyStats();
      setStats(s);
    } catch {}
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome */}
        <View className="items-center mb-6 mt-10">
          <Text className="text-3xl font-extrabold text-gray-900">Welcome to Child Wellness</Text>
          <Text className="text-gray-600 mt-1 mb-6">Track progress and keep the streak!</Text>
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

        <View className="flex-row justify-between mt-4">
          {/* Hearts Card */}
          <View className="w-[48%] bg-[#FFF1F2] border border-[#FECDD3] rounded-3xl p-5">
            <Text className="text-sm font-semibold text-[#9F1239]">Hearts</Text>
            <Text className="text-4xl font-extrabold text-[#BE123C] mt-2">{hearts}</Text>
            <Text className="text-xs text-[#BE123C] mt-1">lives remaining</Text>
          </View>

          {/* Spacer card to balance grid */}
          <View className="w-[48%] bg-transparent" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
