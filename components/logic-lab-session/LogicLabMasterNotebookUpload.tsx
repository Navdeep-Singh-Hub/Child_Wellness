/**
 * Game 5 — Crown Ledger: draw 3 objects with different prepositions, upload for AI check.
 * Logic Lab · Section 6 · Session 10 (Logic Lab Master capstone)
 */
import { LogicLabGameShell } from '@/components/logic-lab-session/shared/LogicLabGameShell';
import { LL } from '@/components/logic-lab-session/shared/logicLabTheme';
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
  'Draw three objects using different prepositions in your notebook. Ball in box, cat under chair, cup on table. Then take a photo or upload your drawing.';

const CROWN = { gold: '#FBBF24', glow: '#FEF3C7', violet: '#7C3AED', paper: '#FFFBEB', ink: '#B45309' } as const;

const STEPS = [
  { icon: '✏️', title: 'Sketch', body: 'Draw 3 objects — IN, ON, UNDER.' },
  { icon: '📷', title: 'Capture', body: 'Photograph or upload your page.' },
  { icon: '🔍', title: 'Verify', body: 'Lab checks objects & positions!' },
] as const;

const EXAMPLES = [
  { emoji: '⚽', label: 'IN box', color: '#818CF8' },
  { emoji: '🐱', label: 'UNDER chair', color: '#A78BFA' },
  { emoji: '☕', label: 'ON table', color: '#38BDF8' },
] as const;

function MasterSketch() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      true,
    );
  }, [pulse]);

  const glow = useAnimatedStyle(() => ({
    opacity: 0.18 + pulse.value * 0.22,
  }));

  return (
    <View style={example.wrap}>
      <Text style={example.label}>TARGET SKETCH</Text>
      <Animated.View style={[example.glow, glow]} />
      <View style={example.paper}>
        <View style={example.grid}>
          {EXAMPLES.map((ex) => (
            <View key={ex.label} style={[example.chip, { borderColor: `${ex.color}66` }]}>
              <Text style={example.chipEmoji}>{ex.emoji}</Text>
              <Text style={[example.chipLbl, { color: ex.color }]}>{ex.label}</Text>
            </View>
          ))}
        </View>
        <Text style={example.caption}>three different positions</Text>
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
          <ActivityIndicator size="small" color={CROWN.glow} />
        ) : (
          <Ionicons name={ok ? 'checkmark' : 'close'} size={16} color={ok ? LL.good : LL.warn} />
        )}
      </View>
      <Text style={check.label}>{label}</Text>
    </View>
  );
}

