// Notebook Task Component with AI Image Validation
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';

interface NotebookTaskProps {
  onComplete: (result: { scribble: boolean; circle: boolean; colored: boolean }) => void;
  onBack: () => void;
}

export default function NotebookTask({ onComplete, onBack }: NotebookTaskProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ scribble: boolean; circle: boolean; colored: boolean } | null>(null);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setResult(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your camera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setResult(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    playSoundEffect('click');

    try {
      // Simulate AI analysis (replace with actual OpenAI Vision API call)
      // For now, we'll use a simple simulation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock AI response - in production, replace with actual API call
      const mockResult = {
        scribble_detected: Math.random() > 0.3, // 70% chance
        circle_detected: Math.random() > 0.4, // 60% chance
        colored_circle: Math.random() > 0.5, // 50% chance
      };

      const analysisResult = {
        scribble: mockResult.scribble_detected,
        circle: mockResult.circle_detected,
        colored: mockResult.colored_circle,
      };

      setResult(analysisResult);

      if (analysisResult.scribble && analysisResult.circle && analysisResult.colored) {
        playSoundEffect('celebration');
        speakFeedback('Great job! You completed all the tasks!');
      } else {
        playSoundEffect('incorrect');
        let message = 'Good try! ';
        if (!analysisResult.scribble) message += 'Try adding some scribbling. ';
        if (!analysisResult.circle) message += 'Try drawing a circle. ';
        if (!analysisResult.colored) message += 'Try coloring the circle. ';
        speakFeedback(message);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    if (result && result.scribble && result.circle && result.colored) {
      onComplete(result);
    } else {
      Alert.alert('Complete the tasks', 'Please complete all tasks: scribbling, drawing a circle, and coloring it.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#93C5FD', '#FBCFE8', '#A7F3D0'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Practice in Your Notebook</Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.instructionText}>1. Scribble freely in your notebook</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.instructionText}>2. Draw a circle</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.instructionText}>3. Color the circle</Text>
        </View>
      </View>

      {/* Image Preview */}
      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          {isAnalyzing && (
            <View style={styles.analyzingOverlay}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.analyzingText}>Analyzing...</Text>
            </View>
          )}
        </View>
      )}

      {/* Results */}
      {result && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Results:</Text>
          <View style={styles.resultItem}>
            <Ionicons
              name={result.scribble ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={result.scribble ? '#10B981' : '#EF4444'}
            />
            <Text style={styles.resultText}>Scribbling: {result.scribble ? 'Found ✓' : 'Not found'}</Text>
          </View>
          <View style={styles.resultItem}>
            <Ionicons
              name={result.circle ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={result.circle ? '#10B981' : '#EF4444'}
            />
            <Text style={styles.resultText}>Circle: {result.circle ? 'Found ✓' : 'Not found'}</Text>
          </View>
          <View style={styles.resultItem}>
            <Ionicons
              name={result.colored ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={result.colored ? '#10B981' : '#EF4444'}
            />
            <Text style={styles.resultText}>Colored Circle: {result.colored ? 'Found ✓' : 'Not found'}</Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <Pressable style={styles.uploadButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color="#fff" />
          <Text style={styles.uploadButtonText}>Choose Photo</Text>
        </Pressable>
        <Pressable style={styles.cameraButton} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={24} color="#fff" />
          <Text style={styles.cameraButtonText}>Take Photo</Text>
        </Pressable>
        {image && !isAnalyzing && (
          <Pressable style={styles.analyzeButton} onPress={analyzeImage}>
            <Text style={styles.analyzeButtonText}>Analyze Image</Text>
            <Ionicons name="search" size={20} color="#fff" />
          </Pressable>
        )}
        {result && result.scribble && result.circle && result.colored && (
          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#475569',
  },
  imageContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  analyzingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#475569',
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
