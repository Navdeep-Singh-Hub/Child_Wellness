import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GameContainer } from '../../../components/games/Level1/GameContainer';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '../../../components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '../../../components/games/Level1/ConfettiEffect';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Audio } from 'expo-av';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function Game4Screen() {
  const router = useRouter();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [progress, setProgress] = useState(0);

  const glowOpacity = useSharedValue(0.3);
  const progressBarWidth = useSharedValue(0);

  useEffect(() => {
    // Gentle glowing animation for the path to trace
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1, // Infinite
      true
    );
  }, []);

  useEffect(() => {
    progressBarWidth.value = withTiming(progress, { duration: 300 });
  }, [progress]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progressBarWidth.value}%`
  }));

  const playSuccessSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/success.mp3')
      );
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 2000);
    } catch (e) {
      console.log('Audio error', e);
    }
  };

  const handleStrokeEnd = (strokes: Stroke[]) => {
    // Very simplified tracing logic approximation for demonstration.
    // In production, you'd calculate the Hausdorff distance or compare point intersection with the SVG bounding box.
    // Here we'll just see if they drew a reasonably long continuous line as a proxy for "tracing".
    
    const lastStroke = strokes[strokes.length - 1];
    
    if (lastStroke) {
      // Estimate length by rough path string length
      const lengthApproximation = lastStroke.path.length / 5;
      
      let newProgress = Math.min(100, Math.floor(lengthApproximation));
      
      if (newProgress > progress) {
          setProgress(newProgress);
      }

      if (newProgress >= 80 && !isCompleted) {
        setIsCompleted(true);
        setShowConfetti(true);
        playSuccessSound();
        
        setTimeout(() => {
          router.back();
        }, 3000);
      }
    }
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setProgress(0);
    setIsCompleted(false);
    setShowConfetti(false);
  };

  // Simple wavy path
  const TRACE_PATH = "M 50 200 Q 150 50, 200 200 T 350 200";

  return (
    <GameContainer title="Follow the Path" currentStep={4} totalSteps={5}>
      <View className="flex-1 p-4 relative">
        <View className="items-center mb-2">
          <Text className="text-xl font-bold text-gray-800 text-center">
            Trace the glowing path!
          </Text>
        </View>

        {/* Progress Display */}
        <View className="w-full max-w-xs self-center mb-4">
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-gray-500 font-bold">Tracing Progress</Text>
            <Text className="text-sm font-bold text-amber-500">{progress}%</Text>
          </View>
          <View className="h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
            <Animated.View 
              className="h-full bg-amber-400 rounded-full" 
              style={animatedProgressStyle} 
            />
          </View>
        </View>

        {/* Canvas Area */}
        <View className="flex-1 border-4 border-amber-100 rounded-[32px] overflow-hidden bg-white relative mb-4">
          
          {/* Target Path (Animated Glow) */}
          <View style={StyleSheet.absoluteFill} className="pointer-events-none" pointerEvents="none">
            <Svg style={StyleSheet.absoluteFill}>
              <AnimatedPath
                d={TRACE_PATH}
                stroke="#FBBF24" // Amber 400
                strokeWidth={40} // Very thick and forgiving path
                strokeLinecap="round"
                fill="none"
                animatedProps={useAnimatedProps(() => ({
                  strokeOpacity: glowOpacity.value
                }))}
              />
              {/* Core solid path so it's always visible */}
              <AnimatedPath
                d={TRACE_PATH}
                stroke="#F59E0B" // Amber 500
                strokeWidth={15}
                strokeLinecap="round"
                fill="none"
                opacity={0.5}
              />
            </Svg>
          </View>

          <DrawingCanvas 
            ref={canvasRef}
            brushSize={20} // Thick brush
            randomColors={false}
            canvasColor="transparent"
            onStrokeEnd={handleStrokeEnd}
          />

        </View>

        {/* Controls */}
        <View className="items-center mb-4">
          <TouchableOpacity 
            onPress={handleClear}
            className="bg-gray-100 py-3 px-8 rounded-2xl flex-row items-center justify-center"
            disabled={isCompleted}
          >
            <Ionicons name="refresh" size={24} color="#4B5563" />
            <Text className="text-gray-600 font-bold ml-2 text-lg">Try Again</Text>
          </TouchableOpacity>
        </View>

        {showConfetti && <ConfettiEffect />}
      </View>
    </GameContainer>
  );
}
