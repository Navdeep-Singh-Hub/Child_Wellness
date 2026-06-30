/**
 * Level 7 Reader — Session 6, Real World Task: Spatial Beacon
 * Place TWO objects far apart and ONE in the middle. Upload photo → AI verifies arrangement.
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
  'Place two objects far apart and one object in the middle. Then take a photo or upload a picture of the arrangement.';
const BEACON = { accent: '#10B981', glow: '#6EE7B7', mint: '#34D399' } as const;

const STEPS = [
  { icon: '📦', title: 'Place', body: 'Set 3 objects.' },
  { icon: '↔️', title: 'Arrange', body: 'Far · middle · far.' },
  { icon: '📷', title: 'Capture', body: 'Photograph setup.' },
] as const;

function SpatialSketch() {
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
        <View style={sketch.row}>
          <View style={sketch.sideSlot}>
            <View style={[sketch.obj, sketch.objSide]} />
            <Text style={sketch.tag}>FAR</Text>
          </View>
          <View style={sketch.gap}>
            <Text style={sketch.gapLine}>— — —</Text>
          </View>
          <View style={sketch.midSlot}>
            <View style={[sketch.obj, sketch.objMid]} />
            <Text style={sketch.tagMid}>MIDDLE</Text>
          </View>
          <View style={sketch.gap}>
            <Text style={sketch.gapLine}>— — —</Text>
          </View>
          <View style={sketch.sideSlot}>
            <View style={[sketch.obj, sketch.objSide]} />
            <Text style={sketch.tag}>FAR</Text>
          </View>
        </View>
        <Text style={sketch.caption}>two side objects far apart · one object centered between</Text>
        <View style={sketch.hintRow}>
          <Text style={sketch.hint}>✓ 3 objects</Text>
          <Text style={sketch.hint}>✓ far sides</Text>
          <Text style={sketch.hint}>✓ middle</Text>
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

export function ReaderNotebookUploadTwoFarOneMiddle({
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
    far_apart_detected?: boolean;
    middle_object_detected?: boolean;
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
      const filename = 'reader-s6-two-far-one-middle.jpg';
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

      const res = await fetch(`${API_BASE_URL}/api/upload-reader-s6-two-far-one-middle-task`, {
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
          ? 'SUCCESS! We see two objects far apart and one in the middle!'
          : 'TRY AGAIN. Place two objects far apart and one object in the middle, then take a photo.');

      setResult({
        correct,
        feedback,
        objects_detected: data.objects_detected,
        far_apart_detected: data.far_apart_detected,
        middle_object_detected: data.middle_object_detected,
      });

      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Success! Great arrangement!', 0.75);
        setTimeout(() => onComplete(true), 2600);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. Place two objects far apart and one in the middle.', 0.75);
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
        'Allow camera to take a photo of two objects far apart and one in the middle.',
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
    ? 'Scanning spatial arrangement…'
    : result?.correct
      ? 'Verified! Two far apart with one in the middle.'
      : result
        ? 'Spread the side objects wider and center the middle one — then capture again.'
        : 'Use books or toys: two on the sides, one centered between them!';

  return (
    <ReaderGameShell
      studio="SPATIAL BEACON · MISSION"
      title="Real-world proof"
      instruction="Place two objects far apart and one in the middle, then upload or photograph them."
      mascot="📐"
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

      <SpatialSketch />

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
          <LinearGradient colors={[BEACON.accent, '#059669']} style={styles.actionGrad}>
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
              <Text style={styles.resultTitle}>Spatial scan in progress…</Text>
              <CheckRow label="Three objects detected" pending />
              <CheckRow label="Far-apart sides detected" pending />
              <CheckRow label="Middle object detected" pending />
            </>
          ) : result ? (
            <>
              <Text style={styles.resultTitle}>
                {result.correct ? 'Spatial beacon verified!' : 'Adjust your arrangement'}
              </Text>
              <Text style={styles.resultFeedback}>{result.feedback}</Text>
              <CheckRow label="Three objects detected" ok={result.objects_detected ?? result.correct} />
              <CheckRow
                label="Far-apart sides detected"
                ok={result.far_apart_detected ?? result.correct}
              />
              <CheckRow
                label="Middle object detected"
                ok={result.middle_object_detected ?? result.correct}
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
    top: 32,
    width: 200,
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
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 12 },
  sideSlot: { alignItems: 'center', gap: 6 },
  midSlot: { alignItems: 'center', gap: 6, marginBottom: 4 },
  obj: { borderRadius: 10, borderWidth: 2, borderColor: BEACON.glow },
  objSide: { width: 36, height: 36, backgroundColor: BEACON.accent },
  objMid: { width: 32, height: 32, backgroundColor: BEACON.mint },
  tag: { fontSize: 8, fontWeight: '900', color: BEACON.glow, letterSpacing: 0.6 },
  tagMid: { fontSize: 8, fontWeight: '900', color: BEACON.mint, letterSpacing: 0.6 },
  gap: { paddingHorizontal: 4, paddingBottom: 18 },
  gapLine: { fontSize: 9, fontWeight: '700', color: RD.textMuted },
  caption: { fontSize: 13, fontWeight: '800', color: RD.textLight, textAlign: 'center' },
  hintRow: { flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' },
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
  iconPending: { backgroundColor: 'rgba(110,231,183,0.15)' },
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
    backgroundColor: 'rgba(16,185,129,0.12)',
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
