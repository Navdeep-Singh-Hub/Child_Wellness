/**
 * Game 5 — Sketch Vault: draw a ball IN a box, upload for AI check.
 * Logic Lab · Section 6 · Session 1 (capstone notebook task)
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
  'Draw a ball inside a box in your notebook. Then take a photo or upload your drawing.';

const VAULT = {
  amber: '#F59E0B',
  cream: '#FDE68A',
  parchment: '#FFFBEB',
  brown: '#78350F',
  ink: '#1C1917',
} as const;

const STEPS = [
  { icon: '✏️', title: 'Sketch', body: 'Draw a box and a ball inside it.' },
  { icon: '📷', title: 'Capture', body: 'Photograph or upload your page.' },
  { icon: '🔍', title: 'Verify', body: 'The lab checks box, ball, and IN!' },
] as const;

function ExampleSketch() {
  const dash = useSharedValue(0);
  useEffect(() => {
    dash.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      true,
    );
  }, [dash]);

  const glow = useAnimatedStyle(() => ({
    opacity: 0.2 + dash.value * 0.25,
  }));

  return (
    <View style={example.wrap}>
      <Text style={example.label}>TARGET SKETCH</Text>
      <Animated.View style={[example.glow, glow]} />
      <View style={example.paper}>
        <View style={example.box}>
          <View style={example.ball}>
            <View style={example.shine} />
          </View>
        </View>
        <Text style={example.caption}>ball IN box</Text>
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
          <ActivityIndicator size="small" color={VAULT.amber} />
        ) : (
          <Ionicons
            name={ok ? 'checkmark' : 'close'}
            size={16}
            color={ok ? LL.good : LL.warn}
          />
        )}
      </View>
      <Text style={check.label}>{label}</Text>
    </View>
  );
}

export function PrepositionInNotebookUpload({
  onComplete,
}: {
  onComplete: (correct: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    feedback: string;
    box_detected?: boolean;
    ball_detected?: boolean;
    ball_inside_box?: boolean;
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

      const res = await fetch(`${API_BASE_URL}/api/upload-preposition-in-task`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      const boxOk = data.box_detected ?? true;
      const ballOk = data.ball_detected ?? true;
      const insideOk = data.ball_inside_box ?? true;
      const correct = data.correct ?? (boxOk && ballOk && insideOk);
      const feedback = data.feedback || (correct ? 'Great job!' : "Let's try again!");

      setResult({
        correct,
        feedback,
        box_detected: data.box_detected,
        ball_detected: data.ball_detected,
        ball_inside_box: data.ball_inside_box,
      });

      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Great job! Your ball is IN the box!');
        setTimeout(() => onComplete(true), 2600);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak("Let's try again. Make sure the ball is inside the box.");
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
    ? 'The vault is analyzing your sketch…'
    : result?.correct
      ? 'Verified! Ball is IN the box.'
      : result
        ? 'Adjust your drawing and capture again.'
        : 'Draw on paper first, then capture your work.';

  return (
    <LogicLabGameShell
      studio="SKETCH VAULT · GAME 5"
      title="Notebook proof"
      instruction="Draw a ball IN a box, then upload or photograph your page."
      mascot="📓"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
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
          accessibilityLabel="Upload photo from gallery"
        >
          <LinearGradient colors={[VAULT.amber, VAULT.brown]} style={styles.actionGrad}>
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
          style={({ pressed }) => [styles.actionBtn, styles.actionBtnAlt, pressed && styles.pressed, uploading && styles.disabled]}
          accessibilityLabel="Take photo with camera"
        >
          <Text style={styles.actionEmoji}>📸</Text>
          <Text style={[styles.actionTxt, styles.actionTxtDark]}>Take Photo</Text>
        </Pressable>
      </View>

      {(uploading || result) && (
        <View style={[styles.resultCard, result?.correct ? styles.resultOk : styles.resultPending]}>
          {uploading ? (
            <>
              <ActivityIndicator color={VAULT.amber} size="large" />
              <Text style={styles.resultTitle}>Scanning sketch…</Text>
              <CheckRow label="Box detected" pending />
              <CheckRow label="Ball detected" pending />
              <CheckRow label="Ball inside box" pending />
            </>
          ) : result ? (
            <>
              <Text style={styles.resultTitle}>{result.correct ? 'Vault verified!' : 'Not quite yet'}</Text>
              <Text style={styles.resultFeedback}>{result.feedback}</Text>
              <CheckRow label="Box detected" ok={result.box_detected ?? result.correct} />
              <CheckRow label="Ball detected" ok={result.ball_detected ?? result.correct} />
              <CheckRow label="Ball inside box" ok={result.ball_inside_box ?? result.correct} />
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
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3, color: VAULT.cream, marginBottom: 8 },
  glow: {
    position: 'absolute',
    top: 20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: VAULT.amber,
  },
  paper: {
    width: '88%',
    backgroundColor: VAULT.parchment,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${VAULT.brown}88`,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  box: {
    width: 72,
    height: 58,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: VAULT.brown,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ball: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#B91C1C',
  },
  shine: {
    position: 'absolute',
    top: 4,
    left: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  caption: { marginTop: 10, fontSize: 14, fontWeight: '800', color: VAULT.brown },
});

const check = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
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
  iconPending: { backgroundColor: 'rgba(245,158,11,0.15)' },
  label: { fontSize: 14, fontWeight: '700', color: LL.textLight },
});

const styles = StyleSheet.create({
  stepsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepIcon: { fontSize: 16 },
  stepTitle: { fontSize: 11, fontWeight: '800', color: VAULT.cream },
  stepArrow: { fontSize: 14, color: LL.textMuted, marginHorizontal: 2 },
  previewWrap: { marginBottom: 14, alignItems: 'center' },
  previewLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: LL.textMuted, marginBottom: 6 },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: LL.glassBorder,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  actionBtn: { borderRadius: 18, overflow: 'hidden', minWidth: 148, flex: 1, maxWidth: 200 },
  actionBtnAlt: {
    backgroundColor: 'rgba(255,251,235,0.12)',
    borderWidth: 2,
    borderColor: `${VAULT.amber}66`,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  actionGrad: { paddingVertical: 16, alignItems: 'center', gap: 4 },
  actionEmoji: { fontSize: 28 },
  actionTxt: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  actionTxtDark: { color: VAULT.cream },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.65 },
  resultCard: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
  },
  resultOk: { borderColor: LL.good, backgroundColor: 'rgba(52,211,153,0.12)' },
  resultPending: { borderColor: LL.glassBorder, backgroundColor: 'rgba(15,23,42,0.45)' },
  resultTitle: { fontSize: 18, fontWeight: '900', color: LL.textLight, marginBottom: 6 },
  resultFeedback: { fontSize: 14, fontWeight: '600', color: LL.textMuted, textAlign: 'center', marginBottom: 4 },
  retryRow: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: VAULT.amber,
  },
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
