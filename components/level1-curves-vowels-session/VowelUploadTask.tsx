/**
 * Game 3: Curve Chronicle — draw curves on paper and upload photo.
 * POST /api/verify-curves
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
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL, authHeaders } from '@/utils/api';
import { speak, stopTTS } from '@/utils/tts';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { JournalBackground } from './curve-collection/JournalBackground';
import { ScribeMascot } from './curve-collection/ScribeMascot';
import { CollectionStepGuide } from './curve-collection/CollectionStepGuide';
import { CHRONICLE, SHELL_CHRONICLE } from './curve-collection/theme';

type UploadPhase = 1 | 2 | 3;

export function VowelUploadTask({
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
  const [phase, setPhase] = useState<UploadPhase>(1);
  const [result, setResult] = useState<{ success: boolean; message: string; feedback: string } | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const spokeIntro = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => setReduceMotion(!!v)).catch(() => {});
    if (!spokeIntro.current) {
      spokeIntro.current = true;
      speak('Draw curved lines on paper — waves, circles, or arches — then photograph your page!', 0.72);
    }
    return () => stopTTS();
  }, []);

  const mascotHint =
    phase === 1
      ? 'Sketch waves, circles, or arches on a sheet of paper!'
      : phase === 2
        ? 'Ready? Photograph your curve page.'
        : result?.success
          ? 'Your curves are in the chronicle!'
          : result
            ? result.feedback
            : 'The scribe is reviewing your page…';

  const uploadImage = useCallback(
    async (uri: string) => {
      setUploading(true);
      setPhase(3);
      try {
        const formData = new FormData();
        const filename = 'curves.jpg';
        const type = 'image/jpeg';

        if (Platform.OS === 'web' && (uri.startsWith('blob:') || uri.startsWith('data:'))) {
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append('file', blob, filename);
        } else {
          formData.append('file', { uri, name: filename, type } as any);
        }

        const headers = await authHeaders({ multipart: true });
        delete (headers as Record<string, string>)['Content-Type'];

        const res = await fetch(`${API_BASE_URL}/api/verify-curves`, {
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
          message: success ? 'Chronicled!' : 'Try Again',
          feedback: data.feedback || (success ? 'Beautiful curve drawing!' : 'Draw more curves and try again.'),
        });

        if (success) {
          setShowCelebrate(true);
          speak('Wonderful! Your curves are recorded in the chronicle!', 0.72);
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
          setTimeout(() => {
            setShowCelebrate(false);
            onComplete(true);
          }, reduceMotion ? 800 : 2000);
        } else {
          speak(data.feedback || 'Try drawing more curved lines on the paper.', 0.72);
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch (_) {}
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Something went wrong.';
        setResult({ success: false, message: 'Try Again', feedback: msg });
        speak('Something went wrong. Please try again.', 0.72);
      } finally {
        setUploading(false);
      }
    },
    [onComplete, reduceMotion],
  );

  const pickImage = async () => {
    const permission =
      Platform.OS === 'web'
        ? { status: 'granted' as const }
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to photos to upload your drawing.');
      return;
    }
    setPhase(2);
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
      Alert.alert('Permission needed', 'Allow camera to photograph your curves.');
      return;
    }
    setPhase(2);
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

  const handleReadyToUpload = () => {
    setPhase(2);
    speak('Now take a photo of your curve page!', 0.72);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
  };

  const handleRetry = () => {
    setResult(null);
    setImageUri(null);
    setPhase(1);
    speak('Let us try again! Draw curves on paper first.', 0.72);
  };

  const stepDots = Array.from({ length: totalSteps }, (_, i) => i + 1);

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <JournalBackground />
        <View style={styles.celebrateOverlay}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <View style={styles.celebrateCard}>
            <Text style={styles.celebrateEmoji}>📜</Text>
            <Text style={styles.celebrateTitle}>In the Chronicle!</Text>
            <Text style={styles.celebrateSub}>Your real-world curves are saved</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <JournalBackground />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: SHELL_CHRONICLE.backBg, borderColor: SHELL_CHRONICLE.backBorder },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={SHELL_CHRONICLE.textOnDark} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.gameLabel}>CURVE CHRONICLE</Text>
            <Text style={styles.gameTitle}>Real Paper Entry</Text>
          </View>
        </View>

        <View style={styles.dotsRow}>
          {stepDots.map((n) => (
            <View
              key={n}
              style={[
                styles.dot,
                { backgroundColor: SHELL_CHRONICLE.dotIdle },
                n === currentStep && [styles.dotActive, { backgroundColor: SHELL_CHRONICLE.dotActive }],
                n < currentStep && { backgroundColor: SHELL_CHRONICLE.dotDone },
              ]}
            />
          ))}
        </View>

        <ScribeMascot hint={mascotHint} />
        <CollectionStepGuide phase={phase} />

        {phase === 1 ? (
          <View style={styles.paperCard}>
            <View style={styles.paperFrame}>
              <Text style={styles.paperEmoji}>〰️</Text>
              <Text style={styles.paperTitle}>On Real Paper</Text>
              <Text style={styles.paperDesc}>
                Draw waves, circles, and arches on a sheet of paper — just like you practiced in the studios!
              </Text>
            </View>
            <Pressable
              onPress={handleReadyToUpload}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color={CHRONICLE.textDark} />
              <Text style={styles.primaryBtnText}>I drew my curves!</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.uploadArea}>
            {imageUri ? (
              <View style={styles.frameOuter}>
                <View style={styles.frameInner}>
                  <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
                </View>
                <Text style={styles.frameCaption}>Your Chronicle Page</Text>
              </View>
            ) : (
              <View style={styles.placeholderFrame}>
                <Text style={styles.placeholderIcon}>📷</Text>
                <Text style={styles.placeholderText}>Photograph your curve page</Text>
              </View>
            )}

            {result && (
              <View style={[styles.resultBox, result.success ? styles.resultSuccess : styles.resultTry]}>
                <Text style={styles.resultMessage}>{result.message}</Text>
                <Text style={styles.resultFeedback}>{result.feedback}</Text>
              </View>
            )}

            {uploading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={CHRONICLE.accent} size="large" />
                <Text style={styles.loadingText}>Scribe is reviewing…</Text>
              </View>
            ) : (
              <View style={styles.buttons}>
                <Pressable onPress={takePhoto} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
                  <Ionicons name="camera" size={22} color={CHRONICLE.textDark} />
                  <Text style={styles.primaryBtnText}>Take Photo</Text>
                </Pressable>
                <Pressable onPress={pickImage} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}>
                  <Ionicons name="images-outline" size={20} color={CHRONICLE.ink} />
                  <Text style={styles.secondaryBtnText}>Choose from Gallery</Text>
                </Pressable>
              </View>
            )}

            {result && !result.success && !uploading ? (
              <Pressable onPress={handleRetry} style={styles.retryBtn}>
                <Text style={styles.retryText}>Start over</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CHRONICLE.paper },
  safe: { flex: 1, paddingHorizontal: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerCenter: { flex: 1 },
  gameLabel: { fontSize: 10, fontWeight: '800', color: CHRONICLE.inkLight, letterSpacing: 1.2 },
  gameTitle: { fontSize: 22, fontWeight: '900', color: CHRONICLE.textDark },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 22 },
  paperCard: { flex: 1, gap: 16 },
  paperFrame: {
    flex: 1,
    backgroundColor: CHRONICLE.panel,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: CHRONICLE.accent,
    marginBottom: 8,
  },
  paperEmoji: { fontSize: 56, marginBottom: 16 },
  paperTitle: { fontSize: 22, fontWeight: '900', color: CHRONICLE.textDark, marginBottom: 10 },
  paperDesc: {
    fontSize: 16,
    fontWeight: '500',
    color: CHRONICLE.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  uploadArea: { flex: 1 },
  frameOuter: { alignItems: 'center', marginBottom: 16 },
  frameInner: {
    width: '100%',
    minHeight: 200,
    borderWidth: 4,
    borderColor: CHRONICLE.accent,
    backgroundColor: '#FFF',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  preview: { width: '100%', height: 200, backgroundColor: '#FFFBEB' },
  frameCaption: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: CHRONICLE.inkLight,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  placeholderFrame: {
    minHeight: 180,
    borderWidth: 3,
    borderColor: CHRONICLE.accent,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  placeholderIcon: { fontSize: 40, marginBottom: 8 },
  placeholderText: { fontSize: 15, fontWeight: '600', color: CHRONICLE.textMuted },
  resultBox: { padding: 14, borderRadius: 14, marginBottom: 12 },
  resultSuccess: { backgroundColor: CHRONICLE.successBg, borderWidth: 2, borderColor: CHRONICLE.success },
  resultTry: { backgroundColor: CHRONICLE.tryBg, borderWidth: 2, borderColor: '#DC2626' },
  resultMessage: { fontSize: 18, fontWeight: '900', textAlign: 'center', color: CHRONICLE.textDark, marginBottom: 4 },
  resultFeedback: { fontSize: 14, textAlign: 'center', color: CHRONICLE.textMuted },
  loadingRow: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { fontSize: 15, fontWeight: '600', color: CHRONICLE.inkLight },
  buttons: { gap: 10 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: CHRONICLE.paperDark,
    borderWidth: 2,
    borderColor: CHRONICLE.accent,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: CHRONICLE.textDark },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: CHRONICLE.panel,
    borderWidth: 2,
    borderColor: CHRONICLE.accent,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '700', color: CHRONICLE.ink },
  retryBtn: { alignSelf: 'center', marginTop: 12, padding: 8 },
  retryText: { fontSize: 15, fontWeight: '700', color: CHRONICLE.inkLight },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  celebrateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(120,53,15,0.75)',
  },
  celebrateCard: {
    alignItems: 'center',
    backgroundColor: CHRONICLE.panel,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderWidth: 4,
    borderColor: CHRONICLE.accent,
  },
  celebrateEmoji: { fontSize: 56, marginBottom: 10 },
  celebrateTitle: { fontSize: 26, fontWeight: '900', color: CHRONICLE.textDark, marginBottom: 6 },
  celebrateSub: { fontSize: 15, fontWeight: '600', color: CHRONICLE.textMuted },
});
