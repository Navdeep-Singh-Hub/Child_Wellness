import { useAuth } from '@/app/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

const LoginButton = () => {
  const { login } = useAuth();

  return (
    <TouchableOpacity
      onPress={() => login()}
      className="bg-blue-600 px-6 py-3 rounded-xl flex-row items-center shadow-sm"
      activeOpacity={0.8}
    >
      <Ionicons name="log-in-outline" size={20} color="white" />
      <Text className="text-white font-semibold ml-2">Log In</Text>
    </TouchableOpacity>
  );
};

export default LoginButton;