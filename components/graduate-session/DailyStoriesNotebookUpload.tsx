/**
 * Notebook Task — Draw a small story scene. Upload photo; AI check: drawing_detected, story_scene_detected.
 */
import { GraduateGameShell } from '@/components/graduate-session/shared/GraduateGameShell';
import { GR } from '@/components/graduate-session/shared/graduateTheme';
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
  'Draw a small story scene in your notebook. Then upload or take a photo.';
const PALETTE = { accent: '#F59E0B', glow: '#FDE68A', secondary: '#FBBF24' } as const;

const STEPS = [
  { icon: '✏️', title: 'Draw', body: 'A scene.' },
  { icon: '📓', title: 'Notebook', body: 'Clear picture.' },
  { icon: '📷', title: 'Capture', body: 'Photograph it.' },
] as const;

const EXAMPLE_SCENES = [
  { emoji: '⚽', label: 'Playing with a ball' },
  { emoji: '🎒', label: 'Going to school' },
] as const;

function StorySceneSketch() {
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
      <Text style={sketch.label}>TARGET STORY SCENE</Text>
      <Animated.View style={[sketch.glow, glow]} />
      <View style={sketch.frame}>
        <View style={sketch.scenePlate}>
          {EXAMPLE_SCENES.map((scene) => (
            <View key={scene.label} style={sketch.sceneRow}>
              <Text style={sketch.sceneEmoji}>🧒 {scene.emoji}</Text>
              <Text style={sketch.sceneText}>{scene.label}</Text>
            </View>
          ))}
        </View>
        <Text style={sketch.caption}>a child doing something in a scene</Text>
        <View style={sketch.hintRow}>
          <Text style={sketch.hint}>✓ drawing</Text>
          <Text style={sketch.hint}>✓ story moment</Text>
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
          <Ionicons name={ok ? 'checkmark' : 'close'} size={16} color={ok ? GR.good : GR.warn} />
        )}
      </View>
      <Text style={check.label}>{label}</Text>
    </View>
  );
}

export function DailyStoriesNotebookUpload({
  onComplete,
}: {
  onComplete: (correct: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    feedback: string;
    drawing_detected?: boolean;
    story_scene_detected?: boolean;
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

      const res = await fetch(`${API_BASE_URL}/api/upload-graduate-daily-stories-task`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      const drawingOk = data.drawing_detected ?? true;
      const storyOk = data.story_scene_detected ?? true;
      const correct = data.correct ?? (drawingOk && storyOk);
      const feedback =
        data.feedback ||
        (correct ? 'Great job!' : "Let's try again! Draw a clearer story scene.");

      setResult({
        correct,
        feedback,
        drawing_detected: data.drawing_detected,
        story_scene_detected: data.story_scene_detected,
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
    ? 'Scanning your notebook for a story scene drawing…'
    : result?.correct
      ? 'Verified! Your story scene looks great.'
      : result
        ? 'Draw a child doing something — ball, school, or another daily moment!'
        : 'Sketch a small daily story — like playing or going to school!';

  return (
    <GraduateGameShell
      studio="STORY SKETCH · MISSION"
      title="Notebook proof"
      instruction="Draw a small story scene in your notebook, then upload or photograph it."
      mascot="📓"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 4 · NOTEBOOK TASK</Text>
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

      <StorySceneSketch />

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
              <Text style={styles.resultTitle}>Story scene scan in progress…</Text>
              <CheckRow label="Drawing detected" pending />
              <CheckRow label="Story scene detected" pending />
            </>
          ) : result ? (
            <>
              <Text style={styles.resultTitle}>
                {result.correct ? 'Story scene verified!' : 'Adjust your drawing'}
              </Text>
              <Text style={styles.resultFeedback}>{result.feedback}</Text>
              <CheckRow label="Drawing detected" ok={result.drawing_detected ?? result.correct} />
              <CheckRow label="Story scene detected" ok={result.story_scene_detected ?? result.correct} />
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
    </GraduateGameShell>
  );
}

const sketch = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3, color: PALETTE.glow, marginBottom: 8 },
  glow: {
    position: 'absolute',
    top: 44,
    width: 180,
    height: 90,
    borderRadius: 12,
    backgroundColor: PALETTE.accent,
  },
  frame: {
    width: '92%',
    backgroundColor: 'rgba(15,10,30,0.65)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  scenePlate: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}88`,
    backgroundColor: 'rgba(245,158,11,0.22)',
    marginBottom: 12,
    gap: 10,
  },
  sceneRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sceneEmoji: { fontSize: 22 },
  sceneText: { fontSize: 15, fontWeight: '800', color: GR.textLight, flex: 1 },
  caption: { fontSize: 14, fontWeight: '800', color: GR.textLight, textAlign: 'center' },
  hintRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
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
  iconPending: { backgroundColor: 'rgba(253,230,138,0.15)' },
  label: { fontSize: 14, fontWeight: '700', color: GR.textLight },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: GR.glass,
    borderWidth: 1,
    borderColor: GR.glassBorder,
    marginBottom: 10,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: PALETTE.glow },
  stepsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 12 },
  stepChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepIcon: { fontSize: 15 },
  stepTitle: { fontSize: 11, fontWeight: '800', color: PALETTE.glow },
  stepArrow: { fontSize: 14, color: GR.textMuted, marginHorizontal: 2 },
  previewWrap: { marginBottom: 14, alignItems: 'center' },
  previewLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: GR.textMuted, marginBottom: 6 },
  preview: { width: '100%', height: 140, borderRadius: 14, borderWidth: 2, borderColor: GR.glassBorder },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  actionBtn: { borderRadius: 18, overflow: 'hidden', minWidth: 148, flex: 1, maxWidth: 200 },
  actionAlt: {
    borderWidth: 2,
    borderColor: `${PALETTE.accent}66`,
    backgroundColor: 'rgba(245,158,11,0.12)',
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
  resultOk: { borderColor: GR.good, backgroundColor: 'rgba(52,211,153,0.12)' },
  resultPending: { borderColor: GR.glassBorder, backgroundColor: 'rgba(15,10,30,0.45)' },
  resultTitle: { fontSize: 18, fontWeight: '900', color: GR.textLight, marginBottom: 6 },
  resultFeedback: { fontSize: 14, fontWeight: '600', color: GR.textMuted, textAlign: 'center', marginBottom: 4 },
  retryRow: { flexDirection: 'row', gap: 10, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  retryBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: PALETTE.accent },
  retryTxt: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  finishBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: GR.glassBorder,
  },
  finishTxt: { fontSize: 14, fontWeight: '700', color: GR.textMuted },
});
