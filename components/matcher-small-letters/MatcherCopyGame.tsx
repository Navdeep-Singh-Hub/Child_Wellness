/**
 * Game 4: Mirror Pearl Atelier — study the model letter, copy it on your slate, AI validates.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { DrawingCanvas, DrawingCanvasRef, Stroke } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { captureDrawingForAi } from '@/components/level1-copy-letters-session/captureDrawingBase64';
import { isLetterValidationPass, validateLetterImage } from '@/utils/recognizeLetter';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { COPY_PEARL_THEME as T, MATCHER_SESSION } from './matcherSessionTheme';
import { speakLetter, speakMatcherHint, stopMatcherSpeech } from './matcherSessionSpeech';
import { OceanReefBackground } from './OceanReefBackground';

export function MatcherCopyGame({
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
  const [idx, setIdx] = useState(0);
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgTone, setMsgTone] = useState<'info' | 'success' | 'error'>('info');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [celebrating, setCelebrating] = useState(false);

  const expected = letters[idx % letters.length];
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const shotRef = useRef<View>(null);
  const mirrorPulse = useSharedValue(1);
  const arrowBounce = useSharedValue(0);
  const scanLine = useSharedValue(0);

  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const letterPct = Math.round(((idx + (msgTone === 'success' ? 1 : 0)) / letters.length) * 100);
  const hasStrokes = strokes.length > 0;

  useEffect(() => {
    speakLetter(expected);
    speakMatcherHint(
      `Look at the pearl model, then copy the letter ${expected} on your slate below. Do not trace — write it yourself.`
    );
    mirrorPulse.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
    arrowBounce.value = withRepeat(
      withSequence(
        withTiming(6, { duration: 700 }),
        withTiming(0, { duration: 700 })
      ),
      -1,
      false
    );
    return () => stopMatcherSpeech();
  }, [arrowBounce, expected, mirrorPulse]);

  useEffect(() => {
    if (!checking) {
      scanLine.value = 0;
      return;
    }
    scanLine.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [checking, scanLine]);

  const modelStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mirrorPulse.value }],
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: arrowBounce.value }],
  }));

  const scanStyle = useAnimatedStyle(() => ({
    top: `${scanLine.value * 88}%`,
    opacity: checking ? 0.75 : 0,
  }));

  const handleClear = () => {
    setStrokes([]);
    setMsg('');
    setMsgTone('info');
    canvasRef.current?.clear();
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      /* ignore */
    }
  };

  const verify = useCallback(async () => {
    if (!hasStrokes) {
      setMsg('Write your copy on the slate first.');
      setMsgTone('error');
      speakMatcherHint('Copy the letter on the slate, then tap Check Copy.');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        /* ignore */
      }
      return;
    }

    setChecking(true);
    setMsg('Mirra is comparing your copy…');
    setMsgTone('info');

    const b64 = await captureDrawingForAi(shotRef, strokes);
    if (!b64) {
      setChecking(false);
      setMsg('Could not capture drawing. Try again.');
      setMsgTone('error');
      return;
    }

    const result = await validateLetterImage(b64, expected);
    setChecking(false);

    if (!result.ok) {
      setMsg(result.message || 'Validation failed. Try again.');
      setMsgTone('error');
      return;
    }
    if (!isLetterValidationPass(result)) {
      setMsg(`Almost! Shape it more like "${expected}" and try again.`);
      setMsgTone('error');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        /* ignore */
      }
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      /* ignore */
    }

    if (idx < letters.length - 1) {
      setMsg(`Lovely copy! Next model: ${letters[idx + 1]}`);
      setMsgTone('success');
      setTimeout(() => {
        setIdx((v) => v + 1);
        setStrokes([]);
        setMsg('');
        setMsgTone('info');
        canvasRef.current?.clear();
      }, 1100);
    } else {
      setCelebrating(true);
      speakMatcherHint('Stunning copies! You are a pearl atelier star!');
      setTimeout(() => onComplete(), 2400);
    }
  }, [expected, hasStrokes, idx, letters, onComplete, strokes]);

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Copy Artist!"
          subtitle="Your letters shine like pearls!"
          badgeEmoji="🪞"
          variant="sunset"
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
        <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>Quest {currentStep} · {progressPct}%</Text>
          </View>
          <View style={styles.letterPill}>
            <Text style={styles.letterPillText}>{idx + 1}/{letters.length}</Text>
          </View>
        </View>
        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}
      </View>

      <View style={styles.hintCard}>
        <Text style={styles.mascot}>{T.mascot}</Text>
        <Text style={styles.hintText}>
          {T.mascotName}: Study the pearl model, then copy <Text style={styles.hintLetter}>{expected}</Text> on your slate — from memory, not by tracing.
        </Text>
      </View>

      <Animated.View style={[styles.modelCard, modelStyle]}>
        <Text style={styles.panelTag}>Pearl Model</Text>
        <View style={styles.modelWell}>
          <Text style={styles.modelLetter}>{expected}</Text>
        </View>
        <Pressable onPress={() => speakLetter(expected)} style={styles.listenBtn}>
          <Ionicons name="volume-high" size={18} color={T.accentDeep} />
          <Text style={styles.listenText}>Listen</Text>
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.mirrorRow, arrowStyle]}>
        <Ionicons name="arrow-down" size={28} color={T.mirror} />
        <Text style={styles.mirrorLabel}>Copy below</Text>
        <Ionicons name="arrow-down" size={28} color={T.mirror} />
      </Animated.View>

      <View style={styles.slateCard}>
        <Text style={styles.panelTag}>Your Slate</Text>
        <View ref={shotRef} collapsable={false} style={styles.captureWrap}>
          <DrawingCanvas
            ref={canvasRef}
            brushSize={7}
            canvasColor={T.slate}
            randomColors={false}
            onStrokeStart={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {
                /* ignore */
              }
            }}
            onStrokeEnd={(s) => setStrokes(s)}
          />
          <Animated.View style={[styles.scanBeam, scanStyle]} pointerEvents="none" />
        </View>
        <Text style={styles.strokeHint}>
          {hasStrokes ? `${strokes.length} stroke${strokes.length === 1 ? '' : 's'} drawn` : 'Write your copy here'}
        </Text>
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

      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Copies Mastered</Text>
          <Text style={styles.progressPct}>{letterPct}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[...T.doneGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${letterPct}%` }]}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={handleClear} style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}>
          <Ionicons name="refresh" size={18} color={T.accentDeep} />
          <Text style={styles.clearText}>Erase</Text>
        </Pressable>
        <Pressable
          onPress={verify}
          disabled={checking}
          style={({ pressed }) => [styles.checkWrap, pressed && styles.pressed]}
        >
          <LinearGradient colors={[...T.doneGradient]} style={styles.checkBtn}>
            {checking ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={18} color="#FFF" />
                <Text style={styles.checkText}>Check Copy</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.pearlBorder,
    zIndex: 10,
    ...MATCHER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '800', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.pearlBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.inkMuted },
  letterPill: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1.5,
    borderColor: T.accentSoft,
  },
  letterPillText: { fontSize: 14, fontWeight: '900', color: T.accent },
  title: { fontSize: 24, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center', marginTop: 2 },
  hintCard: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 12,
    backgroundColor: T.pearl,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.pearlBorder,
    ...MATCHER_SESSION.shadow.soft,
  },
  mascot: { fontSize: 26 },
  hintText: { flex: 1, fontSize: 13, fontWeight: '700', color: T.ink, lineHeight: 19 },
  hintLetter: { fontWeight: '900', color: T.accent, fontSize: 16 },
  modelCard: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 14,
    borderRadius: 22,
    backgroundColor: T.pearl,
    borderWidth: 2,
    borderColor: T.pearlBorder,
    alignItems: 'center',
    ...MATCHER_SESSION.shadow.card,
  },
  panelTag: {
    fontSize: 10,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 6,
  },
  modelWell: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: T.modelGlow,
    borderWidth: 2,
    borderColor: T.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelLetter: { fontSize: 72, fontWeight: '900', color: T.accent, lineHeight: 80 },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: MATCHER_SESSION.radius.pill,
    backgroundColor: 'rgba(233, 213, 255, 0.6)',
  },
  listenText: { fontSize: 13, fontWeight: '800', color: T.accentDeep },
  mirrorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginVertical: 6 },
  mirrorLabel: { fontSize: 12, fontWeight: '800', color: T.mirror, textTransform: 'uppercase', letterSpacing: 0.8 },
  slateCard: {
    flex: 1,
    marginHorizontal: 20,
    minHeight: 160,
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 2,
    borderColor: T.slateBorder,
    ...MATCHER_SESSION.shadow.card,
  },
  captureWrap: {
    flex: 1,
    minHeight: 140,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    position: 'relative',
  },
  scanBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: T.accentSoft,
  },
  strokeHint: { fontSize: 11, fontWeight: '600', color: T.inkMuted, textAlign: 'center', marginTop: 6 },
  feedbackBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(237, 233, 254, 0.95)',
    borderWidth: 1,
    borderColor: T.slateBorder,
  },
  feedbackSuccess: { backgroundColor: 'rgba(209, 250, 229, 0.95)', borderColor: '#6EE7B7' },
  feedbackError: { backgroundColor: 'rgba(254, 226, 226, 0.95)', borderColor: '#FCA5A5' },
  feedbackText: { fontSize: 13, fontWeight: '700', color: T.ink, textAlign: 'center' },
  progressBlock: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: T.pearlBorder,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, fontWeight: '800', color: T.ink },
  progressPct: { fontSize: 14, fontWeight: '900', color: T.accent },
  progressTrack: { height: 10, backgroundColor: '#EDE9FE', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  clearBtn: {
    flex: 0.85,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: MATCHER_SESSION.radius.button,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    borderColor: T.pearlBorder,
  },
  clearText: { fontSize: 15, fontWeight: '800', color: T.accentDeep },
  checkWrap: { flex: 1.25 },
  checkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: MATCHER_SESSION.radius.button,
    ...MATCHER_SESSION.shadow.card,
  },
  checkText: { fontSize: 16, fontWeight: '900', color: '#FFF' },
});
