import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

interface GameContainerProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onHelp?: () => void;
  showHelpButton?: boolean;
}

export const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  
  return (
    <View className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mt-4">
      <View 
        className="h-full bg-indigo-500 rounded-full" 
        style={{ width: `${percentage}%` }} 
      />
    </View>
  );
};

export const GameContainer: React.FC<GameContainerProps> = ({ 
  title, 
  currentStep, 
  totalSteps, 
  children,
  onHelp,
  showHelpButton = true
}) => {
  const router = useRouter();

  const playClickSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/click.mp3') // Placeholder, assuming an asset exists or uses system sound
      );
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 1000);
    } catch (e) {
      console.log("Audio play error", e);
    }
  };

  const handleBack = () => {
    playClickSound();
    router.back();
  };

  const handleHelp = () => {
    playClickSound();
    if (onHelp) onHelp();
  };

  return (
    <View className="flex-1 bg-[#F3F4F6] p-6 relative">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <TouchableOpacity 
          onPress={handleBack}
          className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100"
        >
          <Ionicons name="arrow-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        
        <View className="items-center">
          <Text className="text-2xl font-bold text-gray-800">{title}</Text>
          <Text className="text-sm font-medium text-gray-500 mt-1">
            Game {currentStep} of {totalSteps}
          </Text>
        </View>

        {showHelpButton ? (
          <TouchableOpacity 
            onPress={handleHelp}
            className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center"
          >
            <Ionicons name="help" size={24} color="#4F46E5" />
          </TouchableOpacity>
        ) : (
          <View className="w-12 h-12" /> // Spacer for alignment
        )}
      </View>

      <ProgressBar current={currentStep} total={totalSteps} />

      {/* Main Content Area */}
      <View className="flex-1 mt-6 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative">
        {children}
      </View>
    </View>
  );
};
