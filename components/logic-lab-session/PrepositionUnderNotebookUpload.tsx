/**
 * Game 5 — Shadow Proof: draw a cat UNDER a table, upload for AI check.
 * Logic Lab · Section 6 · Session 3 (capstone notebook task)
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
  'Draw a cat under a table in your notebook. Then take a photo or upload your drawing.';

const SHADE = {
  violet: '#7C3AED',
  glow: '#A78BFA',
  shadow: '#312E81',
  paper: '#F5F3FF',
  ink: '#4C1D95',
  wood: '#D4A574',
} as const;

const STEPS = [
  { icon: '✏️', title: 'Sketch', body: 'Draw a table with a cat UNDER it.' },
  { icon: '📷', title: 'Capture', body: 'Photograph or upload your page.' },
  { icon: '🔍', title: 'Verify', body: 'Lab checks table, cat, and UNDER!' },
] as const;

function ExampleSketch() {
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
        <View style={example.table}>
          <LinearGradient colors={['#FCD34D', '#D97706', '#92400E']} style={example.tableGrad} />
        </View>
        <View style={example.shadowZone}>
          <View style={example.cat}>
            <Text style={example.catFace}>🐱</Text>
          </View>
        </View>
        <Text style={example.caption}>cat UNDER table</Text>
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
          <ActivityIndicator size="small" color={SHADE.glow} />
        ) : (
          <Ionicons name={ok ? 'checkmark' : 'close'} size={16} color={ok ? LL.good : LL.warn} />
        )}
      </View>
      <Text style={check.label}>{label}</Text>
    </View>
  );
}

export function PrepositionUnderNotebookUpload({
  onComplete,
}: {
  onComplete: (correct: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    feedback: string;
    table_detected?: boolean;
    cat_detected?: boolean;
    cat_under_table?: boolean;
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

      const res = await fetch(`${API_BASE_URL}/api/upload-preposition-under-task`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      const tableOk = data.table_detected ?? true;
      const catOk = data.cat_detected ?? true;
      const underOk = data.cat_under_table ?? true;
      const correct = data.correct ?? (tableOk && catOk && underOk);
      const feedback = data.feedback || (correct ? 'Great job!' : "Let's try again!");

      setResult({
        correct,
        feedback,
        table_detected: data.table_detected,
        cat_detected: data.cat_detected,
        cat_under_table: data.cat_under_table,
      });

      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Great job! The cat is UNDER the table!');
        setTimeout(() => onComplete(true), 2600);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak("Let's try again. Draw the cat hiding UNDER the table.");
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
    ? 'Scanning your shadow sketch…'
    : result?.correct
      ? 'Verified! Cat is UNDER the table.'
      : result
        ? 'Place the cat UNDER the table and capture again.'
        : 'Sketch on paper first — cat hiding UNDER the table.';

  return (
    <LogicLabGameShell
      studio="SHADOW PROOF · GAME 5"
      title="Notebook proof"
      instruction="Draw a cat UNDER a table, then upload or photograph your page."
      mascot="🐱"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 3 · UNDER · CAPSTONE</Text>
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

      <ExampleSketch />

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
          <LinearGradient colors={[SHADE.violet, SHADE.ink]} style={styles.actionGrad}>
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
              <ActivityIndicator color={SHADE.glow} size="large" />
              <Text style={styles.resultTitle}>Shadow scan in progress…</Text>
              <CheckRow label="Table detected" pending />
              <CheckRow label="Cat detected" pending />
              <CheckRow label="Cat UNDER table" pending />
            </>
          ) : result ? (
            <>
              <Text style={styles.resultTitle}>{result.correct ? 'Shadow Proof verified!' : 'Adjust your sketch'}</Text>
              <Text style={styles.resultFeedback}>{result.feedback}</Text>
              <CheckRow label="Table detected" ok={result.table_detected ?? result.correct} />
              <CheckRow label="Cat detected" ok={result.cat_detected ?? result.correct} />
              <CheckRow label="Cat UNDER table" ok={result.cat_under_table ?? result.correct} />
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
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3, color: SHADE.glow, marginBottom: 8 },
  glow: {
    position: 'absolute',
    top: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: SHADE.violet,
  },
  paper: {
    width: '88%',
    backgroundColor: SHADE.paper,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${SHADE.ink}55`,
    paddingVertical: 20,
    alignItems: 'center',
    minHeight: 120,
  },
  table: {
    width: 90,
    height: 22,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#92400E',
    marginBottom: 4,
  },
  tableGrad: { ...StyleSheet.absoluteFillObject },
  shadowZone: {
    width: 90,
    height: 36,
    backgroundColor: 'rgba(76,29,149,0.12)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${SHADE.violet}33`,
    borderTopWidth: 0,
  },
  cat: {
    width: 36,
    height: 28,
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catFace: { fontSize: 18 },
  caption: { marginTop: 12, fontSize: 14, fontWeight: '800', color: SHADE.ink },
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
  iconPending: { backgroundColor: 'rgba(167,139,250,0.15)' },
  label: { fontSize: 14, fontWeight: '700', color: LL.textLight },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderWidth: 1,
    borderColor: `${SHADE.glow}55`,
    marginBottom: 10,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: SHADE.glow },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 12 },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepIcon: { fontSize: 15 },
  stepTitle: { fontSize: 11, fontWeight: '800', color: SHADE.glow },
  stepArrow: { fontSize: 14, color: LL.textMuted, marginHorizontal: 2 },
  previewWrap: { marginBottom: 14, alignItems: 'center' },
  previewLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: LL.textMuted, marginBottom: 6 },
  preview: { width: '100%', height: 140, borderRadius: 14, borderWidth: 2, borderColor: LL.glassBorder },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  actionBtn: { borderRadius: 18, overflow: 'hidden', minWidth: 148, flex: 1, maxWidth: 200 },
  actionAlt: {
    borderWidth: 2,
    borderColor: `${SHADE.glow}66`,
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  actionGrad: { paddingVertical: 16, alignItems: 'center', gap: 4 },
  actionEmoji: { fontSize: 28 },
  actionTxt: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  actionTxtAlt: { color: SHADE.glow },
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
  retryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: SHADE.violet },
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
