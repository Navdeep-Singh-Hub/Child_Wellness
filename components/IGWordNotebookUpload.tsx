/**
 * IG Word Notebook — Write 3 -IG words (pig, dig, wig). Grouper Session 8.
 * AI checks: ig_words_present, three_words_present.
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

const INSTRUCTIONS = 'Write 3 -IG words. Example: pig, dig, wig.';

export function IGWordNotebookUpload({
  onComplete,
}: {
  onComplete: (correct: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    correct: boolean;
    feedback: string;
    ig_words_present?: boolean;
    three_words_present?: boolean;
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

  const takePhoto = async () => {
    const permission =
      Platform.OS === 'web'
        ? { status: 'granted' as const }
        : await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
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

      const res = await fetch(`${API_BASE_URL}/api/upload-ig-word-task`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed: ${res.status}`);
      }
      const data = await res.json();
      const igPresent = data.ig_words_present ?? true;
      const threeWords = data.three_words_present ?? true;
      const correct = data.correct ?? (igPresent && threeWords);
      const feedback = data.feedback || (correct ? 'Great job!' : "Let's try again!");
      setResult({
        correct,
        feedback,
        ig_words_present: data.ig_words_present,
        three_words_present: data.three_words_present,
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
      instruction="Write 3 -IG words. Then upload or take a photo."
    >
      <View style={styles.content}>
        <Text style={styles.instructions}>{INSTRUCTIONS}</Text>
        <View style={styles.exampleRow}>
          <Text style={styles.exampleWords}>pig · dig · wig</Text>
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
        {imageUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
          </View>
        ) : null}
        {result ? (
          <View style={[styles.resultWrap, result.correct ? styles.resultOk : styles.resultFail]}>
            <Text style={styles.resultEmoji}>{result.correct ? '🎉' : '🙂'}</Text>
            <Text style={[styles.resultText, result.correct ? styles.resultTextOk : styles.resultTextFail]}>{result.correct ? 'Great Job!' : "Let's try again!"}</Text>
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
    fontSize: 20,
    color: '#1f2937',
    lineHeight: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  exampleRow: { marginBottom: 28 },
  exampleWords: { fontSize: 22, fontWeight: '800', color: '#4F46E5', textAlign: 'center' },
  buttonRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4F46E5',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#4338CA',
    minWidth: 140,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.8 },
  btnEmoji: { fontSize: 28 },
  btnText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  previewWrap: { marginTop: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 3, borderColor: '#22C55E' },
  preview: { width: 240, height: 180 },
  resultWrap: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 3,
  },
  resultOk: { backgroundColor: '#DCFCE7', borderColor: '#22C55E' },
  resultFail: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  resultEmoji: { fontSize: 48, marginBottom: 8 },
  resultText: { fontSize: 24, fontWeight: '800' },
  resultTextOk: { color: '#166534' },
  resultTextFail: { color: '#991B1B' },
  resultFeedback: { fontSize: 16, color: '#4b5563', marginTop: 4 },
});
