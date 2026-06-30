/**
 * Notebook Task — Master Sketch: Draw two signs and one coin (STOP, EXIT, ₹5).
 */
import { CitizenGameShell } from '@/components/citizen-session/shared/CitizenGameShell';
import { CZ } from '@/components/citizen-session/shared/citizenTheme';
import { speak } from '@/utils/tts';
import { API_BASE_URL, authHeaders } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const VOICE =
  'Draw two signs and one coin in your notebook. Then upload or take a photo.';
const MASTER = { accent: '#FBBF24', glow: '#FEF3C7', violet: '#7C3AED', coinGlow: '#FCD34D' } as const;

const STEPS = [
  { icon: '✏️', title: 'Draw', body: '2 signs + coin' },
  { icon: '📓', title: 'Notebook', body: 'Clear sketches' },
  { icon: '📷', title: 'Capture', body: 'Photograph it' },
] as const;

function MasterSketchTargets() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      true,
    );
  }, [pulse]);

  const glow = useAnimatedStyle(() => ({
    opacity: 0.14 + pulse.value * 0.18,
  }));

  return (
    <View style={sketch.wrap}>
      <Text style={sketch.label}>TARGET SKETCHES</Text>
      <Animated.View style={[sketch.glow, glow]} />
      <View style={sketch.frame}>
        <View style={sketch.targetsRow}>
          <View style={[sketch.plate, { borderColor: '#991B1B' }]}>
            <Text style={sketch.plateIcon}>🛑</Text>
            <Text style={[sketch.plateText, { color: '#FCA5A5' }]}>STOP</Text>
          </View>
          <View style={[sketch.plate, { borderColor: '#166534' }]}>
            <Text style={sketch.plateIcon}>🚪</Text>
            <Text style={[sketch.plateText, { color: '#86EFAC' }]}>EXIT</Text>
          </View>
          <View style={[sketch.coinPlate, { borderColor: MASTER.coinGlow }]}>
            <Text style={sketch.coinText}>₹5</Text>
          </View>
        </View>
        <Text style={sketch.caption}>STOP sign · EXIT sign · five-rupee coin</Text>
        <View style={sketch.hintRow}>
          <Text style={sketch.hint}>✓ 2 signs</Text>
          <Text style={sketch.hint}>✓ 1 coin</Text>
          <Text style={sketch.hint}>✓ clear</Text>
        </View>
      </View>
    </View>
  );
}

function CheckRow({ label, ok, pending }: { label: string; ok?: boolean; pending?: boolean }) {
  return (
    <View style={check.row}>
      <View
        style={[
          check.icon,
          ok === true && check.iconOk,
          ok === false && check.iconBad,
          pending && check.iconPending,
        ]}
      >
        {pending ? (
          <ActivityIndicator size="small" color={MASTER.glow} />
        ) : (
          <Ionicons name={ok ? 'checkmark' : 'close'} size={16} color={ok ? CZ.good : CZ.warn} />
        )}
      </View>
      <Text style={check.label}>{label}</Text>
    </View>
  );
}

export function CitizenMasterNotebookUpload({
  onComplete,
}: {
  onComplete: (correct: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    feedback: string;
    two_signs_detected?: boolean;
    coin_detected?: boolean;
    drawing_valid?: boolean;
  } | null>(null);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const uploadImage = async (uri: string) => {
    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      const filename = 'notebook.jpg';
      const type = 'image/jpeg';

      if (Platform.OS === 'web' && (uri.startsWith('blob:') || uri.startsWith('data:'))) {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('file', blob, filename);
      } else {
        formData.append('file', { uri, name: filename, type } as unknown as Blob);
      }

      const headers = await authHeaders({ multipart: true });
      delete (headers as Record<string, string>)['Content-Type'];

      const res = await fetch(`${API_BASE_URL}/api/upload-citizen-master-task`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      const signsOk = data.two_signs_detected ?? true;
      const coinOk = data.coin_detected ?? true;
      const drawingOk = data.drawing_valid ?? true;
      const correct = data.correct ?? (signsOk && coinOk && drawingOk);
      const feedback =
        data.feedback ||
        (correct ? 'Great job!' : "Let's try again! Draw clearer STOP, EXIT, and ₹5.");

      setResult({
        correct,
        feedback,
        two_signs_detected: data.two_signs_detected,
        coin_detected: data.coin_detected,
        drawing_valid: data.drawing_valid,
      });

      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Great job!', 0.75);
        setTimeout(() => onComplete(true), 2600);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak("Let's try again!", 0.7);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload failed. Try again.';
      setResult({ correct: false, feedback: msg });
      speak("Let's try again!", 0.7);
    } finally {
      setUploading(false);
    }
  };

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
    setImageUri(uri);
    await uploadImage(uri);
  };

  const coachLine = uploading
    ? 'Scanning for two signs and one coin…'
    : result?.correct
      ? 'Verified! Your master sketch looks great.'
      : result
        ? 'Draw STOP, EXIT, and ₹5 big and clear — then capture again.'
        : 'Sketch STOP + EXIT signs and a ₹5 coin — then photograph!';

  return (
    <CitizenGameShell
      studio="MASTER SKETCH · FINALE"
      title="Notebook proof"
      instruction="Draw two signs and one coin. Then upload or take a photo."
      mascot="🏆"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 10 · FINALE NOTEBOOK</Text>
      </View>

      <View style={styles.stepsRow}>
        {STEPS.map((s, i) => (
          <View key={s.title} style={styles.stepChip}>
            <Text style={styles.stepIcon}>{s.icon}</Text>
            <Text style={styles.stepTitle}>{s.title}</Text>
            {i < STEPS.length - 1 && <Text style={styles.stepArrow}>›</Text>}
          </View>
        ))}
      </View>

      <MasterSketchTargets />

      {imageUri && !uploading && (
        <View style={styles.previewWrap}>
          <Text style={styles.previewLabel}>YOUR CAPTURE</Text>
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          onPress={pickImage}
          disabled={uploading}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed, uploading && styles.disabled]}
        >
          <LinearGradient colors={[MASTER.accent, MASTER.violet]} style={styles.actionGrad}>
            {uploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.actionEmoji}>📷</Text>
                <Text style={styles.actionTxt}>Upload Photo</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={takePhoto}
          disabled={uploading}
          style={({ pressed }) => [
            styles.actionBtn,
            styles.actionAlt,
            pressed && styles.pressed,
            uploading && styles.disabled,
          ]}
        >
          <Text style={styles.actionEmoji}>📸</Text>
          <Text style={[styles.actionTxt, styles.actionTxtAlt]}>Take Photo</Text>
        </Pressable>
      </View>

      {(uploading || result) && (
        <View style={[styles.resultCard, result?.correct ? styles.resultOk : styles.resultPending]}>
          {uploading ? (
            <>
              <ActivityIndicator color={MASTER.glow} size="large" />
              <Text style={styles.resultTitle}>Master scan in progress…</Text>
              <CheckRow label="Two signs detected" pending />
              <CheckRow label="Coin detected" pending />
              <CheckRow label="Drawing looks valid" pending />
            </>
          ) : result ? (
            <>
              <Text style={styles.resultTitle}>
                {result.correct ? 'Master sketch verified!' : 'Adjust your drawing'}
              </Text>
              <Text style={styles.resultFeedback}>{result.feedback}</Text>
              <CheckRow label="Two signs detected" ok={result.two_signs_detected ?? result.correct} />
              <CheckRow label="Coin detected" ok={result.coin_detected ?? result.correct} />
              <CheckRow label="Drawing looks valid" ok={result.drawing_valid ?? result.correct} />
              {!result.correct && (
                <View style={styles.retryRow}>
                  <Pressable
                    onPress={() => {
                      setResult(null);
                      setImageUri(null);
                    }}
                    style={styles.retryBtn}
                  >
                    <Text style={styles.retryTxt}>Try another photo</Text>
                  </Pressable>
                  <Pressable onPress={() => onComplete(false)} style={styles.finishBtn}>
                    <Text style={styles.finishTxt}>Finish anyway</Text>
                  </Pressable>
                </View>
              )}
            </>
          ) : null}
        </View>
      )}
    </CitizenGameShell>
  );
}

