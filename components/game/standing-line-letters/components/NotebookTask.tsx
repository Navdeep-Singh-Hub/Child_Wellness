// Notebook Task Component with AI Image Validation for Standing Line Letters
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { playSoundEffect, speakFeedback, stopAllAudio } from '../utils/audio';

interface NotebookTaskProps {
  onComplete: (result: { verticalStrokes: boolean; letterI: boolean; letterL: boolean; letterCount: number }) => void;
  onBack: () => void;
}

export default function NotebookTask({ onComplete, onBack }: NotebookTaskProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ verticalStrokes: boolean; letterI: boolean; letterL: boolean; letterCount: number } | null>(null);

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
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock AI response - in production, replace with actual API call
      const mockResult = {
        vertical_strokes_detected: Math.random() > 0.3, // 70% chance
        letter_I_detected: Math.random() > 0.3,
        letter_L_detected: Math.random() > 0.3,
        estimated_letter_count: Math.floor(Math.random() * 10) + 1, // 1-10 letters
      };

      const analysisResult = {
        verticalStrokes: mockResult.vertical_strokes_detected,
        letterI: mockResult.letter_I_detected,
        letterL: mockResult.letter_L_detected,
        letterCount: mockResult.estimated_letter_count,
      };

      setResult(analysisResult);

      if (analysisResult.verticalStrokes && analysisResult.letterCount >= 3) {
        playSoundEffect('celebration');
        speakFeedback('Great job! You wrote the letters!');
      } else {
        playSoundEffect('incorrect');
        let message = 'Good try! ';
        if (!analysisResult.verticalStrokes) {
          message += 'Try writing straight standing lines to form the letters. ';
        } else if (analysisResult.letterCount < 3) {
          message += `You wrote ${analysisResult.letterCount} letter(s). Try writing at least 3 letters. `;
        }
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
    if (result && result.verticalStrokes && result.letterCount >= 3) {
      onComplete(result);
    } else {
      Alert.alert('Complete the task', 'Please write at least 3 letters in your notebook.');
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
          <Text style={styles.instructionText}>Write the letter I five times</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.instructionText}>Write the letter L five times</Text>
        </View>
        <View style={styles.exampleContainer}>
          <Text style={styles.exampleText}>Example:</Text>
          <View style={styles.exampleLetters}>
            <Text style={styles.exampleLetter}>I I I I I</Text>
            <Text style={styles.exampleLetter}>L L L L L</Text>
          </View>
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
              name={result.verticalStrokes ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={result.verticalStrokes ? '#10B981' : '#EF4444'}
            />
            <Text style={styles.resultText}>
              Vertical Strokes: {result.verticalStrokes ? 'Found ✓' : 'Not found'}
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Ionicons
              name={result.letterI ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={result.letterI ? '#10B981' : '#EF4444'}
            />
            <Text style={styles.resultText}>
              Letter I: {result.letterI ? 'Found ✓' : 'Not found'}
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Ionicons
              name={result.letterL ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={result.letterL ? '#10B981' : '#EF4444'}
            />
            <Text style={styles.resultText}>
              Letter L: {result.letterL ? 'Found ✓' : 'Not found'}
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultText}>
              Letters Found: {result.letterCount}
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
        {result && result.verticalStrokes && result.letterCount >= 3 && (
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
  exampleContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  exampleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  exampleLetters: {
    gap: 8,
  },
  exampleLetter: {
    fontSize: 24,
    fontWeight: '900',
    color: '#3B82F6',
    letterSpacing: 8,
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
