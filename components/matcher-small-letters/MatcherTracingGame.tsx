/**
 * Game 3: Driftwood Trace Bay — trace lowercase letters beside a guide, AI validates strokes.
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
import { MATCHER_SESSION, TRACE_BAY_THEME as T } from './matcherSessionTheme';
import { speakLetter, speakMatcherHint, stopMatcherSpeech } from './matcherSessionSpeech';
import { OceanReefBackground } from './OceanReefBackground';

export function MatcherTracingGame({
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
  const [roundFlash, setRoundFlash] = useState(false);

  const expected = letters[idx % letters.length];
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const shotRef = useRef<View>(null);
  const guidePulse = useSharedValue(1);
  const scanLine = useSharedValue(0);

  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const letterPct = Math.round(((idx + (msgTone === 'success' ? 1 : 0)) / letters.length) * 100);
  const hasStrokes = strokes.length > 0;

  useEffect(() => {
    speakLetter(expected);
    speakMatcherHint(`Trace the letter ${expected} in the draw bay. Use thin, careful strokes.`);
    guidePulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
    return () => stopMatcherSpeech();
  }, [expected, guidePulse]);

  useEffect(() => {
    if (!checking) {
      scanLine.value = 0;
      return;
    }
    scanLine.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [checking, scanLine]);

  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guidePulse.value }],
  }));

  const scanStyle = useAnimatedStyle(() => ({
    top: `${scanLine.value * 85}%`,
    opacity: checking ? 0.7 : 0,
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
      setMsg('Draw the letter first, then tap Check.');
      setMsgTone('error');
      speakMatcherHint('Make some strokes on the draw bay first.');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        /* ignore */
      }
      return;
    }

    setChecking(true);
    setMsg('Glimmer is reading your trace…');
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
      setMsg(`Looks like "${result.detectedLetter ?? '?'}" — try shaping "${expected}" more clearly.`);
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
      setMsg(`Beautiful trace! Next: ${letters[idx + 1]}`);
      setMsgTone('success');
      setRoundFlash(true);
      setTimeout(() => {
        setRoundFlash(false);
        setIdx((v) => v + 1);
        setStrokes([]);
        setMsg('');
        setMsgTone('info');
        canvasRef.current?.clear();
      }, 1200);
    } else {
      setMsg('Perfect tracing!');
      setMsgTone('success');
      setCelebrating(true);
      speakMatcherHint('Wonderful tracing! You mastered the bay!');
      setTimeout(() => onComplete(), 2400);
    }
  }, [expected, hasStrokes, idx, letters, onComplete, strokes]);

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Trace Master!"
          subtitle="Your letters flow like the tide!"
          badgeEmoji="🪼"
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
        <Ionicons name="arrow-back" size={22} color={T.accentDeep} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.stepPill}>
            <Text style={styles.stepPillText}>Quest {currentStep} · {progressPct}%</Text>
          </View>
          <View style={styles.letterPill}>
            <Text style={styles.letterPillText}>
              {idx + 1}/{letters.length}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{T.name}</Text>
        {sessionTitle ? <Text style={styles.subtitle}>{sessionTitle}</Text> : null}

        <View style={styles.hintRow}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <Text style={styles.hintText}>
            {T.mascotName}: Watch the driftwood guide, then trace {expected} with thin strokes.
          </Text>
        </View>
      </View>

      <View style={styles.workRow}>
        <Animated.View style={[styles.guideCard, guideStyle]}>
          <Text style={styles.panelLabel}>Driftwood Guide</Text>
          <View style={styles.guideWell}>
            <Text style={styles.guideGhost}>{expected}</Text>
            <Text style={styles.guideLetter}>{expected}</Text>
          </View>
        </Animated.View>

        <View style={styles.drawCard}>
          <Text style={styles.panelLabel}>Draw Bay</Text>
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
            {hasStrokes ? `${strokes.length} stroke${strokes.length === 1 ? '' : 's'}` : 'Waiting for your pen…'}
          </Text>
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

      {roundFlash && (
        <View style={styles.flashOverlay} pointerEvents="none">
          <Text style={styles.flashEmoji}>✨</Text>
        </View>
      )}

      <View style={styles.progressBlock}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Letters Traced</Text>
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
          <Ionicons name="water" size={18} color={T.accentDeep} />
          <Text style={styles.clearText}>Wash Away</Text>
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
                <Ionicons name="sparkles" size={18} color="#FFF" />
                <Text style={styles.checkText}>Check Trace</Text>
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
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.sandBorder,
    zIndex: 10,
    ...MATCHER_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '800', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: MATCHER_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.sandBorder,
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
  title: { fontSize: 26, fontWeight: '900', color: T.ink, textAlign: 'center' },
  subtitle: { fontSize: 12, fontWeight: '600', color: T.inkMuted, textAlign: 'center', marginTop: 2, marginBottom: 8 },
  hintRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: T.slateBorder,
  },
  mascot: { fontSize: 28 },
  hintText: { flex: 1, fontSize: 13, fontWeight: '700', color: T.ink, lineHeight: 19 },
  workRow: { flex: 1, flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10, minHeight: 260 },
  guideCard: {
    flex: 0.42,
    backgroundColor: T.sand,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: T.sandBorder,
    padding: 10,
    ...MATCHER_SESSION.shadow.soft,
  },
  drawCard: {
    flex: 0.58,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: T.slateBorder,
    padding: 10,
    ...MATCHER_SESSION.shadow.card,
  },
  panelLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: T.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 6,
  },
  guideWell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  guideGhost: {
    position: 'absolute',
    fontSize: 100,
    fontWeight: '900',
    color: T.guideGhost,
    lineHeight: 110,
  },
  guideLetter: { fontSize: 88, fontWeight: '900', color: T.accent, lineHeight: 96 },
  captureWrap: {
    flex: 1,
    minHeight: 200,
    backgroundColor: T.slate,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    position: 'relative',
  },
  scanBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: T.accentSoft,
    shadowColor: T.accent,
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  strokeHint: { fontSize: 11, fontWeight: '600', color: T.inkMuted, textAlign: 'center', marginTop: 6 },
  feedbackBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(224, 242, 254, 0.95)',
    borderWidth: 1,
    borderColor: T.slateBorder,
  },
  feedbackSuccess: { backgroundColor: 'rgba(209, 250, 229, 0.95)', borderColor: '#6EE7B7' },
  feedbackError: { backgroundColor: 'rgba(254, 226, 226, 0.95)', borderColor: '#FCA5A5' },
  feedbackText: { fontSize: 13, fontWeight: '700', color: T.ink, textAlign: 'center' },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  flashEmoji: { fontSize: 64 },
  progressBlock: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: T.slateBorder,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, fontWeight: '800', color: T.ink },
  progressPct: { fontSize: 14, fontWeight: '900', color: T.accent },
  progressTrack: { height: 12, backgroundColor: '#E0F2FE', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 14, paddingBottom: Platform.OS === 'ios' ? 26 : 16 },
  clearBtn: {
    flex: 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: MATCHER_SESSION.radius.button,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    borderColor: T.sandBorder,
  },
  clearText: { fontSize: 15, fontWeight: '800', color: T.accentDeep },
  checkWrap: { flex: 1.2 },
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
