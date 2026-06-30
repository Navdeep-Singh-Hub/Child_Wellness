/**
 * Level 9 (Clockwise) — Session 7, Game 1: Emotion Recognition
 * Tap the confused face. Options: happy, sad, angry, confused.
 */
import { ClockwiseGameShell } from '@/components/level9-session/shared/ClockwiseGameShell';
import { CW } from '@/components/level9-session/shared/clockwiseTheme';
import { SuccessCelebration } from '@/components/ui/SuccessCelebration';
import { speak } from '@/utils/tts';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const FACES = [
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'angry', label: 'Angry', emoji: '😠' },
  { id: 'confused', label: 'Confused', emoji: '😕' },
] as const;

type FaceId = (typeof FACES)[number]['id'];
const CORRECT_ID: FaceId = 'confused';

const VOICE = 'Tap the confused face.';
const PALETTE = { accent: '#F43F5E', glow: '#FDA4AF', rose: '#FB7185' } as const;

function TargetBadge() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0, { duration: 800 })),
      -1,
      true,
    );
  }, [pulse]);

  const glow = useAnimatedStyle(() => ({
    opacity: 0.15 + pulse.value * 0.25,
    transform: [{ scale: 1 + pulse.value * 0.05 }],
  }));

  return (
    <View style={badge.wrap}>
      <Animated.View style={[badge.glow, glow]} />
      <Text style={badge.label}>TARGET EMOTION</Text>
      <View style={badge.row}>
        <Text style={badge.emoji}>😕</Text>
        <Text style={badge.word}>CONFUSED</Text>
      </View>
      <Text style={badge.hint}>raised brows · tilted mouth · puzzled look</Text>
    </View>
  );
}

function FaceOrb({
  face,
  selected,
  feedback,
  onPress,
}: {
  face: (typeof FACES)[number];
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (feedback === 'wrong' && selected) {
      shake.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    } else if (feedback === 'correct' && selected) {
      scale.value = withSpring(1.08, { damping: 8 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [feedback, selected, shake, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  const border =
    feedback === 'correct' && selected
      ? CW.good
      : feedback === 'wrong' && selected
        ? CW.warn
        : selected
          ? PALETTE.glow
          : CW.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={face.label}
      >
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'rgba(8,12,40,0.55)']}
          style={styles.orbGrad}
        />
        <Text style={styles.orbEmoji}>{face.emoji}</Text>
        <Text style={styles.orbLabel}>{face.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface EmotionRecognitionConfusedLevel9Session7GameProps {
  onComplete: () => void;
}

export function EmotionRecognitionConfusedLevel9Session7Game({
  onComplete,
}: EmotionRecognitionConfusedLevel9Session7GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<FaceId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (id: FaceId) => {
      if (feedback === 'correct') return;
      setSelected(id);
      setAttempts((a) => a + 1);

      if (id === CORRECT_ID) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! You found the confused face!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          id === 'happy'
            ? 'Happy is smiling — confused looks puzzled!'
            : id === 'sad'
              ? 'Sad has tears — look for a puzzled brow!'
              : 'Angry is frowning — confused looks unsure!',
          0.7,
        );
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
      }
    },
    [feedback, onComplete],
  );

  const coachLine =
    attempts === 0
      ? 'Look for raised eyebrows and a puzzled mouth — that is confused!'
      : 'Scan each face: which one looks unsure or puzzled?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Confused Scan!"
        subtitle="You found the confused face!"
        badgeEmoji="😕"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="CONFUSED SCAN · GAME 1"
      title="Tap the confused face"
      instruction="Four faces appear — tap the one that looks confused."
      mascot="😕"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.scanFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.rose}22`]}
          style={styles.scanGlow}
        />
        <TargetBadge />
      </View>

      <Text style={styles.prompt}>Tap the matching face</Text>

      <View style={styles.facesRow}>
        {FACES.map((face) => (
          <FaceOrb
            key={face.id}
            face={face}
            selected={selected === face.id}
            feedback={feedback}
            onPress={() => handleTap(face.id)}
          />
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>
          {attempts === 0 ? '😊 😢 😠 — find 😕' : `Scans: ${attempts}`}
        </Text>
      </View>
    </ClockwiseGameShell>
  );
}

const badge = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.55)',
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  glow: {
    position: 'absolute',
    width: '80%',
    height: 50,
    borderRadius: 25,
    backgroundColor: PALETTE.accent,
    top: 20,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  emoji: { fontSize: 36 },
  word: { fontSize: 22, fontWeight: '900', color: CW.textLight, letterSpacing: 2 },
  hint: { fontSize: 12, fontWeight: '700', color: CW.textMuted },
});

const styles = StyleSheet.create({
  scanFrame: {
    borderRadius: 20,
    marginBottom: 18,
    overflow: 'hidden',
  },
  scanGlow: { ...StyleSheet.absoluteFillObject },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: CW.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  facesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  orb: {
    minWidth: 96,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 2.5,
    alignItems: 'center',
    overflow: 'hidden',
  },
  orbGrad: { ...StyleSheet.absoluteFillObject },
  orbEmoji: { fontSize: 42, marginBottom: 6 },
  orbLabel: { fontSize: 13, fontWeight: '800', color: CW.textMuted },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(244,63,94,0.12)',
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: PALETTE.glow, textAlign: 'center' },
});
