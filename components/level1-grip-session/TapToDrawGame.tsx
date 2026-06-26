/**
 * Game 3: Star Pop Cosmos — tap to place colorful star dots; build a 10-star constellation.
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
import Svg, { Circle } from 'react-native-svg';
import { DrawingCanvas, DrawingCanvasRef } from '@/components/games/Level1/DrawingCanvas';
import { ConfettiEffect } from '@/components/games/Level1/ConfettiEffect';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { GRIP_SESSION, DOT_POP_THEME as T } from './gripSessionTheme';
import { speakGripHint, stopGripSpeech } from './gripSessionSpeech';
import { DotPopBackground } from './DotPopBackground';

function dotCenterFromPath(path: string): { x: number; y: number } | null {
  const m = path.match(/M\s+([\d.]+)\s+([\d.]+)/);
  if (!m) return null;
  return { x: parseFloat(m[1]), y: parseFloat(m[2]) };
}

function promptForTaps(count: number): string {
  if (count <= 0) return T.prompts[0];
  if (count < 3) return T.prompts[1];
  if (count < 6) return T.prompts[2];
  if (count < T.tapsGoal) return T.prompts[3];
  return T.prompts[4];
}

function TapRipple({ x, y, onDone }: { x: number; y: number; onDone: () => void }) {
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0.9);

  useEffect(() => {
    scale.value = withTiming(2.2, { duration: 500, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(0, { duration: 500 });
    const timer = setTimeout(onDone, 520);
    return () => clearTimeout(timer);
  }, [onDone, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.ripple, { left: x - 24, top: y - 24 }, style]}
      pointerEvents="none"
    />
  );
}

export function TapToDrawGame({
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
  const [tapCount, setTapCount] = useState(0);
  const [prompt, setPrompt] = useState(T.prompts[0]);
  const [milestoneMsg, setMilestoneMsg] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);
  const isDoneRef = useRef(false);

  const bubbleScale = useSharedValue(0.92);
  const canvasPulse = useSharedValue(1);

  const progressPct = Math.round((currentStep / totalSteps) * 100);
  const tapPct = Math.min(100, Math.round((tapCount / T.tapsGoal) * 100));

  useEffect(() => {
    speakGripHint('Welcome to Star Pop Cosmos! Tap the sky to place colorful stars.');
    bubbleScale.value = withSpring(1, { damping: 12, stiffness: 120 });
    return () => stopGripSpeech();
  }, [bubbleScale]);

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleStrokeEnd = useCallback(
    (strokes: { path: string }[]) => {
      if (isDoneRef.current) return;

      const count = strokes.length;
      setTapCount(count);
      setPrompt(promptForTaps(count));

      const last = strokes[strokes.length - 1];
      const center = last ? dotCenterFromPath(last.path) : null;
      if (center) {
        const id = ++rippleId.current;
        setRipples((prev) => [...prev, { id, x: center.x, y: center.y }]);
      }

      canvasPulse.value = withSequence(
        withTiming(1.02, { duration: 80 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* ignore */
      }

      const milestone = T.milestones.find((m) => m === count);
      if (milestone && milestone < T.tapsGoal) {
        const msg = T.milestoneMsgs[milestone as keyof typeof T.milestoneMsgs];
        setMilestoneMsg(msg);
        speakGripHint(msg);
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {
          /* ignore */
        }
        setTimeout(() => setMilestoneMsg(null), 1400);
      }

      if (count >= T.tapsGoal) {
        isDoneRef.current = true;
        speakGripHint(T.milestoneMsgs[10]);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* ignore */
        }
        setCelebrating(true);
        setTimeout(() => onComplete(), 2400);
      }
    },
    [canvasPulse, onComplete]
  );

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bubbleScale.value }],
  }));

  const canvasAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: canvasPulse.value }],
  }));

  if (celebrating) {
    return (
      <View style={styles.root}>
        <ConfettiEffect />
        <SuccessCelebration
          title="Cosmic Champion!"
          subtitle="You lit up the whole sky!"
          badgeEmoji="🌟"
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
      <DotPopBackground />

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
            <Text style={styles.stepPillText}>Quest {currentStep} · {progressPct}%</Text>
          </View>
          <View style={styles.tapPill}>
            <Text style={styles.tapPillEmoji}>⭐</Text>
            <Text style={styles.tapPillCount}>{tapCount}</Text>
            <Text style={styles.tapPillLabel}>/ {T.tapsGoal}</Text>
          </View>
        </View>

        <Text style={styles.title}>{T.name}</Text>
        <Text style={styles.subtitle}>Tap to place star dots</Text>

        <Animated.View style={[styles.speechBubble, bubbleStyle]}>
          <Text style={styles.mascot}>{T.mascot}</Text>
          <View style={styles.bubbleBody}>
            <Text style={styles.mascotName}>{T.mascotName} says:</Text>
            <Text style={styles.prompt}>{prompt}</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.playArea}>
        <Animated.View style={[styles.skyFrame, GRIP_SESSION.shadow.card, canvasAnimStyle]}>
          <View style={styles.skyInner}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg style={StyleSheet.absoluteFill}>
                {Array.from({ length: 24 }, (_, i) => (
                  <Circle
                    key={i}
                    cx={`${(i * 17 + 11) % 95}%`}
                    cy={`${(i * 23 + 7) % 90}%`}
                    r={1}
                    fill={T.canvasStars}
                  />
                ))}
              </Svg>
            </View>
            <DrawingCanvas
              ref={canvasRef}
              brushSize={24}
              canvasColor="transparent"
              randomColors
              singleDotMode
              onStrokeEnd={handleStrokeEnd}
            />
            {ripples.map((r) => (
              <TapRipple key={r.id} x={r.x} y={r.y} onDone={() => removeRipple(r.id)} />
            ))}
          </View>
        </Animated.View>

        <View style={styles.constellationRow}>
          {Array.from({ length: T.tapsGoal }, (_, i) => {
            const lit = i < tapCount;
            return (
              <View key={i} style={[styles.starSlot, lit && styles.starSlotLit]}>
                <Text style={[styles.starSlotIcon, lit && styles.starSlotIconLit]}>
                  {lit ? '⭐' : '·'}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.orbitMeter}>
          <View style={styles.orbitHeader}>
            <Text style={styles.orbitLabel}>Constellation Progress</Text>
            <Text style={styles.orbitPct}>{tapPct}%</Text>
          </View>
          <View style={styles.orbitTrack}>
            <LinearGradient
              colors={[...T.doneGradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.orbitFill, { width: `${tapPct}%` }]}
            />
          </View>
        </View>
      </View>

      {milestoneMsg && (
        <View style={styles.milestoneOverlay} pointerEvents="none">
          <View style={styles.milestoneCard}>
            <Text style={styles.milestoneEmoji}>✨</Text>
            <Text style={styles.milestoneText}>{milestoneMsg}</Text>
          </View>
        </View>
      )}
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
    backgroundColor: 'rgba(30, 27, 75, 0.65)',
    borderRadius: GRIP_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.35)',
    zIndex: 10,
    ...GRIP_SESSION.shadow.soft,
  },
  backText: { fontSize: 15, fontWeight: '800', color: T.ink },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, zIndex: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stepPill: {
    backgroundColor: 'rgba(30, 27, 75, 0.55)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: GRIP_SESSION.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.3)',
  },
  stepPillText: { fontSize: 12, fontWeight: '800', color: T.inkMuted, letterSpacing: 0.3 },
  tapPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(30, 27, 75, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: GRIP_SESSION.radius.pill,
    borderWidth: 1.5,
    borderColor: T.accentDeep,
  },
  tapPillEmoji: { fontSize: 14 },
  tapPillCount: { fontSize: 18, fontWeight: '900', color: T.accent },
  tapPillLabel: { fontSize: 12, fontWeight: '700', color: T.inkMuted },
  title: { fontSize: 28, fontWeight: '900', color: T.ink, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '600', color: T.inkMuted, textAlign: 'center', marginTop: 2, marginBottom: 12 },
  speechBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(30, 27, 75, 0.75)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.5)',
    ...GRIP_SESSION.shadow.soft,
  },
  mascot: { fontSize: 36 },
  bubbleBody: { flex: 1 },
  mascotName: { fontSize: 11, fontWeight: '800', color: T.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  prompt: { fontSize: 15, fontWeight: '700', color: T.ink, lineHeight: 22, marginTop: 2 },
  playArea: { flex: 1, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, zIndex: 5 },
  skyFrame: {
    flex: 1,
    minHeight: 280,
    borderRadius: GRIP_SESSION.radius.card,
    backgroundColor: T.canvasBorder,
    padding: 4,
  },
  skyInner: {
    flex: 1,
    borderRadius: GRIP_SESSION.radius.card - 2,
    backgroundColor: T.canvas,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: T.popRing,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    zIndex: 5,
  },
  constellationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  starSlot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 27, 75, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  starSlotLit: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: T.accent,
  },
  starSlotIcon: { fontSize: 10, color: T.inkMuted },
  starSlotIconLit: { fontSize: 14 },
  orbitMeter: {
    marginTop: 12,
    backgroundColor: 'rgba(30, 27, 75, 0.65)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  orbitHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orbitLabel: { fontSize: 13, fontWeight: '800', color: T.ink },
  orbitPct: { fontSize: 16, fontWeight: '900', color: T.accent },
  orbitTrack: { height: 14, backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: 7, overflow: 'hidden' },
  orbitFill: { height: '100%', borderRadius: 7 },
  milestoneOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  milestoneCard: {
    backgroundColor: 'rgba(30, 27, 75, 0.92)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: T.accent,
    ...GRIP_SESSION.shadow.card,
  },
  milestoneEmoji: { fontSize: 40, marginBottom: 6 },
  milestoneText: { fontSize: 18, fontWeight: '900', color: T.ink, textAlign: 'center' },
});
