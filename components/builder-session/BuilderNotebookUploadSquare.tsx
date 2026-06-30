/**
 * Builder Session 7 — Square Scout Dispatch
 * Show a SQUARE object, upload photo → AI verifies.
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
import { BUILDER_SESSION, SQUARE_SCOUT_THEME as T } from './builderSessionTheme';
import { speakBuilderHint, stopBuilderSpeech } from './builderSessionSpeech';
import { MountainWorkshopBackground } from './MountainWorkshopBackground';

export function BuilderNotebookUploadSquare({
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
    speakBuilderHint(
      'Square Scout mission! Find something square around you, then take or upload a photo.'
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.35, { duration: 1200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
    return () => stopBuilderSpeech();
  }, [pulse]);

  useEffect(() => {
    if (!uploading) {
      scanPulse.value = 0;
      return;
    }
    scanPulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [uploading, scanPulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + pulse.value * 0.45,
  }));

  const scanStyle = useAnimatedStyle(() => ({
    left: `${scanPulse.value * 92}%`,
    opacity: uploading ? 0.85 : 0,
  }));

  const uploadImage = useCallback(async (uri: string) => {
    setUploading(true);
    setMsg('Grid is scanning for a square…');
    setMsgTone('info');
    setActiveStep(3);

    try {
      const formData = new FormData();
      const filename = 'square-object.jpg';
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

      const res = await fetch(`${API_BASE_URL}/api/upload-builder-s7-square-task`, {
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
        (correct ? 'SUCCESS! We see a square!' : 'Try again — show a clear square shape.');

      if (correct) {
        setMsg(feedback);
        setMsgTone('success');
        setActiveStep(4);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        speakBuilderHint('Success! We see a square!');
        setCelebrating(true);
        setTimeout(() => onComplete(true), 2600);
      } else {
        setMsg(feedback);
        setMsgTone('error');
        setActiveStep(2);
        speakBuilderHint('Try again. Find something with four equal sides and take a clear photo.');
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
      speakBuilderHint('Something went wrong. Try uploading again.');
    } finally {
      setUploading(false);
    }
  }, [onComplete]);

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
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      /* ignore */
    }
    await uploadImage(uri);
  }, [uploadImage]);

  const takePhoto = useCallback(async () => {
    const permission =
      Platform.OS === 'web'
        ? { status: 'granted' as const }
        : await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera to take a photo of your square object.');
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
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      /* ignore */
    }
    await uploadImage(uri);
  }, [uploadImage]);

  const handleReady = () => {
    setActiveStep(1);
    speakBuilderHint('Great! Hold up a square object, then take or upload a photo.');
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
          title="Square Scout Complete!"
          subtitle="You found a square in the real world!"
          badgeEmoji="⬜"
          variant="indigo"
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
      <MountainWorkshopBackground />

      {onBack ? (
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>Final Build · {progressPct}%</Text>
            </View>
            <View style={styles.capstonePill}>
              <Text style={styles.capstoneText}>⭐ Real World</Text>
            </View>
          </View>
          <Text style={styles.title}>{T.name}</Text>
          {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}
        </View>

        <View style={styles.missionCard}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.missionBody}>
            <Text style={styles.mascotName}>{T.mascotName} Mission</Text>
            <Text style={styles.missionText}>
              Find a <Text style={styles.shapeWord}>square</Text> object — like a napkin, tile, or block — then snap a
              photo.
            </Text>
          </View>
          <Pressable
            onPress={() => speakBuilderHint('Find something square and take or upload a photo.')}
            style={styles.listenBtn}
          >
            <Ionicons name="volume-high" size={20} color={T.accentDeep} />
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

        <View style={styles.targetShowcase}>
          <Animated.View style={[styles.squareGlow, pulseStyle]} pointerEvents="none" />
          <Text style={styles.showcaseLabel}>Your target shape</Text>
          <View style={styles.squareDemo} />
          <Text style={styles.showcaseHint}>Something square</Text>
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
                <Text style={styles.placeholderHint}>Show a square object clearly</Text>
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
              <LinearGradient colors={[T.goldSoft, T.gold, '#D97706']} style={styles.primaryBtn}>
                <Ionicons name="square" size={20} color={T.ink} />
                <Text style={styles.primaryBtnTextDark}>I Found a Square!</Text>
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
                  <Ionicons name="cloud-upload" size={20} color={T.accentDeep} />
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
  scroll: { paddingBottom: Platform.OS === 'ios' ? 32 : 20 },
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
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.cardBorder,
    zIndex: 10,
    ...BUILDER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '700', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.cardBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.accentDeep },
  capstonePill: {
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BUILDER_SESSION.radius.pill,
    borderWidth: 1.5,
    borderColor: T.gold,
  },
  capstoneText: { fontSize: 12, fontWeight: '900', color: T.accentDeep },
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center', marginTop: 2 },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 14,
    borderRadius: 18,
    backgroundColor: T.card,
    borderWidth: 1,
    borderColor: T.cardBorder,
    ...BUILDER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 32 },
  missionBody: { flex: 1 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  missionText: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20, marginTop: 2 },
  shapeWord: { fontWeight: '900', color: T.accentDeep, fontSize: 16 },
  listenBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(224, 231, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 2,
  },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(224, 231, 255, 0.9)',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: 'rgba(129, 140, 248, 0.35)', borderColor: T.accentSoft },
  stepNum: { fontSize: 11, fontWeight: '900', color: T.inkMuted },
  stepNumActive: { color: T.ink },
  stepLabel: { fontSize: 8, fontWeight: '700', color: T.inkMuted, marginTop: 4, textAlign: 'center' },
  stepLabelActive: { color: T.ink },
  targetShowcase: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(224, 231, 255, 0.55)',
    borderWidth: 2,
    borderColor: T.accentSoft,
    overflow: 'hidden',
    position: 'relative',
  },
  squareGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
  },
  showcaseLabel: { fontSize: 10, fontWeight: '800', color: T.accentDeep, textTransform: 'uppercase', letterSpacing: 1 },
  squareDemo: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: T.accentSoft,
    borderWidth: 4,
    borderColor: T.accentDeep,
    marginVertical: 8,
  },
  showcaseHint: { fontSize: 16, fontWeight: '900', color: T.accentDeep },
  frameCard: { marginHorizontal: 20, marginTop: 12 },
  frameLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  frame: {
    height: 160,
    borderRadius: 16,
    backgroundColor: T.frame,
    borderWidth: 3,
    borderColor: T.frameBorder,
    overflow: 'hidden',
    position: 'relative',
    ...BUILDER_SESSION.shadow.card,
  },
  preview: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  placeholderText: { fontSize: 14, fontWeight: '700', color: T.ink, marginTop: 8 },
  placeholderHint: { fontSize: 11, fontWeight: '600', color: T.inkMuted, marginTop: 4 },
  scanLine: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: T.accent,
    shadowColor: T.accent,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  feedbackBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: T.cardBorder,
  },
  feedbackSuccess: { backgroundColor: 'rgba(209, 250, 229, 0.95)', borderColor: '#6EE7B7' },
  feedbackError: { backgroundColor: 'rgba(254, 226, 226, 0.95)', borderColor: '#FCA5A5' },
  feedbackText: { fontSize: 13, fontWeight: '700', color: T.ink, textAlign: 'center' },
  actions: { paddingHorizontal: 20, paddingTop: 14, gap: 10 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: BUILDER_SESSION.radius.button,
    ...BUILDER_SESSION.shadow.card,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '900', color: '#FFF' },
  primaryBtnTextDark: { fontSize: 17, fontWeight: '900', color: T.ink },
  secondaryWrap: { width: '100%' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: BUILDER_SESSION.radius.button,
    backgroundColor: T.card,
    borderWidth: 2,
    borderColor: T.cardBorder,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '800', color: T.accentDeep },
});
