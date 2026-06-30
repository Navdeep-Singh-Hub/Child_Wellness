/**
 * Level 7 Reader — Session 9, Real World Task: Color Beacon
 * Show TWO objects of different colors. Upload photo → AI verifies color difference.
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
  'Show two objects of different colors. Take a photo with both objects clearly visible, like a red apple and a blue cup.';
const BEACON = { accent: '#7C3AED', glow: '#C4B5FD', teal: '#2DD4BF' } as const;

const STEPS = [
  { icon: '📦', title: 'Gather', body: 'Find 2 objects.' },
  { icon: '🎨', title: 'Contrast', body: 'Different colors.' },
  { icon: '📷', title: 'Capture', body: 'Photograph both.' },
] as const;

function ColorSketch() {
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
          <View style={[sketch.objectSlot, sketch.redSlot]}>
            <Text style={sketch.objectEmoji}>🍎</Text>
            <Text style={sketch.colorTag}>RED</Text>
          </View>
          <Text style={sketch.vs}>≠</Text>
          <View style={[sketch.objectSlot, sketch.blueSlot]}>
            <Text style={sketch.objectEmoji}>🥤</Text>
            <Text style={sketch.colorTag}>BLUE</Text>
          </View>
        </View>
        <Text style={sketch.caption}>two objects · clearly different colors · same photo</Text>
        <View style={sketch.hintRow}>
          <Text style={sketch.hint}>✓ 2 objects</Text>
          <Text style={sketch.hint}>✓ color contrast</Text>
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

export function ReaderNotebookUploadDifferentColors({
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
    color_difference_detected?: boolean;
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
      const filename = 'reader-s9-different-colors.jpg';
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

      const res = await fetch(`${API_BASE_URL}/api/upload-reader-s9-different-colors-task`, {
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
          ? 'SUCCESS! We see two objects of different colors!'
          : 'TRY AGAIN. Show two objects that are clearly different colors.');

      setResult({
        correct,
        feedback,
        objects_detected: data.objects_detected,
        color_difference_detected: data.color_difference_detected,
      });

      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Success! Great job showing different colors!', 0.75);
        setTimeout(() => onComplete(true), 2600);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Show two objects that are different colors.', 0.75);
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
        'Allow camera to take a photo of two objects of different colors.',
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
    ? 'Scanning for two objects with color contrast…'
    : result?.correct
      ? 'Verified! Two objects of different colors detected.'
      : result
        ? 'Pick two objects with clearly different colors — then capture again.'
        : 'Try a red toy and a blue cup — anything with obvious color difference!';

  return (
    <ReaderGameShell
      studio="COLOR BEACON · MISSION"
      title="Real-world proof"
      instruction="Show two objects of different colors, then upload or photograph them together."
      mascot="🎨"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 9 · REAL-WORLD TASK</Text>
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

      <ColorSketch />

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
          <LinearGradient colors={[BEACON.accent, BEACON.teal]} style={styles.actionGrad}>
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
              <Text style={styles.resultTitle}>Color scan in progress…</Text>
              <CheckRow label="Two objects detected" pending />
              <CheckRow label="Color difference detected" pending />
            </>
          ) : result ? (
            <>
              <Text style={styles.resultTitle}>
                {result.correct ? 'Color beacon verified!' : 'Adjust your setup'}
              </Text>
              <Text style={styles.resultFeedback}>{result.feedback}</Text>
              <CheckRow label="Two objects detected" ok={result.objects_detected ?? result.correct} />
              <CheckRow
                label="Color difference detected"
                ok={result.color_difference_detected ?? result.correct}
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
    </ReaderGameShell>
  );
}

const sketch = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3, color: BEACON.glow, marginBottom: 8 },
  glow: {
    position: 'absolute',
    top: 36,
    width: 180,
    height: 56,
    borderRadius: 12,
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
  pairRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  objectSlot: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 72,
  },
  redSlot: { borderColor: '#F87171', backgroundColor: 'rgba(248,113,113,0.15)' },
  blueSlot: { borderColor: '#60A5FA', backgroundColor: 'rgba(96,165,250,0.15)' },
  objectEmoji: { fontSize: 28, marginBottom: 4 },
  colorTag: { fontSize: 9, fontWeight: '900', color: BEACON.glow, letterSpacing: 0.6 },
  vs: { fontSize: 20, fontWeight: '900', color: BEACON.teal },
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
  iconBad: { backgroundColor: 'rgba(239,68,68,0.2)' },
  iconPending: { backgroundColor: 'rgba(196,181,253,0.15)' },
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
    backgroundColor: 'rgba(124,58,237,0.12)',
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
