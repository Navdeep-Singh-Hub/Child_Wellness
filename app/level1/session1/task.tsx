import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GameContainer } from '../../../components/games/Level1/GameContainer';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

export default function TaskScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImage(result.assets[0].uri);
        setError(null);
      }
    } catch (e) {
      setError('Failed to pick an image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError('Sorry, we need camera permissions to make this work!');
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setImage(result.assets[0].uri);
        setError(null);
      }
    } catch (e) {
      setError('Failed to take a photo');
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    setError(null);

    // Mock API Call delay
    setTimeout(() => {
      setIsAnalyzing(false);
      
      // In a real app, this would hit: POST /api/verify-scribble
      // Mock Success Response
      const isSuccess = Math.random() > 0.2; // 80% chance of success for demo

      if (isSuccess) {
        playSuccessSound();
        router.push('/level1/session1/result');
      } else {
        setError('Could not detect clear scribbles. Please try taking a brighter photo!');
      }
    }, 2500);
  };

  return (
    <GameContainer title="Photo Challenge" currentStep={5} totalSteps={5}>
      <View className="flex-1 p-6 items-center">
        
        <View className="mb-6 items-center">
          <View className="w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-2">
            <Ionicons name="pencil" size={32} color="#F59E0B" />
          </View>
          <Text className="text-2xl font-bold text-gray-800 text-center">
            Time for Paper & Pencil!
          </Text>
          <Text className="text-base text-gray-500 text-center mt-2 px-4">
            Do some free scribbling on a real piece of paper, then ask an adult to help 
            take a photo and upload it here!
          </Text>
        </View>

        {/* Image Preview Area */}
        <View className="w-full aspect-square max-w-sm border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50 overflow-hidden items-center justify-center mb-6">
          {image ? (
            <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="items-center p-4">
              <Ionicons name="image-outline" size={64} color="#9CA3AF" />
              <Text className="text-gray-400 mt-2 text-center">No photo selected</Text>
            </View>
          )}

          {isAnalyzing && (
            <View className="absolute inset-0 bg-white/80 items-center justify-center">
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="text-indigo-600 font-bold mt-4 text-lg">AI is checking...</Text>
            </View>
          )}
        </View>

        {error && (
          <View className="bg-red-50 px-4 py-3 rounded-xl mb-4 w-full max-w-sm flex-row items-center border border-red-100">
            <Ionicons name="alert-circle" size={24} color="#EF4444" />
            <Text className="text-red-600 ml-2 font-medium flex-1">{error}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="w-full max-w-sm">
          {!image ? (
            <View className="flex-row justify-between">
              <TouchableOpacity 
                onPress={takePhoto}
                className="flex-1 bg-indigo-500 py-4 rounded-2xl items-center justify-center mr-2 shadow-sm flex-row"
              >
                <Ionicons name="camera" size={24} color="white" />
                <Text className="text-white font-bold ml-2">Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={pickImage}
                className="flex-1 bg-white border border-indigo-200 py-4 rounded-2xl items-center justify-center ml-2 shadow-sm flex-row"
              >
                <Ionicons name="images" size={24} color="#4F46E5" />
                <Text className="text-indigo-600 font-bold ml-2">Gallery</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row justify-between">
              <TouchableOpacity 
                onPress={() => setImage(null)}
                className="flex-1 bg-gray-100 py-4 rounded-2xl items-center justify-center mr-2 shadow-sm"
                disabled={isAnalyzing}
              >
                <Text className="text-gray-600 font-bold">Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={analyzeImage}
                className="flex-1 bg-green-500 py-4 rounded-2xl items-center justify-center ml-2 shadow-sm flex-row"
                disabled={isAnalyzing}
              >
                <Text className="text-white font-bold text-lg mr-2">Submit</Text>
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

      </View>
    </GameContainer>
  );
}
