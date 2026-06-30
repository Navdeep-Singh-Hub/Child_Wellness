/**
 * Level 9 (Clockwise) — Session 10, Game 1: Fusion Scan
 * Identify shapes, colors, and numbers (one question per type).
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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type QuestionType = 'shape' | 'color' | 'number';

const QUESTIONS: {
  type: QuestionType;
  prompt: string;
  tag: string;
  options: { id: string; label: string; emoji?: string; color?: string }[];
  correctId: string;
}[] = [
  {
    type: 'shape',
    tag: 'SHAPE',
    prompt: 'Which shape is a triangle?',
    options: [
      { id: 'circle', label: 'Circle', emoji: '⭕' },
      { id: 'square', label: 'Square', emoji: '⬜' },
      { id: 'triangle', label: 'Triangle', emoji: '🔺' },
    ],
    correctId: 'triangle',
  },
  {
    type: 'color',
    tag: 'COLOR',
    prompt: 'Which color is BLUE?',
    options: [
      { id: 'red', label: 'Red', color: '#EF4444' },
      { id: 'blue', label: 'Blue', color: '#3B82F6' },
      { id: 'green', label: 'Green', color: '#22C55E' },
    ],
    correctId: 'blue',
  },
  {
    type: 'number',
    tag: 'COUNT',
    prompt: 'How many stars?',
    options: [
      { id: '7', label: '7' },
      { id: '8', label: '8' },
      { id: '9', label: '9' },
      { id: '10', label: '10' },
    ],
    correctId: '8',
  },
];

const FUSION = { accent: '#EAB308', glow: '#FDE047', violet: '#A855F7' } as const;

function QuizOrb({
  option,
  selected,
  feedback,
  onPress,
}: {
  option: (typeof QUESTIONS)[number]['options'][number];
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
          ? FUSION.glow
          : option.color
            ? option.color
            : CW.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.orb, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={option.label}
      >
        <View
          style={[
            styles.orbHalo,
            { backgroundColor: option.color ? `${option.color}22` : `${FUSION.violet}22` },
          ]}
        />
        {option.emoji ? <Text style={styles.orbEmoji}>{option.emoji}</Text> : null}
        {option.color ? <View style={[styles.colorDot, { backgroundColor: option.color }]} /> : null}
        {!option.emoji && !option.color ? (
          <Text style={styles.orbNumber}>{option.label}</Text>
        ) : null}
        <Text style={styles.orbLabel}>{option.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export interface MixedChallengeLevel9Session10GameProps {
  onComplete: () => void;
}

export function MixedChallengeLevel9Session10Game({ onComplete }: MixedChallengeLevel9Session10GameProps) {
  const [qIndex, setQIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [lock, setLock] = useState(false);

  const q = QUESTIONS[qIndex];
  const progressPct = ((qIndex + (feedback === 'correct' ? 1 : 0)) / QUESTIONS.length) * 100;

  const playVoice = useCallback(() => {
    speak(q.prompt, 0.75).catch(() => {});
  }, [q.prompt]);

  useEffect(() => {
    playVoice();
    setSelectedId(null);
    setFeedback('idle');
    setLock(false);
  }, [qIndex, playVoice]);

  const handleTap = useCallback(
    (id: string) => {
      if (lock || feedback === 'correct') return;
      setSelectedId(id);

      if (id === q.correctId) {
        setFeedback('correct');
        setLock(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        speak('Correct!', 0.6);

        if (qIndex + 1 >= QUESTIONS.length) {
          speak('You got them all! Shapes, colors, and numbers!', 0.75);
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2400);
        } else {
          setTimeout(() => setQIndex((i) => i + 1), 900);
        }
      } else {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again. ' + q.prompt, 0.7);
        setTimeout(() => {
          setFeedback('idle');
          setSelectedId(null);
        }, 900);
      }
    },
    [lock, feedback, q, qIndex, onComplete],
  );

  const coachLine =
    q.type === 'shape'
      ? 'Pick the triangle — three corners pointing up!'
      : q.type === 'color'
        ? 'Find the blue signal among the color choices!'
        : 'Count every star in the cluster before you answer!';

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Fusion Scan!"
        subtitle="You identified shapes, colors, and numbers!"
        badgeEmoji="🎯"
      />
    );
  }

  return (
    <ClockwiseGameShell
      studio="FUSION SCAN · GAME 1"
      title="Mixed quiz"
      instruction="Answer shape, color, and counting questions — one scan at a time."
      mascot="🎯"
      coachLine={coachLine}
      onReplayVoice={playVoice}
    >
      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>SCAN PROGRESS</Text>
          <Text style={styles.progressCount}>
            {qIndex + 1} / {QUESTIONS.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[FUSION.accent, FUSION.violet]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
        <View style={styles.phaseRow}>
          {QUESTIONS.map((item, i) => (
            <View
              key={item.type}
              style={[
                styles.phasePill,
                i < qIndex && styles.phaseDone,
                i === qIndex && styles.phaseActive,
                i > qIndex && styles.phaseIdle,
              ]}
            >
              <Text style={styles.phaseTxt}>{item.tag}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.promptFrame}>
        <LinearGradient
          colors={[`${FUSION.accent}33`, 'transparent', `${FUSION.violet}22`]}
          style={styles.promptGlow}
        />
        <Text style={styles.promptTag}>{q.tag} SCAN</Text>
        <Text style={styles.prompt}>{q.prompt}</Text>
        {q.type === 'number' ? (
          <View style={styles.starsFrame}>
            <Text style={styles.starsLabel}>STAR CLUSTER</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Text key={i} style={styles.star}>
                  ⭐
                </Text>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <Text style={styles.tapLabel}>Tap your answer</Text>

      <View style={styles.choicesRow}>
        {q.options.map((opt) => (
          <QuizOrb
            key={opt.id}
            option={opt}
            selected={selectedId === opt.id}
            feedback={feedback}
            onPress={() => handleTap(opt.id)}
          />
        ))}
      </View>
    </ClockwiseGameShell>
  );
}

const styles = StyleSheet.create({
  progressWrap: { marginBottom: 16 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: FUSION.glow,
  },
  progressCount: { fontSize: 14, fontWeight: '900', color: CW.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  phaseRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  phasePill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  phaseActive: {
    backgroundColor: 'rgba(234,179,8,0.22)',
    borderColor: FUSION.glow,
  },
  phaseDone: {
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderColor: CW.good,
  },
  phaseIdle: {
    backgroundColor: 'rgba(11,10,26,0.5)',
    borderColor: CW.glassBorder,
  },
  phaseTxt: { fontSize: 9, fontWeight: '900', color: CW.textMuted, letterSpacing: 0.6 },
  promptFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${FUSION.accent}55`,
    backgroundColor: 'rgba(11,10,26,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 16,
    overflow: 'hidden',
    alignItems: 'center',
  },
  promptGlow: { ...StyleSheet.absoluteFillObject },
  promptTag: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: FUSION.glow,
    marginBottom: 8,
  },
  prompt: {
    fontSize: 19,
    fontWeight: '800',
    color: CW.textLight,
    textAlign: 'center',
    marginBottom: 12,
  },
  starsFrame: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: `${FUSION.glow}55`,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  starsLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: FUSION.glow,
    marginBottom: 8,
  },
  starsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6 },
  star: { fontSize: 28 },
  tapLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: CW.textMuted,
    textAlign: 'center',
    marginBottom: 14,
  },
  choicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  orb: {
    width: 96,
    height: 112,
    borderRadius: 20,
    borderWidth: 2.5,
    backgroundColor: 'rgba(11,10,26,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orbHalo: { ...StyleSheet.absoluteFillObject },
  orbEmoji: { fontSize: 38 },
  orbNumber: { fontSize: 32, fontWeight: '900', color: CW.textLight },
  colorDot: { width: 34, height: 34, borderRadius: 17, marginBottom: 4 },
  orbLabel: { fontSize: 12, fontWeight: '800', color: CW.textMuted, marginTop: 4 },
  pressed: { opacity: 0.88 },
});
