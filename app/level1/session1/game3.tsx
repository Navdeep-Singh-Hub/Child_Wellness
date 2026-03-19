import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GameContainer } from '../../../components/games/Level1/GameContainer';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '../../../components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '../../../components/games/Level1/ConfettiEffect';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { Audio } from 'expo-av';

const AnimatedText = Animated.createAnimatedComponent(Text);

export default function Game3Screen() {
  const router = useRouter();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [tapCount, setTapCount] = useState(0);
  const [showPraise, setShowPraise] = useState(false);
  
  const praiseScale = useSharedValue(0.5);
  const praiseOpacity = useSharedValue(0);

  const playPopSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/pop.mp3') // Placeholder path
      );
      await sound.playAsync();
      // Fast unload since it's a quick pop
      setTimeout(() => sound.unloadAsync(), 500);
    } catch (e) {
      console.log('Audio error (pop)', e);
    }
  };

  const playYaySound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/yay.mp3') // Placeholder path
      );
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 2000);
    } catch (e) {
      console.log('Audio error (yay)', e);
    }
  };

  const showGreatTapping = () => {
    setShowPraise(true);
    playYaySound();
    
    praiseOpacity.value = withTiming(1, { duration: 300 });
    praiseScale.value = withSequence(
      withSpring(1.2),
      withSpring(1)
    );

    setTimeout(() => {
      praiseOpacity.value = withTiming(0, { duration: 500 });
      setTimeout(() => setShowPraise(false), 500);
    }, 2500);
  };

  const handleStrokeStart = () => {
    // In tap mode, stroke start is just a tap
    playPopSound();
  };

  const handleStrokeEnd = (strokes: Stroke[]) => {
    const newCount = strokes.length;
    setTapCount(newCount);
    
    // Give praise every 10 taps to encourage continuation
    if (newCount > 0 && newCount % 10 === 0) {
      showGreatTapping();
    }
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setTapCount(0);
  };

  const animatedPraiseStyle = useAnimatedStyle(() => ({
    opacity: praiseOpacity.value,
    transform: [{ scale: praiseScale.value }]
  }));

  return (
    <GameContainer title="Tap to Draw" currentStep={3} totalSteps={5}>
      <View className="flex-1 p-4 relative">
        <View className="items-center mb-4">
          <Text className="text-xl font-bold text-gray-800 text-center">
            Tap the screen to make dots!
          </Text>
        </View>

        {/* Counter Header */}
        <View className="absolute top-4 right-4 z-10 bg-white/80 px-4 py-2 rounded-full flex-row items-center shadow-sm">
          <Ionicons name="finger-print" size={20} color="#4F46E5" />
          <Text className="text-indigo-600 font-bold ml-2 text-lg">
            Taps: {tapCount}
          </Text>
        </View>

        {/* Canvas Area */}
        <View className="flex-1 border-4 border-indigo-100 rounded-[32px] overflow-hidden bg-white shadow-sm mb-4 relative">
          <DrawingCanvas 
            ref={canvasRef}
            brushSize={30} // Very large dots
            randomColors={true}
            singleDotMode={true} // Special mode for Tap behavior
            onStrokeStart={handleStrokeStart}
            onStrokeEnd={handleStrokeEnd}
          />

          {/* Praise Overlay */}
          {showPraise && (
            <View className="absolute inset-0 items-center justify-center pointer-events-none">
              <AnimatedText 
                className="text-4xl font-black text-green-500 shadow-md text-center bg-white/90 px-8 py-4 rounded-3xl"
                style={animatedPraiseStyle}
              >
                Great Tapping! ⭐
              </AnimatedText>
              <ConfettiEffect />
            </View>
          )}

        </View>

        {/* Controls */}
        <View className="flex-row justify-between mb-4 px-2">
          <TouchableOpacity 
            onPress={handleClear}
            className="bg-gray-100 py-3 px-6 rounded-2xl flex-row items-center justify-center"
          >
            <Ionicons name="trash-outline" size={24} color="#4B5563" />
            <Text className="text-gray-600 font-bold ml-2 text-lg">Clear All</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.back()}
            className="bg-green-500 py-3 px-8 rounded-2xl flex-row items-center justify-center shadow-sm"
          >
            <Text className="text-white font-bold text-xl mr-2">Done</Text>
            <Ionicons name="checkmark-circle" size={28} color="white" />
          </TouchableOpacity>
        </View>
        
      </View>
    </GameContainer>
  );
}
