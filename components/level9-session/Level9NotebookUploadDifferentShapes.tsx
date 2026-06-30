/**
 * Level 9 (Clockwise) — Session 7, Real World Task: Show THREE objects of different shapes.
 * Upload photo → AI verifies shape differences.
 */
import { ClockwiseGameShell } from '@/components/level9-session/shared/ClockwiseGameShell';
import { CW } from '@/components/level9-session/shared/clockwiseTheme';
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
  'Show three objects of different shapes. Then upload or take a photo.';

const PALETTE = { accent: '#F43F5E', glow: '#FDA4AF', secondary: '#FB7185' } as const;

const STEPS = [
  { icon: '📦', title: 'Gather', body: 'Find 3 objects.' },
  { icon: '⬜', title: 'Compare', body: 'Different shapes.' },
  { icon: '📷', title: 'Capture', body: 'Photograph all three.' },
] as const;

const SHAPE_SAMPLES = [
  { emoji: '🔴', label: 'Round', hint: 'ball, plate' },
  { emoji: '📚', label: 'Rectangle', hint: 'book, box' },
  { emoji: '🔺', label: 'Triangle', hint: 'pizza slice' },
] as const;

function ShapesSketch() {
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
      <Text style={sketch.label}>TARGET TRIO</Text>
      <Animated.View style={[sketch.glow, glow]} />
      <View style={sketch.frame}>
        <Text style={sketch.caption}>three objects · each a different shape · one photo</Text>
        <View style={sketch.shapesRow}>
          {SHAPE_SAMPLES.map((s) => (
            <View key={s.label} style={sketch.shapeCard}>
              <Text style={sketch.shapeEmoji}>{s.emoji}</Text>
              <Text style={sketch.shapeLabel}>{s.label}</Text>
              <Text style={sketch.shapeHint}>{s.hint}</Text>
            </View>
          ))}
        </View>
        <View style={sketch.hintRow}>
          <Text style={sketch.hint}>✓ 3 objects</Text>
          <Text style={sketch.hint}>✓ different shapes</Text>
          <Text style={sketch.hint}>✓ same photo</Text>
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
          <ActivityIndicator size="small" color={PALETTE.glow} />
        ) : (
          <Ionicons name={ok ? 'checkmark' : 'close'} size={16} color={ok ? CW.good : CW.warn} />
        )}
      </View>
      <Text style={check.label}>{label}</Text>
    </View>
  );
}

export function Level9NotebookUploadDifferentShapes({
  onComplete,
}: {
  onComplete: (correct: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: boolean; feedback: string } | null>(null);

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
      const filename = 'level9-s7-different-shapes.jpg';
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

      const res = await fetch(`${API_BASE_URL}/api/upload-level9-s7-different-shapes-task`, {
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
          ? 'SUCCESS! We see three objects of different shapes!'
          : 'TRY AGAIN. Show three objects of different shapes.');

      setResult({ correct, feedback });

      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Success! Three different shapes!', 0.75);
        setTimeout(() => onComplete(true), 2600);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Show three objects of different shapes.', 0.75);
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
      Alert.alert(
        'Permission needed',
        'Allow camera to take a photo of three objects with different shapes.',
      );
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
    ? 'Scanning your photo for three different shapes…'
    : result?.correct
      ? 'Verified! Three objects with different shapes detected!'
      : result
        ? 'Pick objects that look different — round, square, triangle, and more!'
        : 'Try a ball, a book, and a block — all three shapes in one photo!';

  return (
    <ClockwiseGameShell
      studio="SHAPE TRIO · REAL-WORLD MISSION"
      title="Three different shapes"
      instruction="Show three objects that have different shapes, then photograph them together."
      mascot="⬜"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 7 · REAL-WORLD TASK</Text>
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

      <ShapesSketch />

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
          <LinearGradient colors={[PALETTE.accent, PALETTE.secondary]} style={styles.actionGrad}>
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
              <ActivityIndicator color={PALETTE.glow} size="large" />
              <Text style={styles.resultTitle}>Shape scan in progress…</Text>
              <CheckRow label="Three objects detected" pending />
              <CheckRow label="Different shapes detected" pending />
            </>
          ) : result ? (
            <>
              <Text style={styles.resultTitle}>
                {result.correct ? 'Shapes verified!' : 'Adjust your trio'}
              </Text>
              <Text style={styles.resultFeedback}>{result.feedback}</Text>
              <CheckRow label="Three objects detected" ok={result.correct} />
              <CheckRow label="Different shapes detected" ok={result.correct} />
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
    </ClockwiseGameShell>
  );
}

const sketch = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3, color: PALETTE.glow, marginBottom: 8 },
  glow: {
    position: 'absolute',
    top: 44,
    width: 220,
    height: 80,
    borderRadius: 12,
    backgroundColor: PALETTE.accent,
  },
  frame: {
    width: '92%',
    backgroundColor: 'rgba(8,12,40,0.65)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  caption: {
    fontSize: 14,
    fontWeight: '800',
    color: CW.textLight,
    textAlign: 'center',
    marginBottom: 14,
  },
  shapesRow: { flexDirection: 'row', gap: 10, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' },
  shapeCard: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: `${PALETTE.glow}88`,
    backgroundColor: 'rgba(244,63,94,0.12)',
    minWidth: 88,
  },
  shapeEmoji: { fontSize: 28, marginBottom: 4 },
  shapeLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8, color: PALETTE.glow, marginBottom: 2 },
  shapeHint: { fontSize: 9, fontWeight: '700', color: CW.textMuted, textAlign: 'center' },
  hintRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  hint: { fontSize: 11, fontWeight: '700', color: PALETTE.glow },
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
  iconPending: { backgroundColor: 'rgba(253,164,175,0.15)' },
  label: { fontSize: 14, fontWeight: '700', color: CW.textLight },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: CW.glass,
    borderWidth: 1,
    borderColor: CW.glassBorder,
    marginBottom: 10,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: PALETTE.glow },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 12 },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepIcon: { fontSize: 15 },
  stepTitle: { fontSize: 11, fontWeight: '800', color: PALETTE.glow },
  stepArrow: { fontSize: 14, color: CW.textMuted, marginHorizontal: 2 },
  previewWrap: { marginBottom: 14, alignItems: 'center' },
  previewLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: CW.textMuted, marginBottom: 6 },
  preview: { width: '100%', height: 140, borderRadius: 14, borderWidth: 2, borderColor: CW.glassBorder },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  actionBtn: { borderRadius: 18, overflow: 'hidden', minWidth: 148, flex: 1, maxWidth: 200 },
  actionAlt: {
    borderWidth: 2,
    borderColor: `${PALETTE.accent}66`,
    backgroundColor: 'rgba(244,63,94,0.12)',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  actionGrad: { paddingVertical: 16, alignItems: 'center', gap: 4 },
  actionEmoji: { fontSize: 28 },
  actionTxt: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  actionTxtAlt: { color: PALETTE.glow },
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
  resultOk: { borderColor: CW.good, backgroundColor: 'rgba(52,211,153,0.12)' },
  resultPending: { borderColor: CW.glassBorder, backgroundColor: 'rgba(8,12,40,0.45)' },
  resultTitle: { fontSize: 18, fontWeight: '900', color: CW.textLight, marginBottom: 6 },
  resultFeedback: { fontSize: 14, fontWeight: '600', color: CW.textMuted, textAlign: 'center', marginBottom: 4 },
  retryRow: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  retryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: PALETTE.accent },
  retryTxt: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  finishBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: CW.glassBorder,
  },
  finishTxt: { fontSize: 14, fontWeight: '700', color: CW.textMuted },
});
