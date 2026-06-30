/**
 * Game 5: Letter Ledger — write a straight-line letter on paper and upload.
 * POST /api/verify-straight-letters
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
import { LedgerBackground } from './letter-ledger/LedgerBackground';
import { LedgerStepGuide } from './letter-ledger/LedgerStepGuide';
import { LetterMascot } from './letters-shared/LetterMascot';
import { letterColor } from './letters-shared/letterColors';
import { LEDGER, SHELL_LEDGER } from './letter-ledger/theme';

type UploadPhase = 1 | 2 | 3;

export function LetterUploadTask({
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
      speak('Write any letter I, L, T, H, E, or F on paper, then photograph your page!', 0.72);
    }
    return () => stopTTS();
  }, []);

  const mascotHint =
    phase === 1
      ? 'Write I, L, T, H, E, or F on a sheet of paper!'
      : phase === 2
        ? 'Ready? Photograph your letter page.'
        : result?.success
          ? 'Recorded in the ledger!'
          : result
            ? result.feedback
            : 'The clerk is reviewing your page…';

  const uploadImage = useCallback(
    async (uri: string) => {
      setUploading(true);
      setPhase(3);
      try {
        const formData = new FormData();
        const filename = 'letter.jpg';
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

        const res = await fetch(`${API_BASE_URL}/api/verify-straight-letters`, {
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
          message: success ? 'Recorded!' : 'Try Again',
          feedback: data.feedback || (success ? 'Great letter writing!' : 'Try again. Write any letter: I, L, T, H, E, F'),
        });

        if (success) {
          setShowCelebrate(true);
          speak('Wonderful! Your letter is in the ledger!', 0.72);
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
          setTimeout(() => {
            setShowCelebrate(false);
            onComplete(true);
          }, reduceMotion ? 800 : 2000);
        } else {
          speak(data.feedback || 'Try writing a clearer letter on the paper.', 0.72);
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
      Alert.alert('Permission needed', 'Allow camera to photograph your letter.');
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
    speak('Now take a photo of your letter page!', 0.72);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
  };

  const handleRetry = () => {
    setResult(null);
    setImageUri(null);
    setPhase(1);
    speak('Let us try again! Write a letter on paper first.', 0.72);
  };

  const stepDots = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const exampleLetters = ['I', 'L', 'T', 'H', 'E', 'F'];

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <LedgerBackground />
        <View style={styles.celebrateOverlay}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <View style={styles.celebrateCard}>
            <Text style={styles.celebrateEmoji}>📒</Text>
            <Text style={styles.celebrateTitle}>In the Ledger!</Text>
            <Text style={styles.celebrateSub}>Your real-world letter is recorded</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LedgerBackground />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: SHELL_LEDGER.backBg, borderColor: SHELL_LEDGER.backBorder },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={SHELL_LEDGER.textOnDark} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.gameLabel}>LETTER LEDGER</Text>
            <Text style={styles.gameTitle}>Real Paper Entry</Text>
          </View>
        </View>

        <View style={styles.dotsRow}>
          {stepDots.map((n) => (
            <View
              key={n}
              style={[
                styles.dot,
                { backgroundColor: SHELL_LEDGER.dotIdle },
                n === currentStep && [styles.dotActive, { backgroundColor: SHELL_LEDGER.dotActive }],
                n < currentStep && { backgroundColor: SHELL_LEDGER.dotDone },
              ]}
            />
          ))}
        </View>

        <LetterMascot
          emoji="📋"
          name="Clerk"
          hint={mascotHint}
          accent={LEDGER.accent}
          bubbleBg={LEDGER.panel}
          bubbleBorder={LEDGER.panelBorder}
          nameColor={LEDGER.accent}
          hintColor={LEDGER.textDark}
        />
        <LedgerStepGuide phase={phase} />

        {phase === 1 ? (
          <View style={styles.paperCard}>
            <View style={styles.paperFrame}>
              <View style={styles.letterRow}>
                {exampleLetters.map((l, i) => (
                  <Text key={l} style={[styles.exLetter, { color: letterColor(i) }]}>{l}</Text>
                ))}
              </View>
              <Text style={styles.paperTitle}>On Real Paper</Text>
              <Text style={styles.paperDesc}>
                Write any of these straight-line letters on a sheet of paper using pencil or crayon.
              </Text>
            </View>
            <Pressable
              onPress={handleReadyToUpload}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color={LEDGER.textDark} />
              <Text style={styles.primaryBtnText}>I wrote my letter!</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.uploadArea}>
            {imageUri ? (
              <View style={styles.frameOuter}>
                <View style={styles.frameInner}>
                  <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
                </View>
                <Text style={styles.frameCaption}>Ledger Page</Text>
              </View>
            ) : (
              <View style={styles.placeholderFrame}>
                <Text style={styles.placeholderIcon}>📷</Text>
                <Text style={styles.placeholderText}>Photograph your letter</Text>
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
                <ActivityIndicator color={LEDGER.accent} size="large" />
                <Text style={styles.loadingText}>Clerk is reviewing…</Text>
              </View>
            ) : (
              <View style={styles.buttons}>
                <Pressable onPress={takePhoto} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
                  <Ionicons name="camera" size={22} color={LEDGER.textDark} />
                  <Text style={styles.primaryBtnText}>Take Photo</Text>
                </Pressable>
                <Pressable onPress={pickImage} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}>
                  <Ionicons name="images-outline" size={20} color={LEDGER.ink} />
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
  root: { flex: 1, backgroundColor: SHELL_LEDGER.bg },
  safe: { flex: 1, paddingHorizontal: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  headerCenter: { flex: 1 },
  gameLabel: { fontSize: 10, fontWeight: '800', color: LEDGER.inkLight, letterSpacing: 1.2 },
  gameTitle: { fontSize: 22, fontWeight: '900', color: LEDGER.textDark },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 22 },
  paperCard: { flex: 1, gap: 16 },
  paperFrame: {
    flex: 1,
    backgroundColor: LEDGER.panel,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: LEDGER.accent,
    marginBottom: 8,
  },
  letterRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  exLetter: { fontSize: 28, fontWeight: '900' },
  paperTitle: { fontSize: 22, fontWeight: '900', color: LEDGER.textDark, marginBottom: 10 },
  paperDesc: { fontSize: 16, fontWeight: '500', color: LEDGER.textMuted, textAlign: 'center', lineHeight: 24, maxWidth: 300 },
  uploadArea: { flex: 1 },
  frameOuter: { alignItems: 'center', marginBottom: 16 },
  frameInner: {
    width: '100%',
    minHeight: 200,
    borderWidth: 4,
    borderColor: LEDGER.accent,
    backgroundColor: '#FFF',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  preview: { width: '100%', height: 200, backgroundColor: LEDGER.page },
  frameCaption: { marginTop: 8, fontSize: 12, fontWeight: '700', color: LEDGER.inkLight, letterSpacing: 1, textTransform: 'uppercase' },
  placeholderFrame: {
    minHeight: 180,
    borderWidth: 3,
    borderColor: LEDGER.accent,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  placeholderIcon: { fontSize: 40, marginBottom: 8 },
  placeholderText: { fontSize: 15, fontWeight: '600', color: LEDGER.textMuted },
  resultBox: { padding: 14, borderRadius: 14, marginBottom: 12 },
  resultSuccess: { backgroundColor: LEDGER.successBg, borderWidth: 2, borderColor: LEDGER.success },
  resultTry: { backgroundColor: LEDGER.tryBg, borderWidth: 2, borderColor: '#DC2626' },
  resultMessage: { fontSize: 18, fontWeight: '900', textAlign: 'center', color: LEDGER.textDark, marginBottom: 4 },
  resultFeedback: { fontSize: 14, textAlign: 'center', color: LEDGER.textMuted },
  loadingRow: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { fontSize: 15, fontWeight: '600', color: LEDGER.inkLight },
  buttons: { gap: 10 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    borderWidth: 2,
    borderColor: LEDGER.inkLight,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: LEDGER.textDark },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: LEDGER.panel,
    borderWidth: 2,
    borderColor: LEDGER.accent,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '700', color: LEDGER.ink },
  retryBtn: { alignSelf: 'center', marginTop: 12, padding: 8 },
  retryText: { fontSize: 15, fontWeight: '700', color: LEDGER.inkLight },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  celebrateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,58,95,0.75)',
  },
  celebrateCard: {
    alignItems: 'center',
    backgroundColor: LEDGER.panel,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderWidth: 4,
    borderColor: LEDGER.accent,
  },
  celebrateEmoji: { fontSize: 56, marginBottom: 10 },
  celebrateTitle: { fontSize: 26, fontWeight: '900', color: LEDGER.textDark, marginBottom: 6 },
  celebrateSub: { fontSize: 15, fontWeight: '600', color: LEDGER.textMuted },
});
