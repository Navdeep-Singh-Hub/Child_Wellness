/**
 * Game 5: Control Exhibit — upload bounded scribble photo.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, authHeaders } from '@/utils/api';
import { speak, stopTTS } from '@/utils/tts';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';

const THEME = {
  bg: '#134E4A',
  label: '#5EEAD4',
  title: '#F0FDFA',
  accent: '#14B8A6',
  frame: '#2DD4BF',
  panel: 'rgba(255,255,255,0.92)',
};

type Phase = 1 | 2 | 3;

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
  const [phase, setPhase] = useState<Phase>(1);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; feedback: string } | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const spokeIntro = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    if (!spokeIntro.current) {
      spokeIntro.current = true;
      speak('Draw inside a shape on paper, then photograph it for the Control Exhibit!', 0.72);
    }
  }, []);

  const uploadImage = useCallback(
    async (uri: string) => {
      setUploading(true);
      setPhase(3);
      try {
        const formData = new FormData();
        if (Platform.OS === 'web' && (uri.startsWith('blob:') || uri.startsWith('data:'))) {
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append('file', blob, 'scribble-boundary.jpg');
        } else {
          formData.append('file', { uri, name: 'scribble-boundary.jpg', type: 'image/jpeg' } as any);
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
          message: success ? 'Verified!' : 'Try Again',
          feedback: data.feedback || (success ? 'Excellent boundary control!' : 'Scribble more inside the shape.'),
        });

        if (success) {
          setShowCelebrate(true);
          speak('Your controlled scribble is exhibited!', 0.72);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (_) {}
          setTimeout(() => {
            setShowCelebrate(false);
            onComplete(true);
          }, 2000);
        } else {
          speak(data.feedback || 'Try keeping more scribbles inside the shape.', 0.75);
        }
      } catch (e) {
        setResult({
          success: false,
          message: 'Try Again',
          feedback: e instanceof Error ? e.message : 'Something went wrong.',
        });
      } finally {
        setUploading(false);
      }
    },
    [onComplete],
  );

  const pickImage = async () => {
    const permission =
      Platform.OS === 'web'
        ? { status: 'granted' as const }
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access.');
      return;
    }
    setPhase(2);
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (r.canceled) return;
    setImageUri(r.assets[0].uri);
    setResult(null);
    await uploadImage(r.assets[0].uri);
  };

  const takePhoto = async () => {
    const permission =
      Platform.OS === 'web'
        ? { status: 'granted' as const }
        : await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access.');
      return;
    }
    setPhase(2);
    const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (r.canceled) return;
    setImageUri(r.assets[0].uri);
    setResult(null);
    await uploadImage(r.assets[0].uri);
  };

  const dots = Array.from({ length: totalSteps }, (_, i) => i + 1);

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#134E4A', '#0F766E']} style={StyleSheet.absoluteFill} />
        <View style={styles.celebrate}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <Text style={styles.celebrateEmoji}>🏛️</Text>
          <Text style={styles.celebrateTitle}>Exhibited!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#134E4A', '#115E59', '#0D9488']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <Ionicons name="chevron-back" size={22} color={THEME.title} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.gameLabel}>CONTROL EXHIBIT</Text>
            <Text style={styles.gameTitle}>Boundary Photo</Text>
          </View>
        </View>

        <View style={styles.dotsRow}>
          {dots.map((n) => (
            <View key={n} style={[styles.dot, n === currentStep && styles.dotActive, n < currentStep && styles.dotDone]} />
          ))}
        </View>

        {phase === 1 ? (
          <View style={styles.paperCard}>
            <Text style={styles.paperEmoji}>📐</Text>
            <Text style={styles.paperTitle}>Draw Inside a Shape</Text>
            <Text style={styles.paperDesc}>
              On paper, draw a circle or triangle and scribble mostly inside it — just like the studios you practiced!
            </Text>
            <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={() => { setPhase(2); speak('Now photograph your bounded scribble!', 0.75); }}>
              <Text style={styles.primaryBtnText}>I drew inside a shape!</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.uploadArea}>
            {imageUri ? (
              <View style={styles.frame}>
                <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
                <Text style={styles.caption}>Control Exhibit</Text>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderIcon}>📷</Text>
                <Text style={styles.placeholderText}>Frame your bounded scribble</Text>
              </View>
            )}

            {result ? (
              <View style={[styles.resultBox, result.success ? styles.resultOk : styles.resultFail]}>
                <Text style={styles.resultMsg}>{result.message}</Text>
                <Text style={styles.resultFb}>{result.feedback}</Text>
              </View>
            ) : null}

            {uploading ? (
              <View style={styles.loading}>
                <ActivityIndicator color={THEME.accent} size="large" />
                <Text style={styles.loadingText}>Verifying control…</Text>
              </View>
            ) : (
              <View style={styles.btns}>
                <Pressable style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]} onPress={takePhoto}>
                  <Ionicons name="camera" size={20} color="#FFF" />
                  <Text style={styles.primaryBtnTextWhite}>Take Photo</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]} onPress={pickImage}>
                  <Text style={styles.secondaryText}>Gallery</Text>
                </Pressable>
              </View>
            )}

            {result && !result.success && !uploading ? (
              <Pressable onPress={() => { setResult(null); setImageUri(null); setPhase(1); }}>
                <Text style={styles.retry}>Start over</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  safe: { flex: 1, paddingHorizontal: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  gameLabel: { fontSize: 10, fontWeight: '800', color: THEME.label, letterSpacing: 1.2 },
  gameTitle: { fontSize: 22, fontWeight: '900', color: THEME.title },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.15)' },
  dotActive: { width: 22, backgroundColor: THEME.frame },
  dotDone: { backgroundColor: '#34D399' },
  paperCard: {
    flex: 1,
    backgroundColor: THEME.panel,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: THEME.frame,
  },
  paperEmoji: { fontSize: 56, marginBottom: 16 },
  paperTitle: { fontSize: 22, fontWeight: '900', color: '#134E4A', marginBottom: 10 },
  paperDesc: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.accent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#134E4A' },
  primaryBtnTextWhite: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  uploadArea: { flex: 1 },
  frame: { borderWidth: 4, borderColor: THEME.frame, padding: 6, backgroundColor: THEME.panel, marginBottom: 14 },
  preview: { width: '100%', height: 200 },
  caption: { textAlign: 'center', marginTop: 8, fontSize: 12, fontWeight: '700', color: THEME.label, letterSpacing: 1 },
  placeholder: { minHeight: 160, borderWidth: 2, borderStyle: 'dashed', borderColor: THEME.frame, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  placeholderIcon: { fontSize: 40 },
  placeholderText: { fontSize: 14, color: THEME.label, marginTop: 8 },
  resultBox: { padding: 12, borderRadius: 12, marginBottom: 12 },
  resultOk: { backgroundColor: '#D1FAE5', borderWidth: 2, borderColor: '#16A34A' },
  resultFail: { backgroundColor: '#FEE2E2', borderWidth: 2, borderColor: '#DC2626' },
  resultMsg: { fontSize: 17, fontWeight: '900', textAlign: 'center', color: '#134E4A' },
  resultFb: { fontSize: 14, textAlign: 'center', color: '#64748B', marginTop: 4 },
  loading: { alignItems: 'center', gap: 10, padding: 20 },
  loadingText: { color: THEME.label, fontWeight: '600' },
  btns: { gap: 10 },
  secondaryBtn: { paddingVertical: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14 },
  secondaryText: { fontSize: 15, fontWeight: '700', color: THEME.title },
  retry: { textAlign: 'center', marginTop: 12, color: THEME.label, fontWeight: '700' },
  celebrate: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  celebrateEmoji: { fontSize: 64, marginBottom: 12 },
  celebrateTitle: { fontSize: 28, fontWeight: '900', color: THEME.title },
  pressed: { opacity: 0.88 },
});
