import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GameContainer } from '../../../components/games/Level1/GameContainer';
import { DrawingCanvas, DrawingCanvasRef } from '../../../components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '../../../components/games/Level1/ConfettiEffect';
import { Audio } from 'expo-av';

export default function Game1Screen() {
  const router = useRouter();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const playSuccessSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/success.mp3') // Placeholder path
      );
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 2000);
    } catch (e) {
      console.log('Audio disabled or missing', e);
    }
  };

  const handleStrokeStart = () => {
    setIsDrawing(true);
  };

  const handleStrokeEnd = () => {
    setIsDrawing(false);
    // Give immediate visual feedback that they did something
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setIsCompleted(false);
    setShowConfetti(false);
  };

  const handleDone = () => {
    if (canvasRef.current?.getStrokeCount() === 0) {
      // Maybe show a gentle prompt "Try drawing something first!"
      return;
    }
    
    setIsCompleted(true);
    setShowConfetti(true);
    playSuccessSound();

    // In a real app, you might save progress to a context/store here
    setTimeout(() => {
      // router.push('/level1/session1/game2'); // Or return to hub
      router.back();
    }, 3000);
  };

  return (
    <GameContainer title="Free Scribble" currentStep={1} totalSteps={5}>
      <View className="flex-1 p-4 relative">
        {/* Instruction Header */}
        <View className="items-center mb-4">
          <Text className="text-xl font-bold text-gray-800 text-center">
            Draw whatever you like!
          </Text>
          <Text className="text-md text-gray-500 text-center mt-1">
            Fill the canvas with colors.
          </Text>
        </View>

        {/* Canvas Area */}
        <View className="flex-1 border-4 border-indigo-100 rounded-[32px] overflow-hidden bg-white shadow-sm mb-4 relative">
          <DrawingCanvas 
            ref={canvasRef}
            brushSize={15} // Thick brush for kids
            randomColors={true}
            onStrokeStart={handleStrokeStart}
            onStrokeEnd={handleStrokeEnd}
          />
          
          {/* Optional sparkle overlay while drawing could be added here */}
          {isDrawing && (
            <View className="absolute top-4 right-4 bg-indigo-500/10 px-3 py-1 rounded-full">
              <Text className="text-indigo-600 font-bold">✨ Drawing...</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View className="flex-row justify-between mb-4 px-2">
          <TouchableOpacity 
            onPress={handleClear}
            className="bg-gray-100 py-3 px-6 rounded-2xl flex-row items-center justify-center"
            disabled={isCompleted}
          >
            <Ionicons name="trash-outline" size={24} color="#4B5563" />
            <Text className="text-gray-600 font-bold ml-2 text-lg">Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleDone}
            className="bg-green-500 py-3 px-8 rounded-2xl flex-row items-center justify-center shadow-sm"
            disabled={isCompleted}
          >
            <Text className="text-white font-bold text-xl mr-2">Done</Text>
            <Ionicons name="checkmark-circle" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {showConfetti && <ConfettiEffect />}
      </View>
    </GameContainer>
  );
}
