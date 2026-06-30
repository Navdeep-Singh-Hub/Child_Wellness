/**
 * Counter Session 1 — Line Scout Snapshot
 * Place THREE objects in a straight line → photo → AI verifies. Wrong answers retry in-game.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { API_BASE_URL, authHeaders } from '@/utils/api';
import { LINE_SNAPSHOT_THEME as T, COUNTER_SESSION } from '../counterSessionTheme';
import { speakCounterHint, stopCounterSpeech } from '../counterSessionSpeech';
import { CloudTerraceBackground } from '../CloudTerraceBackground';

export function ThreeInLineNotebookUpload({
  onComplete,
  onBack,
  currentStep = 5,
  totalSteps = 5,
  sessionTitle,
}: {
  onComplete: (correct: boolean) => void;
  onBack?: () => void;
  currentStep?: number;
  totalSteps?: number;
  sessionTitle?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [msgTone, setMsgTone] = useState<'info' | 'success' | 'error'>('info');
  const [celebrating, setCelebrating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const pulse = useSharedValue(0);
  const scanPulse = useSharedValue(0);
  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakCounterHint(
      'Line scout mission! Place three objects in a straight line on a table, then take or upload a photo.'
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.35, { duration: 1200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
    return () => stopCounterSpeech();
  }, [pulse]);

  useEffect(() => {
    if (!uploading) {
      scanPulse.value = 0;
      return;
    }
    scanPulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [uploading, scanPulse]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: 0.4 + pulse.value * 0.45 }));
  const scanStyle = useAnimatedStyle(() => ({
    left: `${scanPulse.value * 92}%`,
    opacity: uploading ? 0.85 : 0,
  }));

  const uploadImage = useCallback(
    async (uri: string) => {
      setUploading(true);
      setMsg('Scout is scanning for three objects in a line…');
      setMsgTone('info');
      setActiveStep(3);

      try {
        const formData = new FormData();
        const filename = 'three-in-line.jpg';
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

        const res = await fetch(`${API_BASE_URL}/api/upload-counter-s1-three-in-line-task`, {
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
          data.feedback || (correct ? 'SUCCESS! Three objects in a line!' : 'Try again — line up three objects.');

        if (correct) {
          setMsg(feedback);
          setMsgTone('success');
          setActiveStep(4);
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {
            /* ignore */
          }
          speakCounterHint('Success! Three objects in a straight line!');
          setCelebrating(true);
          setTimeout(() => onComplete(true), 2600);
        } else {
          setMsg(feedback);
          setMsgTone('error');
          setActiveStep(2);
          speakCounterHint('Try again. Place three objects in a straight line on a table.');
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } catch {
            /* ignore */
          }
        }
      } catch (e: unknown) {
        const err = e as { message?: string };
        setMsg(err?.message || 'Upload failed. Please try again.');
        setMsgTone('error');
        setActiveStep(2);
        speakCounterHint('Something went wrong. Try uploading again.');
      } finally {
        setUploading(false);
      }
    },
    [onComplete]
  );

  const pickImage = useCallback(async () => {
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
      quality: 0.85,
    });
    if (pickerResult.canceled) return;
    const uri = pickerResult.assets[0].uri;
    setPhoto(uri);
    setActiveStep(2);
    await uploadImage(uri);
  }, [uploadImage]);

  const takePhoto = useCallback(async () => {
    const permission =
      Platform.OS === 'web'
        ? { status: 'granted' as const }
        : await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera to take a photo of three objects in a line.');
      return;
    }
    const pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (pickerResult.canceled) return;
    const uri = pickerResult.assets[0].uri;
    setPhoto(uri);
    setActiveStep(2);
    await uploadImage(uri);
  }, [uploadImage]);

  const handleReady = () => {
    setActiveStep(1);
    speakCounterHint('Place three objects in a straight line on a table, then snap a photo.');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      /* ignore */
    }
  };

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Line Scout Success!"
          subtitle="Three objects in a perfect line!"
          badgeEmoji="📐"
          variant="ocean"
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...T.gradient]}
        locations={[...T.gradientLocations]}
        style={StyleSheet.absoluteFill}
      />
      <CloudTerraceBackground />

      {onBack ? (
        <Pressable onPress={onBack} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
          <Text style={[styles.backText, { color: T.ink }]}>Back</Text>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>Final Quest · {progressPct}%</Text>
          </View>
          <Text style={styles.title}>{T.name}</Text>
          {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}
        </View>

        <View style={styles.missionCard}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.missionBody}>
            <Text style={styles.mascotName}>{T.mascotName} Mission</Text>
            <Text style={styles.missionText}>
              Place <Text style={styles.highlight}>three objects</Text> in a straight line on a table, then photograph them.
            </Text>
          </View>
          <Pressable
            onPress={() => speakCounterHint('Place three objects in a line and take a photo.')}
            style={styles.listenBtn}
          >
            <Ionicons name="volume-high" size={20} color={T.accent} />
          </Pressable>
        </View>

        <View style={styles.stepsRow}>
          {T.steps.map((label, i) => (
            <View key={label} style={styles.stepItem}>
              <View style={[styles.stepDot, i <= activeStep && styles.stepDotActive]}>
                <Text style={[styles.stepNum, i <= activeStep && styles.stepNumActive]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, i <= activeStep && styles.stepLabelActive]}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.exampleCard}>
          <Animated.View style={[styles.exampleGlow, pulseStyle]} pointerEvents="none" />
          <Text style={styles.exampleTitle}>Example layout</Text>
          <Text style={styles.exampleEmoji}>🍎 — 📚 — ✏️</Text>
          <Text style={styles.exampleHint}>Three items in a row on a table</Text>
        </View>

        <View style={styles.frameCard}>
          <Text style={styles.frameLabel}>Photo Preview</Text>
          <View style={styles.frame}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.preview} resizeMode="contain" />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="camera-outline" size={48} color={T.accentSoft} />
                <Text style={styles.placeholderText}>No photo yet</Text>
              </View>
            )}
            <Animated.View style={[styles.scanLine, scanStyle]} pointerEvents="none" />
          </View>
        </View>

        {!!msg && (
          <View
            style={[
              styles.feedbackBanner,
              msgTone === 'success' && styles.feedbackSuccess,
              msgTone === 'error' && styles.feedbackError,
            ]}
          >
            <Text style={styles.feedbackText}>{msg}</Text>
          </View>
        )}

        <View style={styles.actions}>
          {activeStep === 0 ? (
            <Pressable onPress={handleReady} style={({ pressed }) => [pressed && styles.pressed]}>
              <LinearGradient colors={[...T.doneGradient]} style={styles.primaryBtn}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                <Text style={styles.primaryBtnText}>Objects Are in a Line!</Text>
              </LinearGradient>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={takePhoto}
                disabled={uploading}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <LinearGradient colors={[...T.doneGradient]} style={styles.primaryBtn}>
                  {uploading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="camera" size={20} color="#FFF" />
                      <Text style={styles.primaryBtnText}>Take Photo</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
              <Pressable
                onPress={pickImage}
                disabled={uploading}
                style={({ pressed }) => [styles.secondaryWrap, pressed && styles.pressed]}
              >
                <View style={styles.secondaryBtn}>
                  <Ionicons name="images-outline" size={20} color={T.accent} />
                  <Text style={styles.secondaryBtnText}>Upload Photo</Text>
                </View>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: Platform.OS === 'ios' ? 40 : 28, paddingHorizontal: 20 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Platform.OS === 'web' ? 12 : 48,
    marginLeft: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: COUNTER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.frameBorder,
    zIndex: 10,
  },
  backText: { fontSize: 15, fontWeight: '700' },
  header: { alignItems: 'center', gap: 6, marginBottom: 12, zIndex: 5 },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: COUNTER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.frameBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.ink },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center' },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.frameBorder,
    padding: 16,
    marginBottom: 16,
  },
  mascot: { fontSize: 36 },
  missionBody: { flex: 1, gap: 4 },
  mascotName: { fontSize: 12, fontWeight: '800', color: T.accent, textTransform: 'uppercase' },
  missionText: { fontSize: 14, fontWeight: '600', color: T.ink, lineHeight: 20 },
  highlight: { fontWeight: '900', color: T.accentSoft },
  listenBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  stepItem: { alignItems: 'center', flex: 1, gap: 4 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: T.frameBorder,
  },
  stepDotActive: { backgroundColor: T.accent, borderColor: T.accentSoft },
  stepNum: { fontSize: 12, fontWeight: '800', color: T.inkMuted },
  stepNumActive: { color: T.inkDark },
  stepLabel: { fontSize: 9, fontWeight: '700', color: T.inkMuted, textAlign: 'center' },
  stepLabelActive: { color: T.ink },
  exampleCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 1,
    borderColor: T.frameBorder,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  exampleGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
  },
  exampleTitle: { fontSize: 13, fontWeight: '800', color: T.inkMuted, marginBottom: 8, textTransform: 'uppercase' },
  exampleEmoji: { fontSize: 28, marginBottom: 4 },
  exampleHint: { fontSize: 13, fontWeight: '600', color: T.inkMuted },
  frameCard: { marginBottom: 12 },
  frameLabel: { fontSize: 13, fontWeight: '800', color: T.inkMuted, marginBottom: 8, textTransform: 'uppercase' },
  frame: {
    backgroundColor: T.frame,
    borderRadius: COUNTER_SESSION.radius.card,
    borderWidth: 2,
    borderColor: T.frameBorder,
    height: 200,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', gap: 8 },
  placeholderText: { fontSize: 14, fontWeight: '600', color: T.inkMuted },
  scanLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: T.accent,
  },
  feedbackBanner: {
    padding: 14,
    borderRadius: COUNTER_SESSION.radius.card,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: T.frameBorder,
  },
  feedbackSuccess: { borderColor: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  feedbackError: { borderColor: '#F87171', backgroundColor: 'rgba(248, 113, 113, 0.15)' },
  feedbackText: { fontSize: 14, fontWeight: '700', color: T.ink, textAlign: 'center' },
  actions: { gap: 12, marginTop: 4 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: COUNTER_SESSION.radius.button,
    ...COUNTER_SESSION.shadow.card,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  secondaryWrap: { borderRadius: COUNTER_SESSION.radius.button },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: COUNTER_SESSION.radius.button,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: T.frameBorder,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '800', color: T.ink },
});
