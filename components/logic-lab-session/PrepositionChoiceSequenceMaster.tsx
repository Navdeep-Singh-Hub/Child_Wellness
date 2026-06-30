/**
 * Game 1 — Position Pulse: find the correct position word (cat under table).
 * Logic Lab · Section 6 · Session 9 (Sequence Master)
 */
import { LogicLabGameShell } from '@/components/logic-lab-session/shared/LogicLabGameShell';
import { LL } from '@/components/logic-lab-session/shared/logicLabTheme';
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

type Position = 'under' | 'on' | 'between';

const OPTIONS: Position[] = ['under', 'on', 'between'];
const CORRECT: Position = 'under';
const VOICE = 'Find the correct position. The cat is under the table. Tap UNDER.';

const SEQ = { amber: '#F59E0B', glow: '#FDE68A', indigo: '#6366F1', midnight: '#1E1B4B', step: '#38BDF8' } as const;

const PREP_COLOR: Record<Position, string> = {
  under: '#A78BFA',
  on: '#38BDF8',
  between: '#F472B6',
};

function AnchorScene() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      true,
    );
  }, [pulse]);

  const shadowGlow = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.3,
  }));

  return (
    <View style={scene.wrap}>
      <Text style={scene.label}>SCENE</Text>
      <LinearGradient colors={[`${SEQ.indigo}33`, 'transparent']} style={scene.sky} />
      <View style={scene.floor} />
      <Animated.View style={[scene.shadowZone, shadowGlow]} />
      <Text style={[scene.catEmoji, scene.catUnder]}>🐱</Text>
      <View style={scene.table}>
        <LinearGradient colors={['#D4A574', '#92400E']} style={scene.tableGrad} />
      </View>
      <Text style={scene.caption}>Cat under table</Text>
    </View>
  );
}

function SentenceCard() {
  return (
    <View style={sentence.wrap}>
      <Text style={sentence.label}>SENTENCE</Text>
      <View style={sentence.line}>
        <Text style={sentence.text}>The cat is </Text>
        <View style={sentence.blank}>
          <Text style={sentence.blankTxt}>?</Text>
        </View>
        <Text style={sentence.text}> the table.</Text>
      </View>
    </View>
  );
}

function WordChip({
  word,
  selected,
  feedback,
  onPress,
}: {
  word: Position;
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);
  const accent = PREP_COLOR[word];

  useEffect(() => {
    if (feedback === 'wrong' && selected) {
      shake.value = withSequence(
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
    }
  }, [feedback, selected, shake]);

  useEffect(() => {
    if (feedback === 'correct' && selected) {
      scale.value = withSpring(1.06, { damping: 8 }, () => {
        scale.value = withSpring(1);
      });
    }
  }, [feedback, selected, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  const border =
    feedback === 'correct' && selected
      ? LL.good
      : feedback === 'wrong' && selected
        ? LL.warn
        : selected
          ? accent
          : LL.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.chip, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={word}
      >
        <View style={[styles.chipGlow, { backgroundColor: `${accent}22` }]} />
        <Text style={[styles.chipText, { color: selected ? accent : LL.textLight }]}>{word.toUpperCase()}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function PrepositionChoiceSequenceMaster({ onComplete }: { onComplete: () => void }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<Position | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [attempts, setAttempts] = useState(0);

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleChoice = useCallback(
    (word: Position) => {
      if (feedback === 'correct') return;
      setSelected(word);
      setAttempts((a) => a + 1);

      if (word === CORRECT) {
        setFeedback('correct');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct! UNDER — the cat is below the table!');
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2400);
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(
          word === 'on'
            ? 'ON means on top. The cat is below — tap UNDER!'
            : 'BETWEEN needs two things on each side. Here the cat is UNDER!',
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
      ? 'Read the scene — which word means below the table?'
      : 'UNDER = below. ON = on top. BETWEEN = in the middle.';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Position Pulse!"
        subtitle="UNDER — the cat is below the table!"
        badgeEmoji="🐱"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="POSITION PULSE · GAME 1"
      title="Find the correct position"
      instruction="Which word describes where the cat is?"
      mascot="🐱"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 9 · SEQUENCE MASTER</Text>
      </View>

      <View style={styles.layout}>
        <AnchorScene />
        <SentenceCard />
      </View>

      <Text style={styles.prompt}>Which position word is correct?</Text>

      <View style={styles.optionsRow}>
        {OPTIONS.map((word) => (
          <WordChip
            key={word}
            word={word}
            selected={selected === word}
            feedback={feedback}
            onPress={() => handleChoice(word)}
          />
        ))}
      </View>
    </LogicLabGameShell>
  );
}

const scene = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 130,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${SEQ.amber}55`,
    backgroundColor: 'rgba(30,27,75,0.55)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  label: { fontSize: 8, fontWeight: '900', letterSpacing: 1.2, color: SEQ.glow, marginBottom: 8 },
  sky: { ...StyleSheet.absoluteFillObject },
  floor: {
    position: 'absolute',
    bottom: 28,
    width: 100,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(99,102,241,0.35)',
  },
  table: {
    width: 80,
    height: 24,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#78350F',
    marginBottom: 10,
  },
  tableGrad: { ...StyleSheet.absoluteFillObject },
  shadowZone: {
    position: 'absolute',
    bottom: 38,
    width: 76,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(99,102,241,0.4)',
    borderWidth: 1,
    borderColor: `${SEQ.indigo}44`,
  },
  catEmoji: { fontSize: 30 },
  catUnder: { position: 'absolute', bottom: 40, zIndex: 1 },
  caption: { fontSize: 11, fontWeight: '800', color: SEQ.glow, marginTop: 4 },
});

const sentence = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${SEQ.indigo}55`,
    backgroundColor: 'rgba(15,23,42,0.55)',
    padding: 14,
  },
  label: { fontSize: 8, fontWeight: '900', letterSpacing: 1.2, color: SEQ.step, marginBottom: 10 },
  line: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 16, fontWeight: '700', color: LL.textLight },
  blank: {
    minWidth: 44,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: `${SEQ.amber}88`,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  blankTxt: { fontSize: 18, fontWeight: '900', color: SEQ.amber },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: `${SEQ.amber}55`,
    marginBottom: 12,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: SEQ.glow },
  layout: { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'stretch' },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: LL.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  chip: {
    minWidth: 96,
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 16,
    borderWidth: 2.5,
    backgroundColor: 'rgba(15,23,42,0.65)',
    alignItems: 'center',
    overflow: 'hidden',
  },
  chipGlow: { ...StyleSheet.absoluteFillObject },
  chipText: { fontSize: 17, fontWeight: '900', letterSpacing: 0.8 },
  pressed: { opacity: 0.88 },
});
