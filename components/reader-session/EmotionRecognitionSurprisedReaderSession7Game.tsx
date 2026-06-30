/**
 * Level 7 Reader — Session 7, Game 1: Surprise Scan
 * Select the surprised face. Options: happy, sad, angry, surprised.
 */
import { ReaderGameShell } from '@/components/reader-session/shared/ReaderGameShell';
import { RD } from '@/components/reader-session/shared/readerTheme';
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
  { id: 'surprised', label: 'Surprised', emoji: '😲' },
] as const;

type FaceId = (typeof FACES)[number]['id'];
const CORRECT_ID: FaceId = 'surprised';

const VOICE = 'Tap the surprised face.';
const SCAN = { accent: '#F43F5E', glow: '#FDA4AF', rose: '#FB7185' } as const;

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
        <Text style={badge.emoji}>😲</Text>
        <Text style={badge.word}>SURPRISED</Text>
      </View>
      <Text style={badge.hint}>wide eyes · open mouth · sudden shock</Text>
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
      ? RD.good
      : feedback === 'wrong' && selected
        ? RD.warn
        : selected
          ? SCAN.glow
          : RD.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={face.label}
      >
        <View style={[styles.orbHalo, { backgroundColor: `${SCAN.accent}22` }]} />
        <Text style={styles.orbEmoji}>{face.emoji}</Text>
        <Text style={styles.orbLabel}>{face.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface EmotionRecognitionSurprisedReaderSession7GameProps {
  onComplete: () => void;
}

export function EmotionRecognitionSurprisedReaderSession7Game({
  onComplete,
}: EmotionRecognitionSurprisedReaderSession7GameProps) {
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
        speak('Correct! You found the surprised face!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          id === 'happy'
            ? 'Happy is smiling — surprised has wide eyes!'
            : id === 'sad'
              ? 'Sad has tears — look for shock and surprise!'
              : 'Angry is frowning — surprised looks startled!',
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
      ? 'Look for wide eyes and an open mouth — that is surprised!'
      : 'Scan each face: which one looks shocked or startled?';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Surprise Scan!"
        subtitle="You found the surprised face!"
        badgeEmoji="😲"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="SURPRISE SCAN · GAME 1"
      title="Tap the surprised face"
      instruction="Four faces appear — tap the one that looks surprised."
      mascot="😲"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.scanFrame}>
        <LinearGradient
          colors={[`${SCAN.accent}33`, 'transparent', `${SCAN.rose}22`]}
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
          {attempts === 0 ? '😊 😢 😠 — find 😲' : `Scans: ${attempts}`}
        </Text>
      </View>
    </ReaderGameShell>
  );
}

const badge = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${SCAN.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.55)',
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  glow: {
    position: 'absolute',
    width: '80%',
    height: 50,
    borderRadius: 25,
    backgroundColor: SCAN.accent,
    top: 20,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: SCAN.glow,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  emoji: { fontSize: 36 },
  word: { fontSize: 22, fontWeight: '900', color: RD.textLight, letterSpacing: 2 },
  hint: { fontSize: 12, fontWeight: '700', color: RD.textMuted },
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
    color: RD.textLight,
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
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  orbHalo: { ...StyleSheet.absoluteFillObject },
  orbEmoji: { fontSize: 42, marginBottom: 6 },
  orbLabel: { fontSize: 13, fontWeight: '800', color: RD.textMuted },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(244,63,94,0.12)',
    borderWidth: 1,
    borderColor: `${SCAN.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: SCAN.glow, textAlign: 'center' },
});
