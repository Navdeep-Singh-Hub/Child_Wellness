import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ConfettiEffect } from '../../../components/games/Level1/ConfettiEffect';
import Animated, { FadeInDown, FadeIn, withSpring, useSharedValue, useAnimatedStyle, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

export default function ResultScreen() {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);
  
  const starScale = useSharedValue(0);

  useEffect(() => {
    // Play big celebration sound
    const playCheer = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../../assets/sounds/success.mp3') // Ideally a longer "cheer" sound
        );
        await sound.playAsync();
      } catch (e) {
        // audio error
      }
    };
    
    playCheer();
    
    // Animate star popping in
    starScale.value = withDelay(
      500, 
      withSequence(
        withSpring(1.2),
        withSpring(1)
      )
    );

    setTimeout(() => {
      setShowConfetti(true);
    }, 800);
  }, []);

  const animatedStarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: starScale.value }]
  }));

  return (
    <SafeAreaView className="flex-1 bg-indigo-50 items-center justify-center">
      
      <Animated.View 
        entering={FadeInDown.duration(800)}
        className="items-center p-8 bg-white rounded-[40px] shadow-sm border border-indigo-100 w-11/12 max-w-sm"
      >
        
        <Animated.View style={animatedStarStyle} className="mb-6">
          <View className="w-32 h-32 bg-amber-100 rounded-full items-center justify-center border-4 border-white shadow-sm">
            <Ionicons name="star" size={80} color="#FBBF24" />
          </View>
        </Animated.View>

        <Text className="text-4xl font-black text-indigo-600 mb-2 text-center">
          Session Complete!
        </Text>
        
        <Text className="text-lg font-medium text-gray-500 text-center mb-8 px-4">
          You did an amazing job scribbling, coloring, tapping, and drawing!
        </Text>

        <View className="w-full flex-row justify-center space-x-2 mb-8">
           {[1, 2, 3, 4, 5].map((item, i) => (
             <Animated.View 
               key={i}
               entering={FadeIn.delay(800 + (i * 200))}
             >
               <Ionicons name="star" size={24} color="#FBBF24" />
             </Animated.View>
           ))}
        </View>

        <TouchableOpacity 
          onPress={() => router.replace('/level1')}
          className="w-full bg-indigo-500 py-4 rounded-full items-center justify-center shadow-sm flex-row"
        >
          <Text className="text-white font-bold text-xl mr-2">Go to Next Map</Text>
          <Ionicons name="arrow-forward" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.replace('/level1/session1')}
          className="w-full py-4 mt-2 items-center justify-center"
        >
          <Text className="text-indigo-400 font-bold text-lg">Play Again</Text>
        </TouchableOpacity>

      </Animated.View>

      {showConfetti && <ConfettiEffect />}
      
    </SafeAreaView>
  );
}
