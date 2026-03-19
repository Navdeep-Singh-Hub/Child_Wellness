import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';

interface GameCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isLocked?: boolean;
  isCompleted?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  icon,
  color,
  isLocked = false,
  isCompleted = false,
  onPress,
  style
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    if (isLocked) return;
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    if (isLocked) return;
    scale.value = withSpring(1);
    onPress();
  };

  return (
    <AnimatedTouchable
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLocked}
      style={[animatedStyle, style]}
      className={`w-full p-6 rounded-3xl flex-row items-center justify-between mb-4 shadow-sm border ${
        isLocked ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-100'
      }`}
    >
      <View className="flex-row items-center flex-1 pr-4">
        {/* Icon Circle */}
        <View 
          className="w-16 h-16 rounded-full items-center justify-center mr-4"
          style={{ backgroundColor: isLocked ? '#E5E7EB' : color }}
        >
          <Ionicons 
            name={isLocked ? 'lock-closed' : (isCompleted ? 'checkmark-circle' : icon)} 
            size={32} 
            color="white" 
          />
        </View>
        
        {/* Text Content */}
        <View className="flex-1">
          <Text 
            className={`text-xl font-bold mb-1 ${isLocked ? 'text-gray-400' : 'text-gray-800'}`}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text 
            className={`text-sm ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}
            numberOfLines={2}
          >
            {isLocked ? 'Complete previous game to unlock' : description}
          </Text>
        </View>
      </View>

      {/* Action Indicator */}
      {!isLocked && !isCompleted && (
        <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
          <Ionicons name="play" size={20} color="#4F46E5" style={{ marginLeft: 2 }} />
        </View>
      )}
      {isCompleted && (
        <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center">
          <Ionicons name="checkmark" size={24} color="#22C55E" />
        </View>
      )}
    </AnimatedTouchable>
  );
};
