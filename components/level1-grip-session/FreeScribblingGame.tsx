/**
<<<<<<< HEAD
 * Game 1: Free Scribbling — Aurora Sketch Studio
 * Unique identity: aurora night sky, warm paper canvas, Pip the pencil mascot,
 * magic stroke meter, sparkle feedback, guided UX before Done unlocks.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
=======
 * Game 1: Rainbow Scribble Studio — free-form drawing with encouraging UX,
 * paper canvas, stroke feedback, and celebration on complete.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
>>>>>>> parent of d0342ff (Revert "fgh")
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { DrawingCanvas, DrawingCanvasRef } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
<<<<<<< HEAD
import { speak, stopTTS } from '@/utils/tts';
import { AuroraBackground } from './free-scribbling/AuroraBackground';
import { SketchyMascot } from './free-scribbling/SketchyMascot';
import { MagicMeter } from './free-scribbling/MagicMeter';
import { StrokeSparkles } from './free-scribbling/StrokeSparkles';
import {
  AURORA,
  ENCOURAGEMENTS,
  GAME1_CONFIG,
  HINTS,
} from './free-scribbling/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
=======
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { GRIP_SESSION, SCRIBBLE_STUDIO_THEME as T } from './gripSessionTheme';
import { speakGripHint, stopGripSpeech } from './gripSessionSpeech';
import { ScribbleStudioBackground } from './ScribbleStudioBackground';
import { PaperCanvasFrame } from './PaperCanvasFrame';

const MIN_STROKES_TO_FINISH = 1;
>>>>>>> parent of d0342ff (Revert "fgh")

export function FreeScribblingGame({
  currentStep,
  totalSteps,
  onBack,
  onComplete,
}: {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onComplete: () => void;
}) {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const [strokeCount, setStrokeCount] = useState(0);
<<<<<<< HEAD
  const [sparkleTrigger, setSparkleTrigger] = useState(0);
  const [lastEncouragement, setLastEncouragement] = useState('');
  const [mascotHappy, setMascotHappy] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const spokeIntro = useRef(false);

  const ready = strokeCount >= GAME1_CONFIG.minStrokes;
  const donePulse = useSharedValue(1);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => setReduceMotion(!!v))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!spokeIntro.current) {
      spokeIntro.current = true;
      speak('Move your finger on the paper to draw colorful lines!', 0.72);
    }
    return () => stopTTS();
  }, []);

  useEffect(() => {
    if (ready && !reduceMotion) {
      donePulse.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 700 }),
          withTiming(1, { duration: 700 }),
        ),
        -1,
        true,
      );
    } else {
      donePulse.value = withTiming(1);
    }
  }, [ready, reduceMotion, donePulse]);

  const mascotHint = useMemo(() => {
    if (lastEncouragement) return lastEncouragement;
    if (ready) return HINTS.ready;
    if (strokeCount >= GAME1_CONFIG.minStrokes - 1) return HINTS.almost;
    if (strokeCount > 0) return HINTS.started;
    return HINTS.idle;
  }, [strokeCount, ready, lastEncouragement]);

  const handleStrokeStart = useCallback(() => {
    setSparkleTrigger((t) => t + 1);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
=======
  const [promptIndex, setPromptIndex] = useState(0);
  const [showNudge, setShowNudge] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const donePulse = useSharedValue(1);
  const nudgeShake = useSharedValue(0);
  const bubbleScale = useSharedValue(0.92);

  const canFinish = strokeCount >= MIN_STROKES_TO_FINISH;

  useEffect(() => {
    speakGripHint('Welcome to the scribble studio! Touch the paper and drag to draw.');
    bubbleScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    return () => stopGripSpeech();
  }, [bubbleScale]);

  useEffect(() => {
    if (!canFinish) return;
    donePulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [canFinish, donePulse]);

  const handleStrokeStart = useCallback(() => {
    setShowNudge(false);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      /* ignore */
    }
