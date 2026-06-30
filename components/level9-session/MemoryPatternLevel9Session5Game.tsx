/**
 * Level 9 (Clockwise) — Session 5, Game 1: Signal Echo
 * Watch a color signal sequence, then repeat it in order.
 */
import { ClockwiseGameShell } from '@/components/level9-session/shared/ClockwiseGameShell';
import { CW } from '@/components/level9-session/shared/clockwiseTheme';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { speak } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const PATTERN = ['red', 'blue', 'green', 'yellow'] as const;
type ColorId = (typeof PATTERN)[number];

const OPTIONS: { id: ColorId; label: string; color: string; glow: string; glyph: string }[] = [
  { id: 'red', label: 'Red', color: '#EF4444', glow: '#FCA5A5', glyph: '●' },
  { id: 'blue', label: 'Blue', color: '#3B82F6', glow: '#93C5FD', glyph: '●' },
  { id: 'green', label: 'Green', color: '#22C55E', glow: '#86EFAC', glyph: '●' },
  { id: 'yellow', label: 'Yellow', color: '#EAB308', glow: '#FDE047', glyph: '●' },
];

const VOICE = 'Watch the color signal. Then tap the colors in the same order.';
const S5 = { accent: '#EC4899', glow: '#FDA4AF', cyan: '#F472B6' } as const;

function SignalOrb({
  color,
  glow,
  glyph,
  label,
  active,
  size = 'md',
}: {
  color: string;
  glow: string;
  glyph: string;
  label?: string;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(
        withSequence(withTiming(1, { duration: 280 }), withTiming(0.3, { duration: 280 })),
        -1,
        true,
      );
    } else {
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [active, pulse]);

  const halo = useAnimatedStyle(() => ({
    opacity: active ? 0.25 + pulse.value * 0.45 : 0.08,
    transform: [{ scale: active ? 1 + pulse.value * 0.18 : 1 }],
  }));

  const dim = size === 'sm' ? 40 : size === 'lg' ? 64 : 52;

  return (
    <View style={[orb.wrap, { width: dim, height: dim }]}>
      <Animated.View style={[orb.halo, { backgroundColor: glow, borderRadius: dim / 2 }, halo]} />
      <View style={[orb.core, { backgroundColor: color, width: dim - 8, height: dim - 8, borderRadius: (dim - 8) / 2 }]}>
        <Text style={[orb.glyph, size === 'sm' && orb.glyphSm]}>{glyph}</Text>
      </View>
      {label ? <Text style={orb.label}>{label}</Text> : null}
    </View>
  );
}

function TapPad({
  option,
  shake,
  onPress,
}: {
  option: (typeof OPTIONS)[number];
  shake: boolean;
  onPress: () => void;
}) {
  const shakeX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (shake) {
      shakeX.value = withSequence(
        withTiming(-9, { duration: 45 }),
        withTiming(9, { duration: 45 }),
        withTiming(-6, { duration: 45 }),
        withTiming(0, { duration: 45 }),
      );
      scale.value = withSequence(withSpring(0.94, { damping: 8 }), withSpring(1, { damping: 10 }));
    }
  }, [shake, shakeX, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pad.btn, pressed && pad.pressed]}
        accessibilityLabel={option.label}
      >
        <LinearGradient
          colors={[`${option.color}EE`, `${option.color}99`]}
          style={pad.grad}
        >
          <View style={[pad.halo, { backgroundColor: `${option.glow}33` }]} />
          <Text style={pad.glyph}>{option.glyph}</Text>
          <Text style={pad.label}>{option.label}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export interface MemoryPatternLevel9Session5GameProps {
  onComplete: () => void;
}

