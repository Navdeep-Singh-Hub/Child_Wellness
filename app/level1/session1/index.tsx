import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GameCard } from '../../../components/games/Level1/GameCard';
import { ProgressBar } from '../../../components/games/Level1/GameContainer';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';

export default function Level1Session1Hub() {
  const router = useRouter();
  
  // In a real app, this would come from a global state/context or persistent storage
  const [completedGames, setCompletedGames] = useState<Record<string, boolean>>({
    game1: false,
    game2: false,
    game3: false,
    game4: false,
    task: false,
  });

  // Calculate generic progress
  const totalGames = 5;
  const completedCount = Object.values(completedGames).filter(Boolean).length;

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      <ScrollView className="flex-1 px-4 py-8" showsVerticalScrollIndicator={false}>
        
        {/* Header / Mascot Area */}
        <Animated.View 
          entering={FadeInDown.duration(800).springify()}
          className="items-center mb-8 mt-4"
        >
          <View className="w-24 h-24 bg-indigo-100 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm overflow-hidden">
             {/* Mascot Placeholder - Using an icon for now */}
             <Ionicons name="happy" size={60} color="#4F46E5" />
          </View>
          
          <Text className="text-3xl font-black text-gray-800 text-center">
            Hi! Let's play and draw!
          </Text>
          <Text className="text-base text-gray-500 text-center mt-2 max-w-xs">
            Help me finish these 5 fun drawing games to earn a special badge!
          </Text>
        </Animated.View>

        {/* Progress Card */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(800)}
          className="bg-white p-6 rounded-3xl mb-8 shadow-sm border border-gray-100"
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold text-gray-800">Session Progress</Text>
            <Text className="text-xl font-black text-indigo-500">{completedCount}/{totalGames}</Text>
          </View>
          <ProgressBar current={completedCount} total={totalGames} />
        </Animated.View>

        {/* Game List */}
        <Animated.View entering={FadeInUp.delay(400).duration(800)} className="mb-12">
          <Text className="text-xl font-bold text-gray-800 mb-4 ml-2">Games</Text>

          <GameCard 
            title="Free Scribble"
            description="Draw anything you want on the canvas!"
            icon="brush"
            color="#ec4899" // Pink
            isCompleted={completedGames.game1}
            isLocked={false} // Always unlocked
            onPress={() => router.push('/level1/session1/game1')}
          />

          <GameCard 
            title="Color the Butterfly"
            description="Scribble inside the shape to fill it up!"
            icon="color-fill"
            color="#3b82f6" // Blue
            isCompleted={completedGames.game2}
            isLocked={false} // Would depend on game1 in logic
            onPress={() => router.push('/level1/session1/game2')}
          />

          <GameCard 
            title="Tap to Draw"
            description="Make dots by tapping all over the screen."
            icon="finger-print"
            color="#10b981" // Emerald
            isCompleted={completedGames.game3}
            isLocked={false}
            onPress={() => router.push('/level1/session1/game3')}
          />

          <GameCard 
            title="Follow the Light"
            description="Trace your finger along the glowing path."
            icon="git-commit"
            color="#f59e0b" // Amber
            isCompleted={completedGames.game4}
            isLocked={false}
            onPress={() => router.push('/level1/session1/game4')}
          />

          <GameCard 
            title="Photo Task"
            description="Draw on real paper and take a photo!"
            icon="camera"
            color="#8b5cf6" // Violet
            isCompleted={completedGames.task}
            isLocked={false}
            onPress={() => router.push('/level1/session1/task')}
          />

        </Animated.View>
        
        {/* Bottom pad */}
        <View className="h-12" />
      </ScrollView>
    </SafeAreaView>
  );
}

// Ensure animated entrances work
import { FadeInDown } from 'react-native-reanimated';