>>>>>>> parent of d0342ff (Revert "fgh")
  }, []);

  const handleStrokeEnd = useCallback(() => {
    const count = canvasRef.current?.getStrokeCount() ?? 0;
    setStrokeCount(count);
<<<<<<< HEAD
    const msg = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
    setLastEncouragement(msg);
    setTimeout(() => setLastEncouragement(''), 2200);
    try {
      Haptics.selectionAsync();
    } catch (_) {}
=======
    if (count > 0 && count <= T.prompts.length) {
      setPromptIndex(Math.min(count - 1, T.prompts.length - 1));
    }
    if (count === 3 || count === 8) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {
        /* ignore */
      }
    }
>>>>>>> parent of d0342ff (Revert "fgh")
  }, []);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    setStrokeCount(0);
<<<<<<< HEAD
    setLastEncouragement('');
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}
    speak('Canvas cleared. Let\'s draw again!', 0.75);
  }, []);

  const handleDone = useCallback(() => {
    if (!ready) {
      speak(`Draw ${GAME1_CONFIG.minStrokes - strokeCount} more lines first!`, 0.75);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (_) {}
      return;
    }
    setMascotHappy(true);
    setShowCelebrate(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (_) {}
    speak('Wonderful scribbling! Great job!', 0.72);
    setTimeout(() => {
      setShowCelebrate(false);
      onComplete();
    }, 1600);
  }, [ready, strokeCount, onComplete]);

  const doneBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: donePulse.value }],
  }));

  const stepDots = Array.from({ length: totalSteps }, (_, i) => i + 1);

  if (showCelebrate) {
    return (
      <View style={styles.root}>
        <AuroraBackground />
        <View style={styles.celebrateOverlay}>
          {!reduceMotion ? <ConfettiEffect /> : null}
          <View style={styles.celebrateCard}>
            <Text style={styles.celebrateEmoji}>🎨</Text>
            <Text style={styles.celebrateTitle}>Masterpiece!</Text>
            <Text style={styles.celebrateSub}>{strokeCount} colorful strokes</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AuroraBackground />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={22} color={AURORA.textOnDark} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.gameLabel}>AURORA SKETCH STUDIO</Text>
            <Text style={styles.gameTitle}>Free Scribbling</Text>
          </View>

          <MagicMeter strokes={strokeCount} />
        </View>

        {/* Step dots */}
        <View style={styles.dotsRow} accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}>
          {stepDots.map((n) => (
            <View
              key={n}
              style={[
                styles.dot,
                n === currentStep && styles.dotActive,
                n < currentStep && styles.dotDone,
              ]}
            />
          ))}
        </View>

        <SketchyMascot hint={mascotHint} isHappy={mascotHappy} />

        {/* Canvas frame — warm paper on dark (figure-ground contrast) */}
        <View style={styles.canvasFrame}>
          <View style={styles.canvasGlow} />
          <View style={styles.canvasInner}>
            <StrokeSparkles trigger={sparkleTrigger} />
            <DrawingCanvas
              ref={canvasRef}
              brushSize={GAME1_CONFIG.brushSize}
              canvasColor={AURORA.paper}
              randomColors
              onStrokeStart={handleStrokeStart}
              onStrokeEnd={handleStrokeEnd}
            />
            {strokeCount === 0 ? (
              <View style={styles.canvasPlaceholder} pointerEvents="none">
                <Text style={styles.placeholderIcon}>👆</Text>
                <Text style={styles.placeholderText}>Draw here</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleClear}
            disabled={strokeCount === 0}
            style={({ pressed }) => [
              styles.btnClear,
              strokeCount === 0 && styles.btnDisabled,
              pressed && strokeCount > 0 && styles.pressed,
            ]}
            accessibilityLabel="Clear canvas"
            accessibilityRole="button"
          >
            <Ionicons name="refresh-outline" size={20} color={strokeCount > 0 ? AURORA.textOnDark : AURORA.textMuted} />
            <Text style={[styles.btnClearText, strokeCount === 0 && styles.btnTextDisabled]}>Clear</Text>
          </Pressable>

          <AnimatedPressable
            onPress={handleDone}
            style={[
              styles.btnDone,
              !ready && styles.btnDoneDisabled,
              ready && styles.btnDoneReady,
              ready && doneBtnStyle,
            ]}
            accessibilityLabel={ready ? 'Finish drawing' : `Draw ${GAME1_CONFIG.minStrokes - strokeCount} more strokes to finish`}
            accessibilityRole="button"
            accessibilityState={{ disabled: !ready }}
          >
            <Ionicons name={ready ? 'checkmark-circle' : 'lock-closed-outline'} size={22} color="#FFF" />
            <Text style={styles.btnDoneText}>{ready ? 'Done!' : `${GAME1_CONFIG.minStrokes - strokeCount} more`}</Text>
          </AnimatedPressable>
        </View>
      </SafeAreaView>
=======
    setPromptIndex(0);
    setShowNudge(false);
    nudgeShake.value = withSequence(
      withTiming(-6, { duration: 50 }),
      withTiming(6, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      /* ignore */
    }
  }, [nudgeShake]);

  const handleDone = useCallback(() => {
    if (!canFinish) {
      setShowNudge(true);
      nudgeShake.value = withSequence(
        withTiming(8, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(4, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
      speakGripHint('Draw at least one scribble on the paper first!');
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        /* ignore */
      }
      return;
    }
    setCelebrating(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      /* ignore */
    }
    setTimeout(() => {
      onComplete();
    }, 2200);
  }, [canFinish, nudgeShake, onComplete]);

  const doneBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: canFinish ? donePulse.value : 1 }],
  }));

  const nudgeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: nudgeShake.value }],
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bubbleScale.value }],
  }));

  const progressPct = Math.round((currentStep / totalSteps) * 100);

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Studio Star!"
          subtitle="Your scribbles look amazing!"
          badgeEmoji="🎨"
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
      <ScribbleStudioBackground />

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
            <Text style={styles.stepPillText}>
              Quest {currentStep} · {progressPct}%
            </Text>
          </View>
          <View style={styles.strokePill}>
            <Text style={styles.strokeEmoji}>🖌️</Text>
            <Text style={styles.strokeCount}>{strokeCount}</Text>
            <Text style={styles.strokeLabel}>marks</Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        <Text style={styles.subtitle}>Free Hand Control · Session 1</Text>

        <Animated.View style={[styles.speechBubble, bubbleStyle]}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Text style={styles.prompt}>{T.prompts[promptIndex]}</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.playArea, nudgeStyle]}>
        <PaperCanvasFrame>
          <DrawingCanvas
            ref={canvasRef}
            brushSize={16}
            canvasColor="transparent"
            randomColors
            onStrokeStart={handleStrokeStart}
            onStrokeEnd={handleStrokeEnd}
          />
        </PaperCanvasFrame>

        {showNudge && (
          <View style={styles.nudgeBanner}>
            <Text style={styles.nudgeText}>✏️ Scribble on the paper first, then tap Done!</Text>
          </View>
        )}
      </Animated.View>

      <View style={styles.actions}>
        <Pressable
          onPress={handleClear}
          style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}
          accessibilityLabel="Clear canvas"
        >
          <Ionicons name="refresh" size={20} color={T.accentDeep} />
          <Text style={styles.clearText}>Start Over</Text>
        </Pressable>

        <Animated.View style={[styles.doneWrap, doneBtnStyle]}>
          <Pressable
            onPress={handleDone}
            style={({ pressed }) => [pressed && styles.pressed]}
            accessibilityLabel="Finish scribbling"
          >
            <LinearGradient
              colors={canFinish ? [...T.doneGradient] : ['#D6D3D1', '#A8A29E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.doneBtn, !canFinish && styles.doneBtnDisabled]}
            >
              <Ionicons name="checkmark-circle" size={22} color="#FFF" />
              <Text style={styles.doneText}>I'm Done!</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
>>>>>>> parent of d0342ff (Revert "fgh")
    </View>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  root: { flex: 1, backgroundColor: AURORA.spaceDeep },
  safe: { flex: 1, paddingHorizontal: 18 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerCenter: { flex: 1 },
  gameLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: AURORA.gold,
    letterSpacing: 1.4,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: AURORA.textOnDark,
    letterSpacing: -0.3,
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: {
    width: 22,
    backgroundColor: AURORA.gold,
  },
  dotDone: {
    backgroundColor: AURORA.auroraGreen,
  },

  canvasFrame: {
    flex: 1,
    minHeight: 260,
    marginBottom: 16,
    position: 'relative',
  },
  canvasGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    backgroundColor: AURORA.paperShadow,
    transform: [{ scale: 1.02 }],
  },
  canvasInner: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: AURORA.paperBorder,
    backgroundColor: AURORA.paper,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  canvasPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.45,
  },
  placeholderIcon: { fontSize: 36, marginBottom: 6 },
  placeholderText: {
    fontSize: 16,
    fontWeight: '700',
    color: AURORA.textOnPaper,
    letterSpacing: 0.5,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
  },
  btnClear: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: AURORA.clearBg,
    borderWidth: 1,
    borderColor: AURORA.clearBorder,
  },
  btnClearText: {
    fontSize: 16,
    fontWeight: '700',
    color: AURORA.textOnDark,
  },
  btnDone: {
    flex: 1,
=======
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
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: GRIP_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.clearBorder,
    zIndex: 10,
    ...GRIP_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '800', color: T.accentDeep },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, zIndex: 5 },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepPill: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: GRIP_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: T.clearBorder,
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.inkMuted, letterSpacing: 0.3 },
  strokePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: GRIP_SESSION.radius.pill,
    borderWidth: 1.5,
    borderColor: T.accentSoft,
  },
  strokeEmoji: { fontSize: 14 },
  strokeCount: { fontSize: 18, fontWeight: '900', color: T.accent },
  strokeLabel: { fontSize: 11, fontWeight: '700', color: T.inkMuted },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: T.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: T.inkMuted,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
  },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: 'rgba(253, 186, 116, 0.5)',
    ...GRIP_SESSION.shadow.soft,
  },
  mascot: { fontSize: 36 },
  bubbleBody: { flex: 1 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 15, fontWeight: '700', color: T.ink, lineHeight: 22, marginTop: 2 },
  playArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 5,
  },
  nudgeBanner: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(254, 243, 199, 0.95)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: T.accentSoft,
  },
  nudgeText: { fontSize: 13, fontWeight: '700', color: T.accentDeep, textAlign: 'center' },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    paddingTop: 4,
    zIndex: 5,
  },
  clearBtn: {
    flex: 0.9,
>>>>>>> parent of d0342ff (Revert "fgh")
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
<<<<<<< HEAD
    borderRadius: 18,
  },
  btnDoneDisabled: {
    backgroundColor: AURORA.doneDisabled,
  },
  btnDoneReady: {
    backgroundColor: AURORA.doneActive,
    shadowColor: AURORA.doneGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 8,
  },
  btnDoneText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
  },
  btnDisabled: { opacity: 0.45 },
  btnTextDisabled: { color: AURORA.textMuted },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },

  celebrateOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 18, 34, 0.75)',
  },
  celebrateCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  celebrateEmoji: { fontSize: 56, marginBottom: 12 },
  celebrateTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: AURORA.textOnDark,
    marginBottom: 6,
  },
  celebrateSub: {
    fontSize: 15,
    fontWeight: '600',
    color: AURORA.auroraMint,
  },
=======
    borderRadius: GRIP_SESSION.radius.button,
    backgroundColor: T.clearBg,
    borderWidth: 2,
    borderColor: T.clearBorder,
    ...GRIP_SESSION.shadow.soft,
  },
  clearText: { fontSize: 16, fontWeight: '800', color: T.accentDeep },
  doneWrap: { flex: 1.3 },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: GRIP_SESSION.radius.button,
    ...GRIP_SESSION.shadow.card,
  },
  doneBtnDisabled: { opacity: 0.85 },
  doneText: { fontSize: 17, fontWeight: '900', color: '#FFF' },
>>>>>>> parent of d0342ff (Revert "fgh")
});
