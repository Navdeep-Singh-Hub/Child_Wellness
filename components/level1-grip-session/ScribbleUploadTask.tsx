/**
 * Game 5: Scribble Upload — Masterpiece Gallery
 * Museum theme: draw on paper → photograph → exhibit in gallery.
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
import { GalleryBackground } from './scribble-upload/GalleryBackground';
import { CuratorMascot } from './scribble-upload/CuratorMascot';
import { UploadStepGuide } from './scribble-upload/UploadStepGuide';
import { GALLERY } from './scribble-upload/theme';

type UploadPhase = 1 | 2 | 3;

export function ScribbleUploadTask({
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
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => setReduceMotion(!!v))
      .catch(() => {});
    return () => stopTTS();
  }, []);

  useEffect(() => {
    if (!spokeIntro.current) {
      spokeIntro.current = true;
      speak('Draw scribbles on paper, then take a photo to hang in the gallery!', 0.72);
    }
  }, []);

  const mascotHint =
    phase === 1
      ? 'First, scribble freely on a piece of paper!'
      : phase === 2
        ? 'Ready? Take a photo or pick from your gallery.'
        : result?.success
          ? 'Your art is in the gallery!'
          : result
            ? result.feedback
            : 'Checking your masterpiece…';

  const uploadImage = useCallback(
    async (uri: string) => {
      setUploading(true);
      setPhase(3);
      try {
        const formData = new FormData();
        const filename = 'scribble.jpg';
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

        const res = await fetch(`${API_BASE_URL}/api/verify-scribble`, {
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
          message: success ? 'Exhibited!' : 'Try Again',
          feedback: data.feedback || (success ? 'Beautiful scribbling!' : 'Make more scribbles and try again.'),
        });

        if (success) {
          setShowCelebrate(true);
          speak('Wonderful! Your masterpiece is in the gallery!', 0.72);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (_) {}
          setTimeout(() => {
            setShowCelebrate(false);
            onComplete(true);
          }, 2000);
        } else {
          speak(data.feedback || 'Try making more scribbles on the paper.', 0.75);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } catch (_) {}
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Something went wrong.';
        setResult({ success: false, message: 'Try Again', feedback: msg });
        speak('Something went wrong. Please try again.', 0.75);
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
      Alert.alert('Permission needed', 'Allow access to photos to upload your scribble.');
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
      Alert.alert('Permission needed', 'Allow camera to photograph your scribble.');
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
    speak('Now take a photo of your paper scribble!', 0.75);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
  };

  const handleRetry = () => {
    setResult(null);
    setImageUri(null);
    setPhase(1);
    speak('Let\'s try again! Scribble on paper first.', 0.75);
  };

  const stepDots = Array.from({ length: totalSteps }, (_, i) => i + 1);

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <GalleryBackground />
        <View style={styles.celebrateOverlay}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <View style={styles.celebrateCard}>
            <Text style={styles.celebrateEmoji}>🖼️</Text>
            <Text style={styles.celebrateTitle}>In the Gallery!</Text>
            <Text style={styles.celebrateSub}>Your real-world masterpiece</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <GalleryBackground />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <Ionicons name="chevron-back" size={22} color={GALLERY.textLight} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.gameLabel}>MASTERPIECE GALLERY</Text>
            <Text style={styles.gameTitle}>Real Paper Exhibit</Text>
          </View>
        </View>

        <View style={styles.dotsRow}>
          {stepDots.map((n) => (
            <View
              key={n}
              style={[styles.dot, n === currentStep && styles.dotActive, n < currentStep && styles.dotDone]}
            />
          ))}
        </View>

        <CuratorMascot hint={mascotHint} />
        <UploadStepGuide activeStep={phase} />

        {phase === 1 ? (
          <View style={styles.paperCard}>
            <View style={styles.paperFrame}>
              <Text style={styles.paperEmoji}>📄</Text>
              <Text style={styles.paperTitle}>On Real Paper</Text>
              <Text style={styles.paperDesc}>
                Use crayons or pencils to scribble freely on a sheet of paper — just like you practiced in the studios!
              </Text>
            </View>
            <Pressable
              onPress={handleReadyToUpload}
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color={GALLERY.textDark} />
              <Text style={styles.primaryBtnText}>I scribbled on paper!</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.uploadArea}>
            {imageUri ? (
              <View style={styles.frameOuter}>
                <View style={styles.frameInner}>
                  <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
                </View>
                <Text style={styles.frameCaption}>Your Exhibit</Text>
              </View>
            ) : (
              <View style={styles.placeholderFrame}>
                <Text style={styles.placeholderIcon}>📷</Text>
                <Text style={styles.placeholderText}>Frame your scribble</Text>
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
                <ActivityIndicator color={GALLERY.frameGold} size="large" />
                <Text style={styles.loadingText}>Curator is reviewing…</Text>
              </View>
            ) : (
              <View style={styles.buttons}>
                <Pressable
                  onPress={takePhoto}
                  style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
                >
                  <Ionicons name="camera" size={22} color={GALLERY.textDark} />
                  <Text style={styles.primaryBtnText}>Take Photo</Text>
                </Pressable>
                <Pressable
                  onPress={pickImage}
                  style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                >
                  <Ionicons name="images-outline" size={20} color={GALLERY.frameBrown} />
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
  root: { flex: 1, backgroundColor: GALLERY.velvet },
  safe: { flex: 1, paddingHorizontal: 18 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerCenter: { flex: 1 },
  gameLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: GALLERY.frameGoldLight,
    letterSpacing: 1.2,
  },
  gameTitle: { fontSize: 22, fontWeight: '900', color: GALLERY.textLight },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { width: 22, backgroundColor: GALLERY.frameGold },
  dotDone: { backgroundColor: GALLERY.success },

  paperCard: { flex: 1, gap: 16 },
  paperFrame: {
    flex: 1,
    backgroundColor: GALLERY.panel,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: GALLERY.frameGold,
    marginBottom: 8,
  },
  paperEmoji: { fontSize: 56, marginBottom: 16 },
  paperTitle: { fontSize: 22, fontWeight: '900', color: GALLERY.textDark, marginBottom: 10 },
  paperDesc: {
    fontSize: 16,
    fontWeight: '500',
    color: GALLERY.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },

  uploadArea: { flex: 1 },
  frameOuter: { alignItems: 'center', marginBottom: 16 },
  frameInner: {
    width: '100%',
    minHeight: 200,
    borderWidth: 6,
    borderColor: GALLERY.frameGold,
    backgroundColor: GALLERY.wall,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  preview: { width: '100%', height: 200, backgroundColor: GALLERY.wallDark },
  frameCaption: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: GALLERY.frameGoldLight,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  placeholderFrame: {
    minHeight: 180,
    borderWidth: 3,
    borderColor: GALLERY.frameGoldLight,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  placeholderIcon: { fontSize: 40, marginBottom: 8 },
  placeholderText: { fontSize: 15, fontWeight: '600', color: GALLERY.frameGoldLight },

  resultBox: { padding: 14, borderRadius: 14, marginBottom: 12 },
  resultSuccess: { backgroundColor: GALLERY.successBg, borderWidth: 2, borderColor: GALLERY.success },
  resultTry: { backgroundColor: GALLERY.tryBg, borderWidth: 2, borderColor: GALLERY.tryBorder },
  resultMessage: { fontSize: 18, fontWeight: '900', textAlign: 'center', color: GALLERY.textDark, marginBottom: 4 },
  resultFeedback: { fontSize: 14, textAlign: 'center', color: GALLERY.textMuted },

  loadingRow: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { fontSize: 15, fontWeight: '600', color: GALLERY.frameGoldLight },

  buttons: { gap: 10 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: GALLERY.frameGold,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: GALLERY.textDark },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: GALLERY.panel,
    borderWidth: 2,
    borderColor: GALLERY.frameGoldLight,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '700', color: GALLERY.frameBrown },
  retryBtn: { alignSelf: 'center', marginTop: 12, padding: 8 },
  retryText: { fontSize: 15, fontWeight: '700', color: GALLERY.frameGoldLight },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },

  celebrateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74,25,66,0.85)',
  },
  celebrateCard: {
    alignItems: 'center',
    backgroundColor: GALLERY.panel,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderWidth: 4,
    borderColor: GALLERY.frameGold,
  },
  celebrateEmoji: { fontSize: 56, marginBottom: 10 },
  celebrateTitle: { fontSize: 26, fontWeight: '900', color: GALLERY.textDark, marginBottom: 6 },
  celebrateSub: { fontSize: 15, fontWeight: '600', color: GALLERY.frameBrown },
});
