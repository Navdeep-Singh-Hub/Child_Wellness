/**
 * AI Task: Write A–Z without dots on paper and upload photo.
 * POST /api/verify-free-writing
 */
import React, { useState } from 'react';
import {
  View, Text, Pressable, Image, StyleSheet, Alert, Platform, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, authHeaders } from '@/utils/api';
import { GameContainerGrip } from '@/components/level1-grip-session/GameContainerGrip';

const INSTRUCTION = 'Write A to Z without any dots or guides on paper, then upload a photo.';

export function FreeWritingUploadTask({
  currentStep, totalSteps, onBack, onComplete,
}: { currentStep: number; totalSteps: number; onBack: () => void; onComplete: (success: boolean) => void }) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; feedback: string } | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const permission = Platform.OS === 'web'
      ? { status: 'granted' as const }
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') { Alert.alert('Permission needed', 'Allow access to photos.'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (r.canceled) return;
    setImageUri(r.assets[0].uri); setResult(null);
    await upload(r.assets[0].uri);
  };

  const takePhoto = async () => {
    const permission = Platform.OS === 'web'
      ? { status: 'granted' as const }
      : await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') { Alert.alert('Permission needed', 'Allow camera access.'); return; }
    const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (r.canceled) return;
    setImageUri(r.assets[0].uri); setResult(null);
    await upload(r.assets[0].uri);
  };

  const upload = async (uri: string) => {
    setUploading(true);
    try {
      const fd = new FormData();
      if (Platform.OS === 'web' && (uri.startsWith('blob:') || uri.startsWith('data:'))) {
        const blob = await (await fetch(uri)).blob();
        fd.append('file', blob, 'free-writing.jpg');
      } else {
        fd.append('file', { uri, name: 'free-writing.jpg', type: 'image/jpeg' } as any);
      }
      const h = await authHeaders({ multipart: true });
      delete (h as Record<string, string>)['Content-Type'];
      const res = await fetch(`${API_BASE_URL}/api/verify-free-writing`, { method: 'POST', headers: h, body: fd });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Upload failed: ${res.status}`); }
      const data = await res.json();
      const ok = data.success === true;
      setResult({ success: ok, message: data.message || (ok ? 'SUCCESS' : 'TRY AGAIN'), feedback: data.feedback || (ok ? 'Amazing writing!' : 'Try again.') });
      if (ok) onComplete(true);
    } catch (e) {
      setResult({ success: false, message: 'TRY AGAIN', feedback: e instanceof Error ? e.message : 'Something went wrong.' });
    } finally { setUploading(false); }
  };

  return (
    <GameContainerGrip title="A–Z Free Writing" currentStep={currentStep} totalSteps={totalSteps} mascot="📷" mascotHint={INSTRUCTION} onBack={onBack}>
      <View style={styles.content}>
        <Text style={styles.instruction}>{INSTRUCTION}</Text>
        {imageUri ? <View style={styles.previewWrap}><Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" /></View> : null}
        {result && (
          <View style={[styles.resultBox, result.success ? styles.resultOk : styles.resultFail]}>
            <Text style={styles.resultMsg}>{result.message}</Text>
            <Text style={styles.resultFb}>{result.feedback}</Text>
          </View>
        )}
        <View style={styles.buttons}>
          <Pressable onPress={takePhoto} disabled={uploading} style={({ pressed }) => [styles.btn, styles.btnPri, pressed && styles.pressed]}>
            {uploading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Take Photo</Text>}
          </Pressable>
          <Pressable onPress={pickImage} disabled={uploading} style={({ pressed }) => [styles.btn, styles.btnSec, pressed && styles.pressed]}>
            <Text style={[styles.btnText, styles.btnTextSec]}>Choose from Gallery</Text>
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
  instruction: { fontSize: 18, fontWeight: '700', color: '#991B1B', textAlign: 'center', marginBottom: 20, lineHeight: 26 },
  previewWrap: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F3F4F6', minHeight: 200 },
  preview: { width: '100%', height: 200 },
  resultBox: { padding: 16, borderRadius: 16, marginBottom: 16 },
  resultOk: { backgroundColor: '#D1FAE5', borderWidth: 2, borderColor: '#059669' },
  resultFail: { backgroundColor: '#FEE2E2', borderWidth: 2, borderColor: '#DC2626' },
  resultMsg: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  resultFb: { fontSize: 16, textAlign: 'center' },
  buttons: { gap: 12 },
  btn: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  btnPri: { backgroundColor: '#991B1B' },
  btnSec: { backgroundColor: '#FEF2F2' },
  btnText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  btnTextSec: { color: '#991B1B' },
  pressed: { opacity: 0.9 },
  tryAgain: { marginTop: 12, alignSelf: 'center' },
  tryAgainText: { fontSize: 16, fontWeight: '700', color: '#991B1B' },
});
