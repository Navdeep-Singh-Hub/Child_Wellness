/**
 * Game 2 — Word Court: complete sentences with IN and UNDER.
 * Logic Lab · Section 6 · Session 10 (Logic Lab Master)
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

const QUESTIONS = [
  {
    id: 'ball-in',
    before: 'The ball is',
    after: 'the box.',
    correct: 'in',
    options: ['in', 'on', 'under'] as const,
    voice: 'Choose the correct word. The ball is in the box. Tap IN.',
    coach: 'The ball sits inside the box — which word means inside?',
    accent: '#818CF8',
    scene: { emoji: '⚽', anchor: '📦', layout: 'in' as const },
  },
  {
    id: 'cat-under',
    before: 'The cat is',
    after: 'the table.',
    correct: 'under',
    options: ['under', 'in', 'between'] as const,
    voice: 'Choose the correct word. The cat is under the table. Tap UNDER.',
    coach: 'The cat hides below the table — which word means below?',
    accent: '#A78BFA',
    scene: { emoji: '🐱', anchor: '🪵', layout: 'under' as const },
  },
] as const;

type Prep = (typeof QUESTIONS)[number]['options'][number];

const VOICE_INTRO = 'Complete two sentences. Tap the position word that fits.';

const CROWN = { gold: '#FBBF24', glow: '#FEF3C7', violet: '#7C3AED', amber: '#F59E0B', deep: '#1E1B4B' } as const;

const PREP_COLOR: Record<string, string> = {
  in: '#818CF8',
  on: '#38BDF8',
  under: '#A78BFA',
  between: '#F472B6',
};

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <View style={bar.wrap}>
      <View style={bar.track}>
        <LinearGradient
          colors={[CROWN.gold, CROWN.violet]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[bar.fill, { width: `${pct}%` }]}
        />
      </View>
      <Text style={bar.label}>Question {done + 1} of {total}</Text>
    </View>
  );
}

function MiniScene({ layout, emoji, anchor }: { layout: 'in' | 'under'; emoji: string; anchor: string }) {
  if (layout === 'in') {
    return (
      <View style={scene.stage}>
        <View style={scene.box}>
          <Text style={scene.sceneEmoji}>{emoji}</Text>
        </View>
        <Text style={scene.anchorSmall}>{anchor}</Text>
      </View>
    );
  }
  return (
    <View style={scene.stage}>
      <Text style={scene.anchorTop}>{anchor}</Text>
      <View style={scene.underSlot}>
        <Text style={scene.sceneEmoji}>{emoji}</Text>
      </View>
    </View>
  );
}

function SentenceCard({
  before,
  after,
  accent,
  scene,
}: {
  before: string;
  after: string;
  accent: string;
  scene: (typeof QUESTIONS)[number]['scene'];
}) {
  return (
    <View style={sentence.wrap}>
      <Text style={sentence.label}>SENTENCE CARD</Text>
      <MiniScene {...scene} />
      <View style={sentence.line}>
        <Text style={sentence.text}>{before} </Text>
        <View style={[sentence.blank, { borderColor: `${accent}88` }]}>
          <Text style={[sentence.blankTxt, { color: accent }]}>?</Text>
        </View>
        <Text style={sentence.text}> {after}</Text>
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
  word: string;
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);
  const accent = PREP_COLOR[word] ?? CROWN.violet;

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

export function PrepositionQuizLogicLabMaster({ onComplete }: { onComplete: () => void }) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<Prep | null>(null);
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
    (word: Prep) => {
      if (feedback === 'correct') return;
      setSelected(word);

      if (word !== q.correct) {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak(`Not ${word.toUpperCase()}. Read the scene again!`);
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
        return;
      }

      setFeedback('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speak(`Correct! ${word.toUpperCase()}!`);

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
        variant="sunset"
        title="Word Court!"
        subtitle="You know your positions — IN and UNDER!"
        badgeEmoji="📝"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="WORD COURT · GAME 2"
      title="Choose the correct position word"
      instruction="Tap the word that completes each sentence."
      mascot="📝"
      coachLine={q.coach}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 10 · LOGIC LAB MASTER</Text>
      </View>

      <ProgressBar done={questionIndex} total={QUESTIONS.length} />

      <SentenceCard before={q.before} after={q.after} accent={q.accent} scene={q.scene} />

      <Text style={styles.prompt}>Which word is correct?</Text>

      <View style={styles.options}>
        {q.options.map((word) => (
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

const bar = StyleSheet.create({
  wrap: { marginBottom: 14, gap: 5 },
  track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.35)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  label: { fontSize: 12, fontWeight: '800', color: CROWN.glow, textAlign: 'center' },
});

const scene = StyleSheet.create({
  stage: { alignItems: 'center', marginBottom: 12, minHeight: 56 },
  box: {
    width: 56,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#818CF8',
    backgroundColor: 'rgba(129,140,248,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sceneEmoji: { fontSize: 26 },
  anchorSmall: { fontSize: 10, fontWeight: '700', color: LL.textMuted, marginTop: 4 },
  anchorTop: { fontSize: 28 },
  underSlot: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 1,
    borderColor: '#A78BFA55',
  },
});

const sentence = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    borderWidth: 2,
    borderColor: `${CROWN.gold}44`,
    backgroundColor: 'rgba(30,27,75,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  label: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: CROWN.glow, marginBottom: 10 },
  line: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 17, fontWeight: '700', color: LL.textLight },
  blank: {
    minWidth: 44,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  blankTxt: { fontSize: 18, fontWeight: '900' },
});

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderWidth: 1,
    borderColor: `${CROWN.gold}55`,
    marginBottom: 10,
  },
  badgeTxt: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: CROWN.glow },
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
    paddingHorizontal: 22,
    minWidth: 96,
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  chipGlow: { ...StyleSheet.absoluteFillObject },
  chipText: { fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  pressed: { opacity: 0.88 },
});
