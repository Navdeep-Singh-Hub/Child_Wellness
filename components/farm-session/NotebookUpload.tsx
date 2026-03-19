/**
 * NotebookUpload.tsx — Farm Notebook Activity
 * Draw 3 cows + number 3, or write C words (cat, cow, cap) + drawings. Upload photo → AI check.
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
import { GameLayout } from './GameLayout';
import { API_BASE_URL, authHeaders } from '@/utils/api';

const INSTRUCTIONS =
  '1. Draw 3 cows in your notebook and write the number 3.\n\nOR\n\n2. Write three words that start with C: cat, cow, cap — then draw the objects.';

export function NotebookUpload({
  onComplete,
}: {
  onComplete: (correct: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    feedback: string;
    objects_detected?: boolean;
    correct_count?: boolean;
    c_words_present?: boolean;
  } | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const permission =
      Platform.OS === 'web'
        ? { status: 'granted' as const }
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to photos to upload your notebook.');
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

  const uploadImage = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const filename = 'notebook.jpg';
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

      const res = await fetch(`${API_BASE_URL}/api/upload-task`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed: ${res.status}`);
      }
      const data = await res.json();
      const correct =
        data.correct !== undefined && data.correct !== null
          ? data.correct
          : data.objects_detected != null && data.correct_count != null && data.c_words_present != null
            ? !!(data.objects_detected && data.correct_count && data.c_words_present)
            : true;
      const feedback = data.feedback || (correct ? 'Great drawing!' : "Let's try again!");
      setResult({
        correct,
        feedback,
        objects_detected: data.objects_detected,
        correct_count: data.correct_count,
        c_words_present: data.c_words_present,
      });
      if (correct) {
        speak('Great job!');
        setTimeout(() => onComplete(true), 2200);
      } else {
        speak("Let's try again!");
        onComplete(false);
      }
    } catch (e: any) {
      setResult({
        correct: false,
        feedback: e?.message || 'Upload failed. Try again.',
      });
      speak("Let's try again!");
      onComplete(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <GameLayout
      title="Farm Notebook Activity"
      instruction={INSTRUCTIONS}
    >
      <View style={styles.content}>
        {!result ? (
          <>
            <Pressable
              onPress={pickImage}
              disabled={uploading}
              style={({ pressed }) => [
                styles.uploadBtn,
                pressed && styles.pressed,
                uploading && styles.disabled,
              ]}
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
            {imageUri ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: imageUri }} style={styles.preview} />
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.resultWrap}>
            <Text style={styles.resultEmoji}>{result.correct ? '🎉' : '😊'}</Text>
            <Text style={styles.resultTitle}>
              {result.correct ? 'Great Job!' : "Let's try again!"}
            </Text>
            <Text style={styles.resultFeedback}>{result.feedback}</Text>
          </View>
        )}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 22,
    paddingHorizontal: 40,
    borderRadius: 20,
    gap: 12,
    minWidth: 220,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.8 },
  uploadEmoji: { fontSize: 36 },
  uploadText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  previewWrap: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#e5e7eb',
  },
  preview: {
    width: 240,
    height: 180,
  },
  resultWrap: {
    alignItems: 'center',
    padding: 24,
  },
  resultEmoji: { fontSize: 64, marginBottom: 12 },
  resultTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 8,
  },
  resultFeedback: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
  },
});
