/**
 * Game 5: Deep Sea Snapshot — write a letter on paper, upload photo, AI validates (session capstone).
 */
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
import { isLetterValidationPass, validateLetterImage } from '@/utils/recognizeLetter';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { MATCHER_SESSION, PHOTO_SNAPSHOT_THEME as T } from './matcherSessionTheme';
import { speakLetter, speakMatcherHint, stopMatcherSpeech } from './matcherSessionSpeech';
import { OceanReefBackground } from './OceanReefBackground';

async function toBase64(uri: string): Promise<{ b64: string; mimeType: string } | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(blob);
    });
    return {
      b64: data.replace(/^data:image\/\w+;base64,/, ''),
      mimeType: blob.type || 'image/jpeg',
    };
  } catch {
    return null;
  }
}

export function MatcherPhotoTaskGame({
  letters,
  sessionTitle,
  currentStep,
  totalSteps,
  onBack,
  onComplete,
}: {
  letters: string[];
  sessionTitle?: string;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [target] = useState(() => letters[Math.floor(Math.random() * letters.length)] || 'a');
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [msgTone, setMsgTone] = useState<'info' | 'success' | 'error'>('info');
  const [celebrating, setCelebrating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const flash = useSharedValue(0);
  const scanPulse = useSharedValue(0);

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    speakMatcherHint(
      `Mission time! Write the letter ${target} on paper with a dark pen, then upload a photo for Scuba Scan to check.`
    );
    speakLetter(target);
    flash.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
    return () => stopMatcherSpeech();
  }, [flash, target]);

  useEffect(() => {
    if (!busy) {
      scanPulse.value = 0;
      return;
    }
    scanPulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [busy, scanPulse]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + flash.value * 0.5,
  }));

  const scanStyle = useAnimatedStyle(() => ({
    left: `${scanPulse.value * 92}%`,
    opacity: busy ? 0.85 : 0,
  }));

  const pick = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to upload your handwriting.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
    });
    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setPhoto(uri);
    setBusy(true);
    setMsg('Scuba Scan is reading your snapshot…');
    setMsgTone('info');
    setActiveStep(2);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      /* ignore */
    }

    try {
      const encoded = await toBase64(uri);
      if (!encoded) {
        setMsg('Could not read the photo. Try another image.');
        setMsgTone('error');
        setActiveStep(1);
        return;
      }

      const validation = await validateLetterImage(encoded.b64, target, encoded.mimeType);
      if (!validation.ok) {
        setMsg(validation.message || 'Validation failed. Try a clearer photo.');
        setMsgTone('error');
        setActiveStep(1);
        return;
      }
      if (!isLetterValidationPass(validation)) {
        setMsg(
          `Spotted "${validation.detectedLetter ?? '?'}" — write "${target}" darker and try again.`
        );
        setMsgTone('error');
        setActiveStep(1);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {
          /* ignore */
        }
        return;
      }

      setMsg(`Perfect snapshot! "${target}" verified.`);
      setMsgTone('success');
      setActiveStep(3);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        /* ignore */
      }
      setCelebrating(true);
      speakMatcherHint(`Amazing work! ${target} looks great on paper!`);
      setTimeout(() => onComplete(), 2600);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setMsg(err?.message || 'Upload failed. Please try again.');
      setMsgTone('error');
      setActiveStep(1);
    } finally {
      setBusy(false);
    }
  }, [onComplete, target]);

  const handleReady = () => {
    setActiveStep(1);
    speakMatcherHint('Great! Now tap Upload Snapshot and choose your photo.');
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
          title="Mission Accomplished!"
          subtitle="Real-world writing verified!"
          badgeEmoji="📸"
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
      <OceanReefBackground />

      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={22} color={T.ink} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>Final Quest · {progressPct}%</Text>
          </View>
          <View style={styles.capstonePill}>
            <Text style={styles.capstoneText}>⭐ Capstone</Text>
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
            Write <Text style={styles.targetLetter}>{target}</Text> on paper, then upload a clear photo.
          </Text>
        </View>
        <Pressable onPress={() => speakLetter(target)} style={styles.listenBtn}>
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
        <Animated.View style={[styles.cameraFlash, flashStyle]} pointerEvents="none" />
        <Text style={styles.showcaseLabel}>Your letter</Text>
        <Text style={styles.showcaseLetter}>{target}</Text>
      </View>

      <View style={styles.frameCard}>
        <Text style={styles.frameLabel}>Snapshot Preview</Text>
        <View style={styles.frame}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.preview} resizeMode="contain" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="image-outline" size={48} color={T.accentSoft} />
              <Text style={styles.placeholderText}>No photo yet</Text>
              <Text style={styles.placeholderHint}>Use good light & fill the frame</Text>
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
              <Ionicons name="pencil" size={20} color={T.inkDark} />
              <Text style={styles.primaryBtnTextDark}>I Wrote It!</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable
            onPress={pick}
            disabled={busy}
            style={({ pressed }) => [styles.uploadWrap, pressed && styles.pressed]}
          >
            <LinearGradient colors={[...T.doneGradient]} style={styles.primaryBtn}>
              {busy ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#FFF" />
                  <Text style={styles.primaryBtnText}>Upload Snapshot</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
    backgroundColor: 'rgba(14, 116, 144, 0.55)',
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.35)',
    zIndex: 10,
  },
  backText: { fontSize: 15, fontWeight: '800', color: T.ink },
  header: { paddingHorizontal: 20, paddingTop: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  stepPill: {
    backgroundColor: 'rgba(14, 116, 144, 0.5)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(103, 232, 249, 0.3)',
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.inkMuted },
  capstonePill: {
    backgroundColor: 'rgba(251, 191, 36, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1.5,
    borderColor: T.gold,
  },
  capstoneText: { fontSize: 12, fontWeight: '900', color: T.goldSoft },
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
    backgroundColor: 'rgba(14, 116, 144, 0.45)',
    borderWidth: 1,
    borderColor: T.frameBorder,
  },
  mascot: { fontSize: 32 },
  missionBody: { flex: 1 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  missionText: { fontSize: 14, fontWeight: '700', color: T.ink, lineHeight: 20, marginTop: 2 },
  targetLetter: { fontWeight: '900', color: T.accentSoft, fontSize: 18 },
  listenBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(14, 116, 144, 0.6)',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: 'rgba(34, 211, 238, 0.35)', borderColor: T.accentSoft },
  stepNum: { fontSize: 12, fontWeight: '900', color: T.inkMuted },
  stepNumActive: { color: T.ink },
  stepLabel: { fontSize: 9, fontWeight: '700', color: T.inkMuted, marginTop: 4, textAlign: 'center' },
  stepLabelActive: { color: T.ink },
  targetShowcase: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(8, 145, 178, 0.35)',
    borderWidth: 2,
    borderColor: T.goldSoft,
    overflow: 'hidden',
    position: 'relative',
  },
  cameraFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  showcaseLabel: { fontSize: 10, fontWeight: '800', color: T.goldSoft, textTransform: 'uppercase', letterSpacing: 1 },
  showcaseLetter: { fontSize: 64, fontWeight: '900', color: T.ink, lineHeight: 72 },
  frameCard: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 10,
    minHeight: 140,
  },
  frameLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  frame: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: T.frame,
    borderWidth: 3,
    borderColor: T.frameBorder,
    overflow: 'hidden',
    position: 'relative',
    ...MATCHER_SESSION.shadow.card,
  },
  preview: { width: '100%', height: '100%', minHeight: 140 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, minHeight: 140 },
  placeholderText: { fontSize: 14, fontWeight: '700', color: T.inkDark, marginTop: 8 },
  placeholderHint: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 4 },
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
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(224, 242, 254, 0.95)',
    borderWidth: 1,
    borderColor: T.frameBorder,
  },
  feedbackSuccess: { backgroundColor: 'rgba(209, 250, 229, 0.95)', borderColor: '#6EE7B7' },
  feedbackError: { backgroundColor: 'rgba(254, 226, 226, 0.95)', borderColor: '#FCA5A5' },
  feedbackText: { fontSize: 13, fontWeight: '700', color: T.inkDark, textAlign: 'center' },
  actions: { paddingHorizontal: 20, paddingVertical: 14, paddingBottom: Platform.OS === 'ios' ? 26 : 14 },
  uploadWrap: { width: '100%' },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: MATCHER_SESSION.radius.button,
    ...MATCHER_SESSION.shadow.card,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '900', color: '#FFF' },
  primaryBtnTextDark: { fontSize: 17, fontWeight: '900', color: T.inkDark },
});
