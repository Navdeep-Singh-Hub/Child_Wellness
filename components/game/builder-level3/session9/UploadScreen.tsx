// Upload Screen - Camera/Gallery for Session 9
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UploadScreenProps {
  onComplete: (result: {
    catSpellingCorrect: boolean;
    dogSpellingCorrect: boolean;
    batSpellingCorrect: boolean;
    butterflyDetected: boolean;
    symmetryDetected: boolean;
  }) => void;
  onBack: () => void;
}

export default function UploadScreen({ onComplete, onBack }: UploadScreenProps) {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      let result;
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission needed', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission needed', 'Gallery permission is required to select photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'notebook.jpg',
      } as any);

      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/builder/check-session-9`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onComplete({
        catSpellingCorrect: result.catSpellingCorrect || false,
        dogSpellingCorrect: result.dogSpellingCorrect || false,
        batSpellingCorrect: result.batSpellingCorrect || false,
        butterflyDetected: result.butterflyDetected || false,
        symmetryDetected: result.symmetryDetected || false,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#FEF3F8', '#F0F4FF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Upload Photo</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Instruction */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>📸 Take a Photo</Text>
          <Text style={styles.instructionText}>
            Take a photo of your notebook page with the words CAT, DOG, BAT and a symmetrical butterfly.
          </Text>
        </Animated.View>

        {/* Image Preview */}
        {image && (
          <Animated.View entering={FadeInDown.delay(400)} style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            <Pressable
              onPress={() => setImage(null)}
              style={styles.removeButton}
            >
              <Ionicons name="close-circle" size={32} color="#EF4444" />
            </Pressable>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <Animated.View entering={FadeInDown.delay(600)} style={styles.buttonWrapper}>
            <Pressable
              onPress={() => pickImage('camera')}
              disabled={uploading}
              style={styles.actionButton}
            >
              <LinearGradient
                colors={['#6C9EFF', '#818CF8']}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="camera" size={32} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Camera</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(700)} style={styles.buttonWrapper}>
            <Pressable
              onPress={() => pickImage('gallery')}
              disabled={uploading}
              style={styles.actionButton}
            >
              <LinearGradient
                colors={['#FFB6C1', '#FF9EC4']}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="images" size={32} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Gallery</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>

        {/* Upload Button */}
        {image && (
          <Animated.View entering={FadeInDown.delay(800)} style={styles.uploadContainer}>
            <Pressable
              onPress={uploadImage}
              disabled={uploading}
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            >
              <LinearGradient
                colors={uploading ? ['#94A3B8', '#64748B'] : ['#10B981', '#16A34A']}
                style={styles.uploadButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {uploading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
                    <Text style={styles.uploadButtonText}>Upload & Check</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 24,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  previewImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  buttonWrapper: {
    flex: 1,
  },
  actionButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  uploadContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
  uploadButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  uploadButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
