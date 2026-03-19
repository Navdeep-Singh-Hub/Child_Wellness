/**
 * PartyNotebookUpload — Final Party Drawing (Grand Finale)
 * Draw 3 cakes, draw 5 candles, write the numbers 3 and 5. AI: cakes_correct, candles_correct, numbers_written_correctly.
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
import { GameLayout } from '../farm-session/GameLayout';
import { API_BASE_URL, authHeaders } from '@/utils/api';

const INSTRUCTIONS =
  'Draw 3 cakes and 5 candles in your notebook. Then write the numbers 3 and 5.';

export function PartyNotebookUpload({
  onComplete,
}: {
  onComplete: (correct: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    feedback: string;
    cakes_correct?: boolean;
    candles_correct?: boolean;
    numbers_written_correctly?: boolean;
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

      const res = await fetch(`${API_BASE_URL}/api/upload-celebration-task`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed: ${res.status}`);
      }
      const data = await res.json();
      const cakes = data.cakes_correct ?? true;
      const candles = data.candles_correct ?? true;
      const numbers = data.numbers_written_correctly ?? true;
      const correct = data.correct ?? (cakes && candles && numbers);
      const feedback = data.feedback || (correct ? 'Great drawing!' : "Let's try again!");
      setResult({
        correct,
        feedback,
        cakes_correct: data.cakes_correct,
        candles_correct: data.candles_correct,
        numbers_written_correctly: data.numbers_written_correctly,
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
      title="Final Party Drawing"
      instruction="Draw 3 cakes and 5 candles, then write 3 and 5. Upload a photo when done."
    >
      <View style={styles.content}>
        <Text style={styles.instructions}>{INSTRUCTIONS}</Text>
        <Pressable
          onPress={pickImage}
          disabled={uploading}
          style={({ pressed }) => [styles.uploadBtn, pressed && styles.pressed, uploading && styles.disabled]}
          accessibilityLabel="Upload photo"
        >
          {uploading ? (
            <ActivityIndicator color="#FFF" size="large" />
          ) : (
            <>
              <Text style={styles.uploadEmoji}>📷</Text>
              <Text style={styles.uploadText}>Upload Photo</Text>
            </>
          )}
        </Pressable>
        {imageUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
          </View>
        ) : null}
        {result ? (
          <View style={[styles.resultWrap, result.correct ? styles.resultOk : styles.resultFail]}>
            <Text style={styles.resultEmoji}>{result.correct ? '🎉' : '🙂'}</Text>
            <Text style={styles.resultText}>{result.correct ? 'Great Job!' : "Let's try again!"}</Text>
            <Text style={styles.resultFeedback}>{result.feedback}</Text>
          </View>
        ) : null}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, alignItems: 'center' },
  instructions: {
    fontSize: 18,
    color: '#1f2937',
    lineHeight: 26,
    marginBottom: 24,
    textAlign: 'center',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F472B6',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#EC4899',
    minWidth: 220,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.8 },
  uploadEmoji: { fontSize: 32 },
  uploadText: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  previewWrap: { marginTop: 20, borderRadius: 16, overflow: 'hidden', borderWidth: 3, borderColor: '#FACC15' },
  preview: { width: 240, height: 180 },
  resultWrap: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 3,
  },
  resultOk: { backgroundColor: '#FDF2F8', borderColor: '#F472B6' },
  resultFail: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  resultEmoji: { fontSize: 48, marginBottom: 8 },
  resultText: { fontSize: 24, fontWeight: '800', color: '#9D174D' },
  resultFeedback: { fontSize: 16, color: '#4b5563', marginTop: 4 },
});
