// Upload Screen
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback } from '../utils/audio';

interface UploadScreenProps {
  onComplete: (result: { catWordDetected: boolean; circleDetected: boolean; catDrawingDetected: boolean }) => void;
  onBack: () => void;
}

export default function UploadScreen({ onComplete, onBack }: UploadScreenProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ catWordDetected: boolean; circleDetected: boolean; catDrawingDetected: boolean } | null>(null);

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
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'notebook.jpg',
      } as any);

      // Call backend API
      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/check-drawing`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let fetch set it with boundary
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();
      const analysisResult = {
        catWordDetected: data.catWordDetected || false,
        circleDetected: data.circleDetected || false,
        catDrawingDetected: data.catDrawingDetected || false,
      };

      setResult(analysisResult);

      if (analysisResult.catWordDetected && analysisResult.circleDetected && analysisResult.catDrawingDetected) {
        playSoundEffect('celebration');
        speakFeedback('Great job! You completed all tasks!');
      } else {
        playSoundEffect('incorrect');
        let message = 'Good try! ';
        if (!analysisResult.catWordDetected) {
          message += 'Try writing CAT. ';
        }
        if (!analysisResult.circleDetected) {
          message += 'Try drawing a circle. ';
        }
        if (!analysisResult.catDrawingDetected) {
          message += 'Try drawing a cat. ';
        }
        speakFeedback(message);
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Fallback to mock result for development
      const mockResult = {
        catWordDetected: Math.random() > 0.3,
        circleDetected: Math.random() > 0.3,
        catDrawingDetected: Math.random() > 0.3,
      };
      setResult(mockResult);
      Alert.alert('Note', 'Using mock result. Backend API not available.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    if (result && result.catWordDetected && result.circleDetected && result.catDrawingDetected) {
      onComplete(result);
    } else {
      Alert.alert('Complete the task', 'Please complete all tasks in your notebook.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#6C9EFF', '#FFB6C1', '#7FE7CC'] as [string, string, string]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Upload Your Notebook</Text>
      </View>

      {/* Image Preview */}
      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          {isAnalyzing && (
            <View style={styles.analyzingOverlay}>
              <ActivityIndicator size="large" color="#6C9EFF" />
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
              name={result.catWordDetected ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={result.catWordDetected ? '#10B981' : '#EF4444'}
            />
            <Text style={styles.resultText}>
              Word CAT: {result.catWordDetected ? 'Found ✓' : 'Not found'}
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Ionicons
              name={result.circleDetected ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={result.circleDetected ? '#10B981' : '#EF4444'}
            />
            <Text style={styles.resultText}>
              Circle: {result.circleDetected ? 'Found ✓' : 'Not found'}
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Ionicons
              name={result.catDrawingDetected ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={result.catDrawingDetected ? '#10B981' : '#EF4444'}
            />
            <Text style={styles.resultText}>
              Cat Drawing: {result.catDrawingDetected ? 'Found ✓' : 'Not found'}
            </Text>
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
        {result && result.catWordDetected && result.circleDetected && result.catDrawingDetected && (
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
    backgroundColor: '#6C9EFF',
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
    backgroundColor: '#7FE7CC',
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
    backgroundColor: '#FFB6C1',
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