const sketch = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3, color: MASTER.glow, marginBottom: 8 },
  glow: {
    position: 'absolute',
    top: 44,
    width: 200,
    height: 70,
    borderRadius: 14,
    backgroundColor: MASTER.accent,
  },
  frame: {
    width: '92%',
    backgroundColor: 'rgba(26,10,18,0.65)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${MASTER.accent}55`,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  targetsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 12 },
  plate: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.65)',
    alignItems: 'center',
    gap: 4,
    minWidth: 72,
  },
  plateIcon: { fontSize: 28 },
  plateText: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  coinPlate: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinText: { fontSize: 20, fontWeight: '900', color: MASTER.coinGlow },
  caption: { fontSize: 13, fontWeight: '800', color: CZ.textLight, textAlign: 'center' },
  hintRow: { flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' },
  hint: { fontSize: 11, fontWeight: '700', color: MASTER.glow },
});

const check = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, alignSelf: 'stretch' },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOk: { backgroundColor: 'rgba(52,211,153,0.2)' },
  iconBad: { backgroundColor: 'rgba(239,68,68,0.2)' },
  iconPending: { backgroundColor: 'rgba(254,243,199,0.15)' },
  label: { fontSize: 14, fontWeight: '700', color: CZ.textLight },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: CZ.glass,
    borderWidth: 1,
    borderColor: `${MASTER.accent}66`,
    marginBottom: 10,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: MASTER.glow },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 12 },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepIcon: { fontSize: 15 },
  stepTitle: { fontSize: 11, fontWeight: '800', color: MASTER.glow },
  stepArrow: { fontSize: 14, color: CZ.textMuted, marginHorizontal: 2 },
  previewWrap: { marginBottom: 14, alignItems: 'center' },
  previewLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: CZ.textMuted, marginBottom: 6 },
  preview: { width: '100%', height: 140, borderRadius: 14, borderWidth: 2, borderColor: CZ.glassBorder },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  actionBtn: { borderRadius: 18, overflow: 'hidden', minWidth: 148, flex: 1, maxWidth: 200 },
  actionAlt: {
    borderWidth: 2,
    borderColor: `${MASTER.accent}66`,
    backgroundColor: 'rgba(251,191,36,0.12)',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  actionGrad: { paddingVertical: 16, alignItems: 'center', gap: 4 },
  actionEmoji: { fontSize: 28 },
  actionTxt: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  actionTxtAlt: { color: MASTER.glow },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.65 },
  resultCard: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  resultOk: { borderColor: CZ.good, backgroundColor: 'rgba(52,211,153,0.12)' },
  resultPending: { borderColor: CZ.glassBorder, backgroundColor: 'rgba(26,10,18,0.45)' },
  resultTitle: { fontSize: 18, fontWeight: '900', color: CZ.textLight, marginBottom: 6 },
  resultFeedback: { fontSize: 14, fontWeight: '600', color: CZ.textMuted, textAlign: 'center', marginBottom: 4 },
  retryRow: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  retryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: MASTER.accent },
  retryTxt: { fontSize: 14, fontWeight: '800', color: '#1f2937' },
  finishBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: CZ.glassBorder,
  },
  finishTxt: { fontSize: 14, fontWeight: '700', color: CZ.textMuted },
});
