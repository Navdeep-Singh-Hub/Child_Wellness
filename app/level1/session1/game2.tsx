import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GameContainer } from '../../../components/games/Level1/GameContainer';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '../../../components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '../../../components/games/Level1/ConfettiEffect';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import Svg, { Path } from 'react-native-svg';

// Simple butterfly outline path
const BUTTERFLY_PATH = "M50,50 C20,20 20,80 50,50 C80,20 80,80 50,50 C20,80 50,110 50,50 C80,80 50,110 50,50"; 
// In a real app, use a much more complex SVG path from an illustrator asset.

export default function Game2Screen() {
  const router = useRouter();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fillPercentage, setFillPercentage] = useState(0);

  const fillProgress = useSharedValue(0);

  useEffect(() => {
    fillProgress.value = withTiming(fillPercentage, { duration: 500 });
  }, [fillPercentage]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value}%`
  }));

  const playSuccessSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/success.mp3') // Placeholder path
      );
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 2000);
    } catch (e) {
      console.log('Audio error', e);
    }
  };

  const handleStrokeEnd = (strokes: Stroke[]) => {
    // Very rough approximation logic for filling for demo purposes.
    // In a production app, checking bounding box coverage of segments vs SVG bounds is needed.
    const approximateCoveragePerStroke = 5; 
    let newPercentage = strokes.length * approximateCoveragePerStroke;
    
    if (newPercentage > 100) newPercentage = 100;
    
    setFillPercentage(newPercentage);

    if (newPercentage >= 60 && !isCompleted) {
      setIsCompleted(true);
      setShowConfetti(true);
      playSuccessSound();
      
      setTimeout(() => {
        router.back();
      }, 4000);
    }
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setFillPercentage(0);
    setIsCompleted(false);
    setShowConfetti(false);
  };

  return (
    <GameContainer title="Color the Shape" currentStep={2} totalSteps={5}>
      <View className="flex-1 p-4 relative">
        {/* Instruction Header */}
        <View className="items-center mb-2">
          <Text className="text-xl font-bold text-gray-800 text-center">
            Scribble inside the Butterfly!
          </Text>
        </View>

        {/* Local Progress Indicator */}
        <View className="w-full max-w-xs self-center mb-4">
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-gray-500 font-bold">Fill Progress</Text>
            <Text className="text-sm font-bold text-indigo-500">{Math.round(fillPercentage)}%</Text>
          </View>
          <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <Animated.View 
              className="h-full bg-indigo-500" 
              style={animatedProgressStyle} 
            />
          </View>
        </View>

        {/* Canvas Area */}
        <View className="flex-1 border-4 border-dashed border-indigo-200 rounded-[32px] overflow-hidden bg-indigo-50/30 relative mb-4">
          
          {/* Shape Overlay (Behind canvas, acting as a guide) */}
          <View style={StyleSheet.absoluteFill} className="items-center justify-center opacity-20 pointer-events-none">
            <Ionicons name="butterfly" size={250} color="#4F46E5" />
          </View>

          <DrawingCanvas 
            ref={canvasRef}
            brushSize={25} // Very thick brush to make filling easier
            randomColors={true}
            onStrokeEnd={handleStrokeEnd}
          />

          {/* Outline Overlay (On top of canvas so strokes don't cover the border) */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none" className="items-center justify-center">
             <Ionicons name="butterfly-outline" size={250} color="#4F46E5" />
          </View>

        </View>

        {/* Controls */}
        <View className="items-center mb-4">
          <TouchableOpacity 
            onPress={handleClear}
            className="bg-gray-100 py-3 px-8 rounded-2xl flex-row items-center justify-center"
            disabled={isCompleted}
          >
            <Ionicons name="trash-outline" size={24} color="#4B5563" />
            <Text className="text-gray-600 font-bold ml-2 text-lg">Restart</Text>
          </TouchableOpacity>
        </View>

        {showConfetti && <ConfettiEffect />}
      </View>
    </GameContainer>
  );
}
