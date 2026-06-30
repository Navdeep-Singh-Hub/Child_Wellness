/**
 * Level 9 (Clockwise) — Session 6, Real World Task: Place THREE objects in a triangle and ONE in the center.
 * Upload photo → AI verifies spatial arrangement.
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
  'Place three objects in a triangle and one object in the center. Then upload or take a photo.';

const PALETTE = { accent: '#10B981', glow: '#6EE7B7', mint: '#34D399' } as const;

const STEPS = [
  { icon: '📦', title: 'Gather', body: 'Find 4 objects.' },
  { icon: '🔺', title: 'Arrange', body: '3 triangle + 1 center.' },
  { icon: '📷', title: 'Capture', body: 'Photograph layout.' },
] as const;

function TriangleSketch() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      true,
    );
  }, [pulse]);

  const centerGlow = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.45,
    transform: [{ scale: 1 + pulse.value * 0.1 }],
  }));

  const glow = useAnimatedStyle(() => ({
    opacity: 0.14 + pulse.value * 0.18,
  }));

  return (
    <View style={sketch.wrap}>
      <Text style={sketch.label}>TARGET LAYOUT</Text>
      <Animated.View style={[sketch.glow, glow]} />
      <View style={sketch.frame}>
        <Text style={sketch.caption}>3 objects in a triangle · 1 object in the middle</Text>
        <View style={sketch.layout}>
          <View style={sketch.topRow}>
            <View style={sketch.corner}>
              <Text style={sketch.obj}>📦</Text>
            </View>
          </View>
          <View style={sketch.midRow}>
            <View style={sketch.corner}>
              <Text style={sketch.obj}>📦</Text>
            </View>
            <Animated.View style={[sketch.center, centerGlow]}>
              <Text style={sketch.centerObj}>⭐</Text>
              <Text style={sketch.centerLbl}>CENTER</Text>
            </Animated.View>
            <View style={sketch.corner}>
              <Text style={sketch.obj}>📦</Text>
            </View>
          </View>
        </View>
        <View style={sketch.hintRow}>
          <Text style={sketch.hint}>✓ 3 corners</Text>
          <Text style={sketch.hint}>✓ 1 center</Text>
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

export function Level9NotebookUploadTriangleCenter({
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
      const filename = 'level9-s6-triangle-center.jpg';
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

      const res = await fetch(`${API_BASE_URL}/api/upload-level9-s6-triangle-center-task`, {
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
          ? 'SUCCESS! We see three objects in a triangle and one in the center!'
          : 'TRY AGAIN. Place three objects in a triangle and one object in the center.');

      setResult({ correct, feedback });

      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Success! Triangle and center!', 0.75);
        setTimeout(() => onComplete(true), 2600);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Place three objects in a triangle and one in the center.', 0.75);
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
        'Allow camera to take a photo of your triangle arrangement.',
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
    ? 'Scanning your photo for triangle layout and center object…'
    : result?.correct
      ? 'Verified! Triangle formation and center object detected!'
      : result
        ? 'Place three objects at the corners of a triangle with one in the middle.'
        : 'Blocks, cups, or toys — four objects total in triangle + center!';

  return (
    <ClockwiseGameShell
      studio="SPATIAL ORBIT · REAL-WORLD MISSION"
      title="Triangle and center"
      instruction="Place three objects in a triangle with one object in the center, then photograph the layout."
      mascot="🔺"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 6 · REAL-WORLD TASK</Text>
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

      <TriangleSketch />

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
          <LinearGradient colors={[PALETTE.accent, PALETTE.mint]} style={styles.actionGrad}>
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
              <Text style={styles.resultTitle}>Spatial scan in progress…</Text>
              <CheckRow label="Three objects in triangle" pending />
              <CheckRow label="One object in center" pending />
            </>
          ) : result ? (
            <>
              <Text style={styles.resultTitle}>
                {result.correct ? 'Layout verified!' : 'Adjust your arrangement'}
              </Text>
              <Text style={styles.resultFeedback}>{result.feedback}</Text>
              <CheckRow label="Three objects in triangle" ok={result.correct} />
              <CheckRow label="One object in center" ok={result.correct} />
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
    height: 100,
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
  layout: { alignItems: 'center', marginBottom: 12 },
  topRow: { marginBottom: 8 },
  midRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  corner: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: `${PALETTE.glow}88`,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  obj: { fontSize: 22 },
  center: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: PALETTE.glow,
    backgroundColor: 'rgba(16,185,129,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerObj: { fontSize: 20 },
  centerLbl: { fontSize: 6, fontWeight: '900', color: PALETTE.glow, letterSpacing: 0.6, marginTop: 1 },
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
  iconPending: { backgroundColor: 'rgba(110,231,183,0.15)' },
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
    backgroundColor: 'rgba(16,185,129,0.12)',
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
