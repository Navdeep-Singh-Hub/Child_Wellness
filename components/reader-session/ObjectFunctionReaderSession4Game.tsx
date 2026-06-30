/**
 * Level 7 Reader — Session 4, Game 3: Use Matrix
 * Match object with its function. "What do we use for writing?" → Pencil.
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

const QUESTION = { prompt: 'What do we use for writing?', correctId: 'pencil', useLabel: 'Writing' };
const OBJECTS = [
  { id: 'pencil', label: 'Pencil', emoji: '✏️' },
  { id: 'cup', label: 'Cup', emoji: '🥤' },
  { id: 'hat', label: 'Hat', emoji: '🧢' },
] as const;

type ObjectId = (typeof OBJECTS)[number]['id'];

const VOICE = 'What do we use for writing? Tap the object we use to write.';
const MATRIX = { accent: '#F59E0B', glow: '#FCD34D', amber: '#FBBF24' } as const;

function MissionCard() {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      true,
    );
  }, [pulse]);

  const glow = useAnimatedStyle(() => ({
    opacity: 0.12 + pulse.value * 0.15,
  }));

  return (
    <View style={styles.missionWrap}>
      <Animated.View style={[styles.missionGlow, glow]} />
      <Text style={styles.missionLabel}>MISSION QUERY</Text>
      <Text style={styles.missionPrompt}>{QUESTION.prompt}</Text>
      <View style={styles.useBadge}>
        <Text style={styles.useEmoji}>📝</Text>
        <Text style={styles.useText}>{QUESTION.useLabel}</Text>
      </View>
    </View>
  );
}

function ToolBeacon({
  obj,
  selected,
  feedback,
  onPress,
}: {
  obj: (typeof OBJECTS)[number];
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
          ? MATRIX.glow
          : RD.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.beacon, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={obj.label}
      >
        <View style={[styles.beaconHalo, { backgroundColor: `${MATRIX.amber}22` }]} />
        <Text style={styles.beaconEmoji}>{obj.emoji}</Text>
        <Text style={styles.beaconLabel}>{obj.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface ObjectFunctionReaderSession4GameProps {
  onComplete: () => void;
}

export function ObjectFunctionReaderSession4Game({ onComplete }: ObjectFunctionReaderSession4GameProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<ObjectId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleTap = useCallback(
    (id: ObjectId) => {
      if (feedback === 'correct') return;
      setSelected(id);
      setAttempts((a) => a + 1);

      if (id === QUESTION.correctId) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! We use a pencil for writing!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          id === 'cup'
            ? 'A cup is for drinking. Which tool helps you write?'
            : 'A hat goes on your head. Find the writing tool!',
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
      ? 'Think: which object leaves marks on paper?'
      : 'Writing needs a tool you hold in your hand!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Use Matrix!"
        subtitle="You matched the object to its use!"
        badgeEmoji="✏️"
      />
    );
  }

  return (
    <ReaderGameShell
      studio="USE MATRIX · GAME 3"
      title="Match the use"
      instruction="What do we use for writing? Tap the right object."
      mascot="🔧"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <MissionCard />

      <View style={styles.matrixFrame}>
        <LinearGradient
          colors={[`${MATRIX.accent}33`, 'transparent', `${MATRIX.amber}22`]}
          style={styles.matrixGlow}
        />
        <Text style={styles.matrixLabel}>TOOL BEACONS</Text>
        <View style={styles.beaconsRow}>
          {OBJECTS.map((obj) => (
            <ToolBeacon
              key={obj.id}
              obj={obj}
              selected={selected === obj.id}
              feedback={feedback}
              onPress={() => handleTap(obj.id)}
            />
          ))}
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTxt}>Match the object to the job: Writing</Text>
      </View>
    </ReaderGameShell>
  );
}

const styles = StyleSheet.create({
  missionWrap: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${MATRIX.accent}55`,
    backgroundColor: 'rgba(50,30,10,0.45)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  missionGlow: {
    position: 'absolute',
    width: '80%',
    height: 60,
    borderRadius: 30,
    backgroundColor: MATRIX.accent,
  },
  missionLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    color: MATRIX.glow,
    marginBottom: 8,
  },
  missionPrompt: {
    fontSize: 20,
    fontWeight: '900',
    color: RD.textLight,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  useBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1.5,
    borderColor: `${MATRIX.glow}66`,
  },
  useEmoji: { fontSize: 22 },
  useText: { fontSize: 16, fontWeight: '800', color: MATRIX.glow },
  matrixFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${MATRIX.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  matrixGlow: { ...StyleSheet.absoluteFillObject },
  matrixLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: MATRIX.glow,
    textAlign: 'center',
    marginBottom: 14,
  },
  beaconsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },
  beacon: {
    width: 108,
    height: 118,
    borderRadius: 20,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  beaconHalo: { ...StyleSheet.absoluteFillObject },
  beaconEmoji: { fontSize: 42 },
  beaconLabel: { fontSize: 13, fontWeight: '800', color: RD.textMuted, marginTop: 6 },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: `${MATRIX.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: MATRIX.glow, textAlign: 'center' },
});
