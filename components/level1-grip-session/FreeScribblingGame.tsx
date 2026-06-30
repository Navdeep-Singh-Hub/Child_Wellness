/**
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
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { GRIP_SESSION, SCRIBBLE_STUDIO_THEME as T } from './gripSessionTheme';
import { speakGripHint, stopGripSpeech } from './gripSessionSpeech';
import { ScribbleStudioBackground } from './ScribbleStudioBackground';
import { PaperCanvasFrame } from './PaperCanvasFrame';

const MIN_STROKES_TO_FINISH = 1;

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
  }, []);

  const handleStrokeEnd = useCallback(() => {
    const count = canvasRef.current?.getStrokeCount() ?? 0;
    setStrokeCount(count);
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
  }, []);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    setStrokeCount(0);
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
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
});
