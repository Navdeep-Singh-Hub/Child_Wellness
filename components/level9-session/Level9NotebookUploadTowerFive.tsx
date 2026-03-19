/**
 * Level 9 (Clockwise) — Session 10 (final), Real World Task: Build a tower using FIVE objects.
 * Upload photo → AI verifies stacked vertical objects. Return SUCCESS or TRY AGAIN.
 * On success: celebration animation, unlock next level.
 */
import { speak } from '@/utils/tts';
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { API_BASE_URL, authHeaders } from '@/utils/api';

const INSTRUCTIONS =
  'Build a tower using FIVE objects.\n\nStack five objects on top of each other (e.g. blocks, books, cups) and take a photo (or upload a picture).';

export function Level9NotebookUploadTowerFive({
  onComplete,
}: {
  onComplete: (correct: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; feedback: string } | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const permission =
      Platform.OS === 'web'
        ? { status: 'granted' as const }
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to photos to upload your picture.');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (pickerResult.canceled) return;
    const uri = pickerResult.assets[0].uri;
    setImageUri(uri);
    setResult(null);
    await uploadImage(uri);
  };

  const takePhoto = async () => {
    const permission =
      Platform.OS === 'web'
        ? { status: 'granted' as const }
        : await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera to take a photo of your tower.');
      return;
    }
    const pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (pickerResult.canceled) return;
    const uri = pickerResult.assets[0].uri;
    setImageUri(uri);
    setResult(null);
    await uploadImage(uri);
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const filename = 'level9-s10-tower-five.jpg';
      const type = 'image/jpeg';

      if (Platform.OS === 'web' && (uri.startsWith('blob:') || uri.startsWith('data:'))) {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('file', blob, filename);
      } else {
        formData.append('file', {
          uri,
          name: filename,
          type,
        } as any);
      }

      const headers = await authHeaders({ multipart: true });
      delete (headers as Record<string, string>)['Content-Type'];

      const res = await fetch(`${API_BASE_URL}/api/upload-level9-s10-tower-five-task`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed: ${res.status}`);
      }
      const data = await res.json();
      const correct = data.correct === true;
      const feedback =
        data.feedback ||
        (correct ? 'SUCCESS! We see a tower of five objects!' : 'TRY AGAIN.');
      setResult({ correct, feedback });
      if (correct) {
        speak('Success! You built a tower with five objects!', 0.75);
        setTimeout(() => onComplete(true), 2200);
      } else {
        speak('Try again. Build a tower using five objects.', 0.75);
        onComplete(false);
      }
    } catch (e: any) {
      setResult({ correct: false, feedback: e?.message || 'Upload failed. Try again.' });
      speak("Let's try again!", 0.7);
      onComplete(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <GameLayout
      title="Real World Task"
      instruction={INSTRUCTIONS}
      icon="🏗️"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        {!result ? (
          <>
            <Text style={styles.taskLabel}>Build a tower using FIVE objects. Then:</Text>
            <Pressable
              onPress={pickImage}
              disabled={uploading}
              style={({ pressed }) => [styles.uploadBtn, pressed && styles.pressed, uploading && styles.disabled]}
              accessibilityLabel="Upload photo"
            >
              {uploading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <>
                  <Text style={styles.uploadEmoji}>📷</Text>
                  <Text style={styles.uploadText}>Upload Photo</Text>
                </>
              )}
            </Pressable>
            <Pressable
              onPress={takePhoto}
              disabled={uploading}
              style={({ pressed }) => [
                styles.uploadBtn,
                styles.secondaryBtn,
                pressed && styles.pressed,
                uploading && styles.disabled,
              ]}
              accessibilityLabel="Take photo"
            >
              <Text style={styles.uploadEmoji}>📸</Text>
              <Text style={[styles.uploadText, styles.secondaryBtnText]}>Take Photo</Text>
            </Pressable>
            {imageUri ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: imageUri }} style={styles.preview} />
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.resultWrap}>
            <Text style={styles.resultEmoji}>{result.correct ? '🎉' : '😊'}</Text>
            <Text style={[styles.resultTitle, result.correct ? styles.resultSuccess : styles.resultTryAgain]}>
              {result.correct ? 'SUCCESS!' : 'TRY AGAIN'}
            </Text>
            <Text style={styles.resultFeedback}>{result.feedback}</Text>
          </View>
        )}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', paddingVertical: 24 },
  taskLabel: { fontSize: 18, fontWeight: '700', color: '#4338CA', marginBottom: 20, textAlign: 'center' },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 22,
    paddingHorizontal: 40,
    borderRadius: 20,
    gap: 12,
    minWidth: 220,
    marginBottom: 16,
  },
  secondaryBtn: { backgroundColor: 'rgba(99,102,241,0.12)' },
  secondaryBtnText: { color: '#4338CA' },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.8 },
  uploadEmoji: { fontSize: 36 },
  uploadText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  previewWrap: { marginTop: 24, borderRadius: 16, overflow: 'hidden', borderWidth: 4, borderColor: 'rgba(99,102,241,0.35)' },
  preview: { width: 240, height: 180 },
  resultWrap: { alignItems: 'center', padding: 24 },
  resultEmoji: { fontSize: 64, marginBottom: 12 },
  resultTitle: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  resultSuccess: { color: '#22C55E' },
  resultTryAgain: { color: '#EF4444' },
  resultFeedback: { fontSize: 18, color: '#475569', textAlign: 'center' },
});
