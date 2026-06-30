/**
 * Level 7 Reader — Session 4, Real World Task: Shape Beacon
 * Show something ROUND and something SQUARE together. Upload photo → AI verifies.
 */
import { ReaderGameShell } from '@/components/reader-session/shared/ReaderGameShell';
import { RD } from '@/components/reader-session/shared/readerTheme';
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
  'Show something round and something square together. Then take a photo or upload a picture of them in the same image.';
const BEACON = { accent: '#F59E0B', glow: '#FCD34D', amber: '#FBBF24' } as const;

const STEPS = [
  { icon: '⭕', title: 'Gather', body: 'Find round + square.' },
  { icon: '📷', title: 'Capture', body: 'Photograph both together.' },
  { icon: '🔭', title: 'Verify', body: 'Scan checks shapes!' },
] as const;

function ShapePairSketch() {
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
      <Text style={sketch.label}>TARGET SETUP</Text>
      <Animated.View style={[sketch.glow, glow]} />
      <View style={sketch.frame}>
        <View style={sketch.pairRow}>
          <View style={sketch.shapeSlot}>
            <View style={sketch.roundShape} />
            <Text style={sketch.shapeTag}>ROUND</Text>
          </View>
          <Text style={sketch.plus}>+</Text>
          <View style={sketch.shapeSlot}>
            <View style={sketch.squareShape} />
            <Text style={sketch.shapeTag}>SQUARE</Text>
          </View>
        </View>
        <Text style={sketch.caption}>one round object · one square object · same photo</Text>
        <View style={sketch.hintRow}>
          <Text style={sketch.hint}>✓ round shape</Text>
          <Text style={sketch.hint}>✓ square shape</Text>
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
          <ActivityIndicator size="small" color={BEACON.glow} />
        ) : (
          <Ionicons name={ok ? 'checkmark' : 'close'} size={16} color={ok ? RD.good : RD.warn} />
        )}
      </View>
      <Text style={check.label}>{label}</Text>
    </View>
  );
}

export function ReaderNotebookUploadRoundSquare({
  onComplete,
}: {
  onComplete: (correct: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    feedback: string;
    round_detected?: boolean;
    square_detected?: boolean;
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
      const filename = 'reader-s4-round-square.jpg';
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

      const res = await fetch(`${API_BASE_URL}/api/upload-reader-s4-round-square-task`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      const correct = data.correct === true;
      const feedback =
        data.feedback ||
        (correct
          ? 'SUCCESS! We see something round and something square!'
          : 'TRY AGAIN. Show something round and something square together in one photo.');

      setResult({
        correct,
        feedback,
        round_detected: data.round_detected,
        square_detected: data.square_detected,
      });

      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Success! Round and square!', 0.75);
        setTimeout(() => onComplete(true), 2600);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Show something round and something square together.', 0.75);
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
      Alert.alert('Permission needed', 'Allow access to photos to upload your picture.');
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
      Alert.alert('Permission needed', 'Allow camera to take a photo of something round and something square.');
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
    ? 'Scanning for round and square shapes…'
    : result?.correct
      ? 'Verified! Round and square detected.'
      : result
        ? 'Include both a round object and a square object — then capture again.'
        : 'Find a ball and a block, or any round and square things!';

  return (
    <ReaderGameShell
      studio="SHAPE BEACON · MISSION"
      title="Real-world proof"
      instruction="Show something round and something square together, then upload or photograph them."
      mascot="⭕"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 4 · REAL-WORLD TASK</Text>
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

      <ShapePairSketch />

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
          <LinearGradient colors={[BEACON.accent, '#D97706']} style={styles.actionGrad}>
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
              <ActivityIndicator color={BEACON.glow} size="large" />
              <Text style={styles.resultTitle}>Shape scan in progress…</Text>
              <CheckRow label="Round shape detected" pending />
              <CheckRow label="Square shape detected" pending />
            </>
          ) : result ? (
            <>
              <Text style={styles.resultTitle}>
                {result.correct ? 'Shape beacon verified!' : 'Adjust your setup'}
              </Text>
              <Text style={styles.resultFeedback}>{result.feedback}</Text>
              <CheckRow label="Round shape detected" ok={result.round_detected ?? result.correct} />
              <CheckRow label="Square shape detected" ok={result.square_detected ?? result.correct} />
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
    </ReaderGameShell>
  );
}

const sketch = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3, color: BEACON.glow, marginBottom: 8 },
  glow: {
    position: 'absolute',
    top: 28,
    width: 140,
    height: 70,
    borderRadius: 35,
    backgroundColor: BEACON.accent,
  },
  frame: {
    width: '92%',
    backgroundColor: 'rgba(11,10,26,0.65)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${BEACON.accent}55`,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  pairRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  shapeSlot: { alignItems: 'center', gap: 8 },
  roundShape: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BEACON.amber,
    borderWidth: 2,
    borderColor: BEACON.glow,
  },
  squareShape: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: BEACON.accent,
    borderWidth: 2,
    borderColor: BEACON.glow,
  },
  shapeTag: { fontSize: 9, fontWeight: '900', color: BEACON.glow, letterSpacing: 0.8 },
  plus: { fontSize: 22, fontWeight: '900', color: RD.textMuted },
  caption: { fontSize: 14, fontWeight: '800', color: RD.textLight, textAlign: 'center' },
  hintRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  hint: { fontSize: 11, fontWeight: '700', color: BEACON.glow },
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
  iconPending: { backgroundColor: 'rgba(252,211,77,0.15)' },
  label: { fontSize: 14, fontWeight: '700', color: RD.textLight },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: RD.glass,
    borderWidth: 1,
    borderColor: RD.glassBorder,
    marginBottom: 10,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: BEACON.glow },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 12 },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepIcon: { fontSize: 15 },
  stepTitle: { fontSize: 11, fontWeight: '800', color: BEACON.glow },
  stepArrow: { fontSize: 14, color: RD.textMuted, marginHorizontal: 2 },
  previewWrap: { marginBottom: 14, alignItems: 'center' },
  previewLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: RD.textMuted, marginBottom: 6 },
  preview: { width: '100%', height: 140, borderRadius: 14, borderWidth: 2, borderColor: RD.glassBorder },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  actionBtn: { borderRadius: 18, overflow: 'hidden', minWidth: 148, flex: 1, maxWidth: 200 },
  actionAlt: {
    borderWidth: 2,
    borderColor: `${BEACON.accent}66`,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  actionGrad: { paddingVertical: 16, alignItems: 'center', gap: 4 },
  actionEmoji: { fontSize: 28 },
  actionTxt: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  actionTxtAlt: { color: BEACON.glow },
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
  resultOk: { borderColor: RD.good, backgroundColor: 'rgba(52,211,153,0.12)' },
  resultPending: { borderColor: RD.glassBorder, backgroundColor: 'rgba(11,10,26,0.45)' },
  resultTitle: { fontSize: 18, fontWeight: '900', color: RD.textLight, marginBottom: 6 },
  resultFeedback: { fontSize: 14, fontWeight: '600', color: RD.textMuted, textAlign: 'center', marginBottom: 4 },
  retryRow: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  retryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: BEACON.accent },
  retryTxt: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  finishBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: RD.glassBorder,
  },
  finishTxt: { fontSize: 14, fontWeight: '700', color: RD.textMuted },
});
