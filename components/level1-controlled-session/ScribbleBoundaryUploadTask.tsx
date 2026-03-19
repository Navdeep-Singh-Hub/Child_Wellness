/**
 * AI Task: Scribble inside a shape on paper and upload photo. POST /api/verify-scribble-boundary
 */
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
import { API_BASE_URL, authHeaders } from '@/utils/api';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';

const INSTRUCTION = 'Scribble inside a shape on paper and upload a photo.';

export function ScribbleBoundaryUploadTask({
  currentStep,
  totalSteps,
  onBack,
  onComplete,
}: {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onComplete: (success: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; feedback: string } | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const permission =
      Platform.OS === 'web'
        ? { status: 'granted' as const }
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to photos to upload your scribble.');
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
      Alert.alert('Permission needed', 'Allow camera to take a photo of your scribble.');
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
      const filename = 'scribble-boundary.jpg';
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

      const res = await fetch(`${API_BASE_URL}/api/verify-scribble-boundary`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed: ${res.status}`);
      }
      const data = await res.json();
      const success = data.success === true;
      setResult({
        success,
        message: data.message || (success ? 'SUCCESS' : 'TRY AGAIN'),
        feedback: data.feedback || (success ? 'Great control!' : 'Try again. Scribble mostly inside the shape.'),
      });
      if (success) onComplete(true);
    } catch (e) {
      setResult({
        success: false,
        message: 'TRY AGAIN',
        feedback: e instanceof Error ? e.message : 'Something went wrong. Try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <GameContainerGrip
      title="Scribble Task"
      currentStep={currentStep}
      totalSteps={totalSteps}
      mascot="📷"
      mascotHint={INSTRUCTION}
      onBack={onBack}
    >
      <View style={styles.content}>
        <Text style={styles.instruction}>{INSTRUCTION}</Text>
        {imageUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
          </View>
        ) : null}
        {result && (
          <View style={[styles.resultBox, result.success ? styles.resultSuccess : styles.resultTry]}>
            <Text style={styles.resultMessage}>{result.message}</Text>
            <Text style={styles.resultFeedback}>{result.feedback}</Text>
          </View>
        )}
        <View style={styles.buttons}>
          <Pressable
            onPress={takePhoto}
            disabled={uploading}
            style={({ pressed }) => [styles.btn, styles.btnPrimary, pressed && styles.pressed]}
          >
            {uploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnText}>Take Photo</Text>
            )}
          </Pressable>
          <Pressable
            onPress={pickImage}
            disabled={uploading}
            style={({ pressed }) => [styles.btn, styles.btnSecondary, pressed && styles.pressed]}
          >
            <Text style={[styles.btnText, styles.btnTextSecondary]}>Choose from Gallery</Text>
          </Pressable>
        </View>
        {result && !result.success && (
          <Pressable onPress={() => { setResult(null); setImageUri(null); }} style={styles.tryAgain}>
            <Text style={styles.tryAgainText}>Try again</Text>
          </Pressable>
        )}
      </View>
    </GameContainerGrip>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  instruction: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5B21B6',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  previewWrap: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F3F4F6', minHeight: 200 },
  preview: { width: '100%', height: 200 },
  resultBox: { padding: 16, borderRadius: 16, marginBottom: 16 },
  resultSuccess: { backgroundColor: '#D1FAE5', borderWidth: 2, borderColor: '#059669' },
  resultTry: { backgroundColor: '#FEE2E2', borderWidth: 2, borderColor: '#DC2626' },
  resultMessage: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  resultFeedback: { fontSize: 16, textAlign: 'center' },
  buttons: { gap: 12 },
  btn: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#5B21B6' },
  btnSecondary: { backgroundColor: '#EDE9FE' },
  btnText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  btnTextSecondary: { color: '#5B21B6' },
  pressed: { opacity: 0.9 },
  tryAgain: { marginTop: 12, alignSelf: 'center' },
  tryAgainText: { fontSize: 16, fontWeight: '700', color: '#5B21B6' },
});
