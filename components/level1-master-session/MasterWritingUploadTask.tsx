/**
 * Game 5: Royal Decree — write A–Z clearly on paper and upload.
 * POST /api/verify-master-writing
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
import { LetterMascot } from '@/components/level1-straight-letters-session/letters-shared/LetterMascot';

type UploadPhase = 1 | 2 | 3;

const SHELL = {
  bg: '#292524',
  labelColor: '#FDE047',
  titleColor: '#FAFAF9',
  textOnDark: '#FAFAF9',
  backBg: 'rgba(255,255,255,0.1)',
  backBorder: 'rgba(253,224,71,0.35)',
  dotIdle: 'rgba(255,255,255,0.15)',
  dotActive: '#FDE047',
  dotDone: '#34D399',
};

const INSTRUCTION = 'Write A to Z clearly on paper in order, then upload a photo. Make each letter recognizable!';

export function MasterWritingUploadTask({
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
      speak('Write A to Z clearly on paper in order, then photograph your page for the royal decree!', 0.72);
    }
    return () => stopTTS();
  }, []);

  const mascotHint =
    phase === 1
      ? 'Write A through Z clearly on paper!'
      : phase === 2
        ? 'Ready? Photograph your alphabet page.'
        : result?.success
          ? 'Royal decree verified!'
          : result
            ? result.feedback
            : 'The scribe is reviewing your page…';

  const upload = useCallback(
    async (uri: string) => {
      setUploading(true);
      setPhase(3);
      try {
        const fd = new FormData();
        if (Platform.OS === 'web' && (uri.startsWith('blob:') || uri.startsWith('data:'))) {
          const blob = await (await fetch(uri)).blob();
          fd.append('file', blob, 'master-writing.jpg');
        } else {
          fd.append('file', { uri, name: 'master-writing.jpg', type: 'image/jpeg' } as any);
        }
        const h = await authHeaders({ multipart: true });
        delete (h as Record<string, string>)['Content-Type'];
        const res = await fetch(`${API_BASE_URL}/api/verify-master-writing`, { method: 'POST', headers: h, body: fd });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || `Upload failed: ${res.status}`);
        }
        const data = await res.json();
        const ok = data.success === true;
        setResult({
          success: ok,
          message: ok ? 'Verified!' : 'Try Again',
          feedback: data.feedback || (ok ? 'Perfect writing!' : 'Try again with clearer letters.'),
        });
        if (ok) {
          setShowCelebrate(true);
          speak('Royal decree accepted! Level one mastery achieved!', 0.72);
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
          setTimeout(() => {
            setShowCelebrate(false);
            onComplete(true);
          }, reduceMotion ? 800 : 2000);
        } else {
          speak(data.feedback || 'Try writing more letters clearly.', 0.72);
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch (_) {}
        }
      } catch (e) {
        setResult({
          success: false,
          message: 'Try Again',
          feedback: e instanceof Error ? e.message : 'Something went wrong.',
        });
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
      Alert.alert('Permission needed', 'Allow access to photos.');
      return;
    }
    setPhase(2);
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (r.canceled) return;
    setImageUri(r.assets[0].uri);
    setResult(null);
    await upload(r.assets[0].uri);
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
    await upload(r.assets[0].uri);
  };

  const handleReady = () => {
    setPhase(2);
    speak('Now photograph your A to Z page!', 0.72);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}
  };

  const handleRetry = () => {
    setResult(null);
    setImageUri(null);
    setPhase(1);
    speak('Let us try again! Write A to Z on paper first.', 0.72);
  };

  const stepDots = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const phases = [
    { n: 1, label: 'Write A–Z', icon: '✏️' },
    { n: 2, label: 'Photograph', icon: '📷' },
    { n: 3, label: 'Verify', icon: '📜' },
  ];

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={{ flex: 1, backgroundColor: SHELL.bg }} />
        </View>
        <View style={styles.celebrateOverlay}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <View style={styles.celebrateCard}>
            <Text style={styles.celebrateEmoji}>👑</Text>
            <Text style={styles.celebrateTitle}>Royal Decree!</Text>
            <Text style={styles.celebrateSub}>Your master writing is official</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={{ flex: 1, backgroundColor: SHELL.bg }} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(253,224,71,0.08)' }]} />
      </View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: SHELL.backBg, borderColor: SHELL.backBorder },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={SHELL.textOnDark} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.gameLabel}>ROYAL DECREE</Text>
            <Text style={styles.gameTitle}>Master A–Z Upload</Text>
          </View>
        </View>

        <View style={styles.dotsRow}>
          {stepDots.map((n) => (
            <View
              key={n}
              style={[
                styles.dot,
                { backgroundColor: SHELL.dotIdle },
                n === currentStep && [styles.dotActive, { backgroundColor: SHELL.dotActive }],
                n < currentStep && { backgroundColor: SHELL.dotDone },
              ]}
            />
          ))}
        </View>

        <LetterMascot
          emoji="📜"
          name="Scribe"
          hint={mascotHint}
          accent="#FDE047"
          bubbleBg="rgba(255,255,255,0.08)"
          bubbleBorder="rgba(253,224,71,0.35)"
          nameColor="#FDE047"
          hintColor="#FAFAF9"
        />

        <View style={styles.phaseRow}>
          {phases.map((p) => (
            <View key={p.n} style={styles.phaseStep}>
              <View style={[styles.phaseDot, phase >= p.n && styles.phaseDotActive]}>
                <Text style={styles.phaseIcon}>{p.icon}</Text>
              </View>
              <Text style={[styles.phaseLabel, phase >= p.n && styles.phaseLabelActive]}>{p.label}</Text>
            </View>
          ))}
        </View>

        {phase === 1 ? (
          <View style={styles.paperCard}>
            <View style={styles.paperFrame}>
              <Text style={styles.alphaRow}>A B C … X Y Z</Text>
              <Text style={styles.paperTitle}>Master Alphabet Page</Text>
              <Text style={styles.paperDesc}>{INSTRUCTION}</Text>
            </View>
            <Pressable onPress={handleReady} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
              <Ionicons name="checkmark-circle-outline" size={22} color={SHELL.bg} />
              <Text style={styles.primaryBtnText}>I wrote A–Z!</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.uploadArea}>
            {imageUri ? (
              <View style={styles.frameOuter}>
                <View style={styles.frameInner}>
                  <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
                </View>
                <Text style={styles.frameCaption}>Royal Decree Page</Text>
              </View>
            ) : (
              <View style={styles.placeholderFrame}>
                <Text style={styles.placeholderIcon}>📷</Text>
                <Text style={styles.placeholderText}>Photograph your alphabet page</Text>
              </View>
            )}
            {result && (
              <View style={[styles.resultBox, result.success ? styles.resultOk : styles.resultFail]}>
                <Text style={styles.resultMsg}>{result.message}</Text>
                <Text style={styles.resultFb}>{result.feedback}</Text>
              </View>
            )}
            {uploading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#FDE047" size="large" />
                <Text style={styles.loadingText}>Scribe is reviewing…</Text>
              </View>
            ) : (
              <View style={styles.buttons}>
                <Pressable onPress={takePhoto} style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}>
                  <Ionicons name="camera" size={22} color={SHELL.bg} />
                  <Text style={styles.primaryBtnText}>Take Photo</Text>
                </Pressable>
                <Pressable onPress={pickImage} style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}>
                  <Ionicons name="images-outline" size={20} color="#FAFAF9" />
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
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  headerCenter: { flex: 1 },
  gameLabel: { fontSize: 10, fontWeight: '800', color: '#FDE047', letterSpacing: 1.2 },
  gameTitle: { fontSize: 22, fontWeight: '900', color: '#FAFAF9' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 22 },
  phaseRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 6 },
  phaseStep: { flex: 1, alignItems: 'center' },
  phaseDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  phaseDotActive: { backgroundColor: 'rgba(253,224,71,0.2)', borderColor: '#FDE047' },
  phaseIcon: { fontSize: 18 },
  phaseLabel: { fontSize: 10, fontWeight: '600', color: '#D6D3D1', textAlign: 'center' },
  phaseLabelActive: { color: '#FAFAF9', fontWeight: '800' },
  paperCard: { flex: 1, gap: 16 },
  paperFrame: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(253,224,71,0.5)',
    marginBottom: 8,
  },
  alphaRow: { fontSize: 22, fontWeight: '900', color: '#FDE047', letterSpacing: 4, marginBottom: 16 },
  paperTitle: { fontSize: 22, fontWeight: '900', color: '#FAFAF9', marginBottom: 10 },
  paperDesc: { fontSize: 16, fontWeight: '500', color: '#D6D3D1', textAlign: 'center', lineHeight: 24, maxWidth: 300 },
  uploadArea: { flex: 1 },
  frameOuter: { alignItems: 'center', marginBottom: 16 },
  frameInner: {
    width: '100%',
    minHeight: 200,
    borderWidth: 4,
    borderColor: '#FDE047',
    backgroundColor: '#FFF',
    padding: 8,
  },
  preview: { width: '100%', height: 200, backgroundColor: '#FAFAF9' },
  frameCaption: { marginTop: 8, fontSize: 12, fontWeight: '700', color: '#FDE047', letterSpacing: 1, textTransform: 'uppercase' },
  placeholderFrame: {
    minHeight: 180,
    borderWidth: 3,
    borderColor: '#FDE047',
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  placeholderIcon: { fontSize: 40, marginBottom: 8 },
  placeholderText: { fontSize: 15, fontWeight: '600', color: '#D6D3D1' },
  resultBox: { padding: 14, borderRadius: 14, marginBottom: 12 },
  resultOk: { backgroundColor: '#D1FAE5', borderWidth: 2, borderColor: '#059669' },
  resultFail: { backgroundColor: '#FEE2E2', borderWidth: 2, borderColor: '#DC2626' },
  resultMsg: { fontSize: 18, fontWeight: '900', textAlign: 'center', color: '#1F2937', marginBottom: 4 },
  resultFb: { fontSize: 14, textAlign: 'center', color: '#6B7280' },
  loadingRow: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { fontSize: 15, fontWeight: '600', color: '#FDE047' },
  buttons: { gap: 10 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FDE047',
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#292524' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(253,224,71,0.5)',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '700', color: '#FAFAF9' },
  retryBtn: { alignSelf: 'center', marginTop: 12, padding: 8 },
  retryText: { fontSize: 15, fontWeight: '700', color: '#FDE047' },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  celebrateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(41,37,36,0.85)',
  },
  celebrateCard: {
    alignItems: 'center',
    backgroundColor: '#FAFAF9',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderWidth: 4,
    borderColor: '#FDE047',
  },
  celebrateEmoji: { fontSize: 56, marginBottom: 10 },
  celebrateTitle: { fontSize: 26, fontWeight: '900', color: '#292524', marginBottom: 6 },
  celebrateSub: { fontSize: 15, fontWeight: '600', color: '#57534E' },
});
