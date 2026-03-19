/**
 * Notebook Task — Write a short story. Upload photo; AI check: writing_detected, story_text_detected. Session 9: Story Problem Solver.
 */
import { speak } from '@/utils/tts';
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { GameLayout } from '@/components/farm-session/GameLayout';
import { API_BASE_URL, authHeaders } from '@/utils/api';

const INSTRUCTIONS = 'Write a short story in your notebook. Example: "I went to the park. I played with my ball." Then upload or take a photo.';

export function StoryProblemSolverNotebookUpload({
  onComplete,
}: {
  onComplete: (correct: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    feedback: string;
    writing_detected?: boolean;
    story_text_detected?: boolean;
  } | null>(null);

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
    setResult(null);
    await uploadImage(uri);
  };

  const takePhoto = async () => {
    const permission =
      Platform.OS === 'web'
        ? { status: 'granted' as const }
        : await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera to take a photo.');
      return;
    }
    const pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (pickerResult.canceled) return;
    const uri = pickerResult.assets[0].uri;
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

      const res = await fetch(`${API_BASE_URL}/api/upload-graduate-story-problem-solver-task`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed: ${res.status}`);
      }
      const data = await res.json();
      const writingOk = data.writing_detected ?? true;
      const storyOk = data.story_text_detected ?? true;
      const correct = data.correct ?? (writingOk && storyOk);
      const feedback = data.feedback || (correct ? 'Great job!' : "Let's try again!");
      setResult({
        correct,
        feedback,
        writing_detected: data.writing_detected,
        story_text_detected: data.story_text_detected,
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
      title="Notebook Activity"
      instruction="Write a short story. Then upload or take a photo."
      icon="📓"
      backgroundVariant="indigo"
    >
      <View style={styles.content}>
        <Text style={styles.instructions}>{INSTRUCTIONS}</Text>
        <View style={styles.exampleRow}>
          <Text style={styles.exampleLabel}>Example:</Text>
          <Text style={styles.exampleLine}>I went to the park.</Text>
          <Text style={styles.exampleLine}>I played with my ball.</Text>
        </View>
        <View style={styles.buttonRow}>
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
                <Text style={styles.btnEmoji}>📷</Text>
                <Text style={styles.btnText}>Upload Photo</Text>
              </>
            )}
          </Pressable>
          <Pressable
            onPress={takePhoto}
            disabled={uploading}
            style={({ pressed }) => [styles.uploadBtn, pressed && styles.pressed, uploading && styles.disabled]}
            accessibilityLabel="Take photo"
          >
            <Text style={styles.btnEmoji}>📸</Text>
            <Text style={styles.btnText}>Take Photo</Text>
          </Pressable>
        </View>
        {result && (
          <View style={[styles.resultBox, result.correct ? styles.resultCorrect : styles.resultIncorrect]}>
            <Text style={styles.resultText}>{result.feedback}</Text>
          </View>
        )}
      </View>
    </GameLayout>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  instructions: { fontSize: 18, color: '#374151', marginBottom: 16, textAlign: 'center' },
  exampleRow: { alignItems: 'center', marginBottom: 24 },
  exampleLabel: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  exampleLine: { fontSize: 17, fontWeight: '700', color: '#5B21B6', marginBottom: 4 },
  buttonRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  uploadBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 140,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.7 },
  btnEmoji: { fontSize: 32, marginBottom: 4 },
  btnText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  resultBox: { marginTop: 20, padding: 16, borderRadius: 12, alignItems: 'center' },
  resultCorrect: { backgroundColor: '#DCFCE7', borderWidth: 2, borderColor: '#22C55E' },
  resultIncorrect: { backgroundColor: '#FEE2E2', borderWidth: 2, borderColor: '#EF4444' },
  resultText: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
});
