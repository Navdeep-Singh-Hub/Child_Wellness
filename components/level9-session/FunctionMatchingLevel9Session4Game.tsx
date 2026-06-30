/**
 * Level 9 (Clockwise) — Session 4, Game 3: Function Matching
 * Match tools with their use. One question: "What do we use for cutting?" → Scissors.
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

const QUESTION = { prompt: 'What do we use for cutting?', correctId: 'scissors', useLabel: 'Cutting' };
const OBJECTS = [
  { id: 'scissors', label: 'Scissors', emoji: '✂️' },
  { id: 'brush', label: 'Brush', emoji: '🖌️' },
  { id: 'key', label: 'Key', emoji: '🔑' },
] as const;

type ObjectId = (typeof OBJECTS)[number]['id'];

const VOICE = 'What do we use for cutting? Tap the tool we use to cut.';
const PALETTE = { accent: '#F59E0B', glow: '#FCD34D', secondary: '#FBBF24' } as const;

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
      <Text style={styles.missionLabel}>FORGE MISSION QUERY</Text>
      <Text style={styles.missionPrompt}>{QUESTION.prompt}</Text>
      <View style={styles.useBadge}>
        <Text style={styles.useEmoji}>✂️</Text>
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
        style={({ pressed }) => [styles.beacon, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={obj.label}
      >
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'rgba(8,12,40,0.55)']}
          style={styles.beaconGrad}
        />
        <Text style={styles.beaconEmoji}>{obj.emoji}</Text>
        <Text style={styles.beaconLabel}>{obj.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface FunctionMatchingLevel9Session4GameProps {
  onComplete: () => void;
}

export function FunctionMatchingLevel9Session4Game({ onComplete }: FunctionMatchingLevel9Session4GameProps) {
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
        speak('Correct! We use scissors for cutting!', 0.75);
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          id === 'brush'
            ? 'A brush is for painting. Which tool helps you cut?'
            : 'A key opens locks. Find the cutting tool!',
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
      ? 'Think: which tool has two blades that snip?'
      : 'Cutting needs a sharp tool you squeeze shut!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You matched the tool to its use!"
        badgeEmoji="✂️"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="FUNCTION MATCHING · GAME 3"
      title="Match the use"
      instruction="What do we use for cutting? Tap the right tool."
      mascot="✂️"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <MissionCard />

      <View style={styles.matrixFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.matrixGlow}
        />
        <Text style={styles.matrixLabel}>TOOL FORGE BEACONS</Text>
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
        <Text style={styles.legendTxt}>Match the tool to the job: Cutting</Text>
      </View>
    </ClockwiseGameShell>
  );
}

const styles = StyleSheet.create({
  missionWrap: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.45)',
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
    backgroundColor: PALETTE.accent,
  },
  missionLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
    color: PALETTE.glow,
    marginBottom: 8,
  },
  missionPrompt: {
    fontSize: 20,
    fontWeight: '900',
    color: CW.textLight,
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
    borderColor: `${PALETTE.glow}66`,
  },
  useEmoji: { fontSize: 22 },
  useText: { fontSize: 16, fontWeight: '800', color: PALETTE.glow },
  matrixFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(8,12,40,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  matrixGlow: { ...StyleSheet.absoluteFillObject },
  matrixLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
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
    backgroundColor: 'rgba(8,12,40,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  beaconGrad: { ...StyleSheet.absoluteFillObject },
  beaconEmoji: { fontSize: 42 },
  beaconLabel: { fontSize: 13, fontWeight: '800', color: CW.textMuted, marginTop: 6 },
  pressed: { opacity: 0.88 },
  legend: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
  },
  legendTxt: { fontSize: 12, fontWeight: '700', color: PALETTE.glow, textAlign: 'center' },
});