export function MemoryPatternLevel9Session5Game({ onComplete }: MemoryPatternLevel9Session5GameProps) {
  const [phase, setPhase] = useState<'show' | 'repeat'>('show');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [userIndex, setUserIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wrongId, setWrongId] = useState<ColorId | null>(null);
  const [attempts, setAttempts] = useState(0);
  const showRunRef = useRef(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const runShowSequence = useCallback(() => {
    showRunRef.current += 1;
    const runId = showRunRef.current;
    setPhase('show');
    setHighlightIndex(-1);
    setUserIndex(0);
    setWrongId(null);

    let i = 0;
    const step = () => {
      if (runId !== showRunRef.current) return;
      if (i >= PATTERN.length) {
        setHighlightIndex(-1);
        speak('Your turn! Tap the colors in the same order.', 0.8);
        setPhase('repeat');
        return;
      }
      setHighlightIndex(i);
      i += 1;
      setTimeout(step, 680);
    };
    setTimeout(step, 500);
  }, []);

  useEffect(() => {
    runShowSequence();
  }, [runShowSequence]);

  const handleTap = useCallback(
    (id: ColorId) => {
      if (phase !== 'repeat') return;
      const expected = PATTERN[userIndex];
      if (id === expected) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        const next = userIndex + 1;
        setUserIndex(next);
        setWrongId(null);
        if (next >= PATTERN.length) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          speak('Correct! You repeated the signal!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2400);
        }
      } else {
        setAttempts((a) => a + 1);
        setWrongId(id);
        setUserIndex(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Not that one. Watch the signal and try again.', 0.7);
        setTimeout(() => setWrongId(null), 700);
      }
    },
    [phase, userIndex, onComplete],
  );

  const coachLine =
    phase === 'show'
      ? 'Watch each color pulse — memorize the order.'
      : userIndex === 0 && attempts > 0
        ? 'Start from the first color. Tap Replay signal if you need to watch again.'
        : `Signal progress: ${userIndex} of ${PATTERN.length} colors matched.`;

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Signal Echo!"
        subtitle="You repeated the full color signal!"
        badgeEmoji="📡"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="SIGNAL ECHO · GAME 1"
      title="Repeat the signal"
      instruction="Watch the color sequence, then tap the same colors in order."
      mascot="📡"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.phaseRow}>
        <View style={[styles.phaseChip, phase === 'show' && styles.phaseActive]}>
          <Text style={styles.phaseIcon}>👁</Text>
          <Text style={[styles.phaseTxt, phase === 'show' && styles.phaseTxtOn]}>WATCH</Text>
        </View>
        <Text style={styles.phaseArrow}>›</Text>
        <View style={[styles.phaseChip, phase === 'repeat' && styles.phaseActive]}>
          <Text style={styles.phaseIcon}>👆</Text>
          <Text style={[styles.phaseTxt, phase === 'repeat' && styles.phaseTxtOn]}>REPEAT</Text>
        </View>
      </View>

      {phase === 'show' ? (
        <View style={styles.showStage}>
          <Text style={styles.stageLabel}>INCOMING SIGNAL</Text>
          <View style={styles.signalRail}>
            <LinearGradient
              colors={[`${S5.accent}44`, 'transparent', `${S5.cyan}33`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.railGlow}
            />
            {PATTERN.map((id, i) => {
              const opt = OPTIONS.find((o) => o.id === id)!;
              return (
                <SignalOrb
                  key={i}
                  color={opt.color}
                  glow={opt.glow}
                  glyph={opt.glyph}
                  active={highlightIndex === i}
                  size="lg"
                />
              );
            })}
          </View>
          <Text style={styles.showHint}>Colors light up one at a time…</Text>
        </View>
      ) : (
        <>
          <View style={styles.progressWrap}>
            <Text style={styles.progressLabel}>ECHO PROGRESS</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(userIndex / PATTERN.length) * 100}%` }]} />
            </View>
            <View style={styles.dotRow}>
              {PATTERN.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i < userIndex && styles.dotDone, i === userIndex && styles.dotCurrent]}
                />
              ))}
            </View>
          </View>

          <View style={styles.padGrid}>
            {OPTIONS.map((opt) => (
              <TapPad
                key={opt.id}
                option={opt}
                shake={wrongId === opt.id}
                onPress={() => handleTap(opt.id)}
              />
            ))}
          </View>

          <Pressable
            onPress={runShowSequence}
            style={({ pressed }) => [styles.replayBtn, pressed && styles.pressed]}
          >
            <Text style={styles.replayTxt}>↺ Replay signal</Text>
          </Pressable>
        </>
      )}
    </ClockwiseGameShell>
  );
}

const orb = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: '100%', height: '100%' },
  core: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)' },
  glyph: { fontSize: 22, color: '#FFF', fontWeight: '900' },
  glyphSm: { fontSize: 16 },
  label: { marginTop: 6, fontSize: 9, fontWeight: '800', color: CW.textMuted, letterSpacing: 0.6 },
});

const pad = StyleSheet.create({
  btn: { borderRadius: 18, overflow: 'hidden', minWidth: 130, flex: 1, maxWidth: 160 },
  grad: { paddingVertical: 18, alignItems: 'center', borderRadius: 18, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)' },
  halo: { position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderRadius: 12 },
  glyph: { fontSize: 28, color: '#FFF', fontWeight: '900' },
  label: { fontSize: 13, fontWeight: '900', color: '#FFF', marginTop: 4 },
  pressed: { opacity: 0.88 },
});

const styles = StyleSheet.create({
  phaseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  phaseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: CW.glass,
    borderWidth: 1,
    borderColor: CW.glassBorder,
  },
  phaseActive: { borderColor: S5.glow, backgroundColor: 'rgba(236,72,153,0.2)' },
  phaseIcon: { fontSize: 14 },
  phaseTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 1, color: CW.textMuted },
  phaseTxtOn: { color: S5.glow },
  phaseArrow: { fontSize: 16, color: CW.textMuted },
  showStage: { alignItems: 'center', marginBottom: 8 },
  stageLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.4, color: S5.glow, marginBottom: 14 },
  signalRail: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${S5.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.5)',
    overflow: 'hidden',
  },
  railGlow: { ...StyleSheet.absoluteFillObject },
  showHint: { marginTop: 12, fontSize: 13, fontWeight: '700', color: CW.textMuted },
  progressWrap: { marginBottom: 18, alignSelf: 'stretch' },
  progressLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: S5.glow, marginBottom: 6 },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(236,72,153,0.2)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: S5.accent },
  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(253,164,175,0.25)' },
  dotDone: { backgroundColor: S5.glow },
  dotCurrent: { backgroundColor: S5.cyan, transform: [{ scale: 1.2 }] },
  padGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 14 },
  replayBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: `${S5.accent}66`,
    backgroundColor: 'rgba(236,72,153,0.12)',
  },
  replayTxt: { fontSize: 14, fontWeight: '800', color: S5.glow },
  pressed: { opacity: 0.9 },
});