export function LogicLabMasterNotebookUpload({
  onComplete,
}: {
  onComplete: (correct: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    feedback: string;
    objects_detected?: boolean;
    correct_spatial_relation?: boolean;
    pattern_or_sequence_detected?: boolean;
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

      const res = await fetch(`${API_BASE_URL}/api/upload-logic-lab-master-task`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      const objectsOk = data.objects_detected ?? true;
      const spatialOk = data.correct_spatial_relation ?? true;
      const patternOk = data.pattern_or_sequence_detected ?? true;
      const correct = data.correct ?? (objectsOk && spatialOk && patternOk);
      const feedback = data.feedback || (correct ? 'Great job!' : "Let's try again!");

      setResult({
        correct,
        feedback,
        objects_detected: data.objects_detected,
        correct_spatial_relation: data.correct_spatial_relation,
        pattern_or_sequence_detected: data.pattern_or_sequence_detected,
      });

      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Great job! You are a Logic Lab Master!');
        setTimeout(() => onComplete(true), 2600);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak("Let's try again. Use IN, ON, and UNDER in your drawing.");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload failed. Try again.';
      setResult({ correct: false, feedback: msg });
      speak("Let's try again!");
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
    ? 'Scanning your master sketch…'
    : result?.correct
      ? 'Verified! Objects, positions, and pattern — perfect!'
      : result
        ? 'Use IN, ON, and UNDER — then capture again.'
        : 'Sketch ball IN box, cat UNDER chair, cup ON table.';

  return (
    <LogicLabGameShell
      studio="CROWN LEDGER · GAME 5"
      title="Notebook proof"
      instruction="Draw three objects using different prepositions, then upload or photograph your page."
      mascot="📓"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 10 · LOGIC LAB MASTER · CAPSTONE</Text>
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

      <MasterSketch />

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
          <LinearGradient colors={[CROWN.gold, CROWN.ink]} style={styles.actionGrad}>
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
          style={({ pressed }) => [styles.actionBtn, styles.actionAlt, pressed && styles.pressed, uploading && styles.disabled]}
        >
          <Text style={styles.actionEmoji}>📸</Text>
          <Text style={[styles.actionTxt, styles.actionTxtAlt]}>Take Photo</Text>
        </Pressable>
      </View>

      {(uploading || result) && (
        <View style={[styles.resultCard, result?.correct ? styles.resultOk : styles.resultPending]}>
          {uploading ? (
            <>
              <ActivityIndicator color={CROWN.glow} size="large" />
              <Text style={styles.resultTitle}>Crown scan in progress…</Text>
              <CheckRow label="Three objects detected" pending />
              <CheckRow label="Correct spatial relations" pending />
              <CheckRow label="Pattern or sequence detected" pending />
            </>
          ) : result ? (
            <>
              <Text style={styles.resultTitle}>
                {result.correct ? 'Crown Ledger verified!' : 'Adjust your sketch'}
              </Text>
              <Text style={styles.resultFeedback}>{result.feedback}</Text>
              <CheckRow label="Three objects detected" ok={result.objects_detected ?? result.correct} />
              <CheckRow label="Correct spatial relations" ok={result.correct_spatial_relation ?? result.correct} />
              <CheckRow
                label="Pattern or sequence detected"
                ok={result.pattern_or_sequence_detected ?? result.correct}
              />
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
    </LogicLabGameShell>
  );
}

const example = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3, color: CROWN.glow, marginBottom: 8 },
  glow: {
    position: 'absolute',
    top: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: CROWN.violet,
  },
  paper: {
    width: '88%',
    backgroundColor: CROWN.paper,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${CROWN.ink}55`,
    paddingVertical: 18,
    alignItems: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: {
    width: 88,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(124,58,237,0.08)',
    alignItems: 'center',
  },
  chipEmoji: { fontSize: 26 },
  chipLbl: { fontSize: 10, fontWeight: '900', marginTop: 4, textAlign: 'center' },
  caption: { marginTop: 14, fontSize: 14, fontWeight: '800', color: CROWN.ink },
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
  iconBad: { backgroundColor: 'rgba(251,113,133,0.2)' },
  iconPending: { backgroundColor: 'rgba(254,243,199,0.15)' },
  label: { fontSize: 14, fontWeight: '700', color: LL.textLight },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1,
    borderColor: `${CROWN.gold}55`,
    marginBottom: 10,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: CROWN.glow },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 12 },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepIcon: { fontSize: 15 },
  stepTitle: { fontSize: 11, fontWeight: '800', color: CROWN.glow },
  stepArrow: { fontSize: 14, color: LL.textMuted, marginHorizontal: 2 },
  previewWrap: { marginBottom: 14, alignItems: 'center' },
  previewLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: LL.textMuted, marginBottom: 6 },
  preview: { width: '100%', height: 140, borderRadius: 14, borderWidth: 2, borderColor: LL.glassBorder },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  actionBtn: { borderRadius: 18, overflow: 'hidden', minWidth: 148, flex: 1, maxWidth: 200 },
  actionAlt: {
    borderWidth: 2,
    borderColor: `${CROWN.violet}66`,
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  actionGrad: { paddingVertical: 16, alignItems: 'center', gap: 4 },
  actionEmoji: { fontSize: 28 },
  actionTxt: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  actionTxtAlt: { color: CROWN.glow },
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
  resultOk: { borderColor: LL.good, backgroundColor: 'rgba(52,211,153,0.12)' },
  resultPending: { borderColor: LL.glassBorder, backgroundColor: 'rgba(15,23,42,0.45)' },
  resultTitle: { fontSize: 18, fontWeight: '900', color: LL.textLight, marginBottom: 6 },
  resultFeedback: { fontSize: 14, fontWeight: '600', color: LL.textMuted, textAlign: 'center', marginBottom: 4 },
  retryRow: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  retryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: CROWN.violet },
  retryTxt: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  finishBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: LL.glassBorder,
  },
  finishTxt: { fontSize: 14, fontWeight: '700', color: LL.textMuted },
});
