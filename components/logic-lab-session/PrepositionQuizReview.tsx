/**
 * Game 1 — Position Patrol: mixed preposition quiz (3 questions).
 * Logic Lab · Section 6 · Session 7 (Mixed Prepositions Review)
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type Preposition = 'in' | 'on' | 'under' | 'behind' | 'between';

const QUESTIONS: {
  id: string;
  scene: string;
  correct: Preposition;
  options: Preposition[];
  voice: string;
  coach: string;
  accent: string;
}[] = [
  {
    id: 'cat-under',
    scene: 'Cat under table',
    correct: 'under',
    options: ['under', 'on', 'in'],
    voice: 'Where is the cat? Tap UNDER.',
    coach: 'The cat hides below the table surface.',
    accent: '#A78BFA',
  },
  {
    id: 'book-on',
    scene: 'Book on table',
    correct: 'on',
    options: ['in', 'on', 'behind'],
    voice: 'Where is the book? Tap ON.',
    coach: 'The book rests on top of the table.',
    accent: '#38BDF8',
  },
  {
    id: 'ball-in',
    scene: 'Ball in box',
    correct: 'in',
    options: ['under', 'in', 'between'],
    voice: 'Where is the ball? Tap IN.',
    coach: 'The ball sits inside the box.',
    accent: '#818CF8',
  },
];

const VOICE_INTRO = 'Answer three position questions. Tap the word that matches each scene.';

const REVIEW = { gold: '#FBBF24', glow: '#FDE68A', prism: '#6366F1', deep: '#312E81' } as const;

const PREP_COLOR: Partial<Record<Preposition, string>> = {
  in: '#818CF8',
  on: '#38BDF8',
  under: '#A78BFA',
  behind: '#4ADE80',
  between: '#F472B6',
};

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <View style={bar.wrap}>
      <View style={bar.track}>
        <LinearGradient
          colors={[REVIEW.gold, REVIEW.prism]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[bar.fill, { width: `${pct}%` }]}
        />
      </View>
      <Text style={bar.label}>Question {done + 1} of {total}</Text>
    </View>
  );
}

function SceneCard({ questionId }: { questionId: string }) {
  if (questionId === 'cat-under') {
    return (
      <View style={scene.wrap}>
        <Text style={scene.label}>SCENE</Text>
        <View style={scene.stage}>
          <Text style={[scene.emoji, scene.catUnder]}>🐱</Text>
          <Text style={[scene.emoji, scene.table]}>🪵</Text>
        </View>
        <Text style={scene.caption}>Cat ___ table</Text>
      </View>
    );
  }
  if (questionId === 'book-on') {
    return (
      <View style={scene.wrap}>
        <Text style={scene.label}>SCENE</Text>
        <View style={scene.stage}>
          <Text style={[scene.emoji, scene.bookOn]}>📖</Text>
          <Text style={[scene.emoji, scene.tableOn]}>🪵</Text>
        </View>
        <Text style={scene.caption}>Book ___ table</Text>
      </View>
    );
  }
  return (
    <View style={scene.wrap}>
      <Text style={scene.label}>SCENE</Text>
      <View style={scene.stage}>
        <View style={scene.box}>
          <Text style={scene.ballIn}>⚽</Text>
        </View>
      </View>
      <Text style={scene.caption}>Ball ___ box</Text>
    </View>
  );
}

function PrepChip({
  prep,
  selected,
  feedback,
  onPress,
}: {
  prep: Preposition;
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);
  const accent = PREP_COLOR[prep] ?? REVIEW.prism;

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
        accessibilityLabel={prep}
      >
        <View style={[styles.chipGlow, { backgroundColor: `${accent}22` }]} />
        <Text style={[styles.chipText, { color: selected ? accent : LL.textLight }]}>{prep.toUpperCase()}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function PrepositionQuizReview({ onComplete }: { onComplete: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<Preposition | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');

  const q = QUESTIONS[questionIndex];
  const isLast = questionIndex === QUESTIONS.length - 1;

  const playVoice = useCallback(() => {
    speak(questionIndex === 0 ? VOICE_INTRO : q.voice, 0.75).catch(() => {});
  }, [questionIndex, q.voice]);

  useEffect(() => {
    speak(q.voice, 0.75).catch(() => {});
  }, [questionIndex, q.voice]);

  const handleChoice = useCallback(
    (prep: Preposition) => {
      if (feedback === 'correct') return;
      setSelected(prep);

      if (prep !== q.correct) {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(`Not ${prep.toUpperCase()}. Look at the scene again!`);
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
        return;
      }

      setFeedback('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speak(`Correct! ${prep.toUpperCase()}!`);

      setTimeout(() => {
        if (isLast) {
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2400);
        } else {
          setQuestionIndex((i) => i + 1);
          setSelected(null);
          setFeedback('idle');
        }
      }, 1100);
    },
    [feedback, q.correct, isLast, onComplete],
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Position Patrol!"
        subtitle="You know your positions — IN, ON, UNDER!"
        badgeEmoji="📍"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="POSITION PATROL · GAME 1"
      title="Where is the object?"
      instruction="Tap the word that matches the position in each scene."
      mascot="📍"
      coachLine={q.coach}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 7 · MIXED REVIEW</Text>
      </View>

      <ProgressBar done={questionIndex} total={QUESTIONS.length} />

      <Text style={styles.sceneTitle}>{q.scene}</Text>

      <SceneCard questionId={q.id} />

      <Text style={styles.prompt}>Which word is correct?</Text>

      <View style={styles.options}>
        {q.options.map((prep) => (
          <PrepChip
            key={prep}
            prep={prep}
            selected={selected === prep}
            feedback={feedback}
            onPress={() => handleChoice(prep)}
          />
        ))}
      </View>
    </LogicLabGameShell>
  );
}

const bar = StyleSheet.create({
  wrap: { marginBottom: 14, gap: 5 },
  track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.35)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  label: { fontSize: 12, fontWeight: '800', color: REVIEW.glow, textAlign: 'center' },
});

const scene = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${REVIEW.gold}44`,
    backgroundColor: 'rgba(30,27,75,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: REVIEW.glow, marginBottom: 10 },
  stage: { height: 72, width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  emoji: { position: 'absolute', fontSize: 32 },
  catUnder: { bottom: 4, left: '28%' },
  table: { bottom: 4, right: '28%', fontSize: 36 },
  bookOn: { bottom: 36, alignSelf: 'center', fontSize: 28 },
  tableOn: { bottom: 4, alignSelf: 'center', fontSize: 36 },
  box: {
    width: 64,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#818CF8',
    backgroundColor: 'rgba(129,140,248,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ballIn: { fontSize: 26 },
  caption: { marginTop: 10, fontSize: 15, fontWeight: '800', color: LL.textLight },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1,
    borderColor: `${REVIEW.gold}55`,
    marginBottom: 10,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: REVIEW.glow },
  sceneTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: LL.textLight,
    textAlign: 'center',
    marginBottom: 10,
  },
  prompt: {
    fontSize: 16,
    fontWeight: '800',
    color: LL.textMuted,
    textAlign: 'center',
    marginBottom: 14,
  },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  chip: {
    borderRadius: 16,
    borderWidth: 2.5,
    paddingVertical: 18,
    paddingHorizontal: 24,
    minWidth: 100,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  chipGlow: { ...StyleSheet.absoluteFillObject },
  chipText: { fontSize: 17, fontWeight: '900', letterSpacing: 1 },
  pressed: { opacity: 0.88 },
});
