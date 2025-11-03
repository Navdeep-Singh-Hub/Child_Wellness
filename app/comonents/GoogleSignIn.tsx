import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function GoogleSignInButton({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress || (() => {})}
      className="bg-white border-2 border-gray-200 rounded-xl py-4 shadow-sm"
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-center">
        <Ionicons name="logo-google" size={20} color="#EA4335" />
        <Text className="text-gray-900 font-semibold text-lg ml-3">
          Continue with Google
        </Text>
      </View>
    </TouchableOpacity>
  );
}