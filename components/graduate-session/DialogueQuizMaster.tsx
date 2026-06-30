/**
 * Game 2 — Dialogue Quiz. Two rounds: (1) Friend: Hello! (2) Teacher: Please sit down.
 * Session 10: Graduate Master Challenge (finale).
 */
import { GraduateGameShell } from '@/components/graduate-session/shared/GraduateGameShell';
import { GR } from '@/components/graduate-session/shared/graduateTheme';
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

const ROUNDS = [
  {
    scene: 'GREETING SCENE',
    contextEmoji: '👋',
    contextText: 'You meet a friend',
    speakerRole: 'FRIEND',
    speakerLine: 'Hello!',
    youRole: 'YOU',
    options: ['Hello', 'Banana', 'Sleep'],
    correct: 'Hello',
    coach: 'When someone says Hello, say Hello back!',
  },
  {
    scene: 'CLASSROOM SCENE',
    contextEmoji: '🪑',
    contextText: 'Teacher gives an instruction',
    speakerRole: 'TEACHER',
    speakerLine: 'Please sit down.',
    youRole: 'STUDENT',
    options: ['Okay', 'Jump', 'Run'],
    correct: 'Okay',
    coach: 'When the teacher asks you to sit, a polite reply is Okay!',
  },
] as const;

const VOICE = 'Answer the conversation question. Choose the best reply.';

const PALETTE = { accent: '#4F46E5', glow: '#FCD34D', secondary: '#818CF8' } as const;

function ReplyChip({
  label,
  selected,
  feedback,
  onPress,
}: {
  label: string;
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
      scale.value = withSpring(1.04, { damping: 8 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [feedback, selected, shake, scale]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));

  const border =
    feedback === 'correct' && selected
      ? GR.good
      : feedback === 'wrong' && selected
        ? GR.warn
        : selected
          ? PALETTE.glow
          : GR.glassBorder;

  return (
    <Animated.View style={[styles.chipWrap, anim]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.chip, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={label}
      >
        <Text style={styles.chipText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function DialogueQuizMaster({ onComplete }: { onComplete: () => void }) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [lock, setLock] = useState(false);

  const round = ROUNDS[roundIndex];
  const progressPct = (roundIndex / ROUNDS.length) * 100;

  const playVoice = useCallback(() => {
    speak(VOICE, 0.75).catch(() => {});
  }, []);

  useEffect(() => {
    playVoice();
  }, [playVoice]);

  const handleChoice = useCallback(
    (reply: string) => {
      if (lock || feedback === 'correct') return;
      setSelected(reply);

      if (reply !== round.correct) {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        speak('Try again.', 0.65);
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
        return;
      }

      setFeedback('correct');
      setLock(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speak(`Correct! ${round.correct}!`, 0.7);

      if (roundIndex >= ROUNDS.length - 1) {
        setShowSuccess(true);
        setTimeout(() => onComplete(), 2200);
      } else {
        setTimeout(() => {
          setRoundIndex((i) => i + 1);
          setSelected(null);
          setFeedback('idle');
          setLock(false);
        }, 900);
      }
    },
    [lock, feedback, round, roundIndex, onComplete],
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="indigo"
        title="Great Job!"
        subtitle="You answered both!"
        badgeEmoji="💬"
      />
    );
  }

  return (
    <GraduateGameShell
      studio="DIALOGUE QUIZ · FINALE GAME 2"
      title="Answer the conversation"
      instruction="Choose the best reply."
      mascot="💬"
      coachLine={`${round.coach} (Round ${roundIndex + 1} of ${ROUNDS.length})`}
      onReplayVoice={playVoice}
    >
      <View style={styles.progressWrap}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>DIALOGUE ROUNDS</Text>
          <Text style={styles.progressCount}>
            {roundIndex + 1} / {ROUNDS.length}
          </Text>
        </View>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[PALETTE.accent, PALETTE.glow]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPct}%` }]}
          />
        </View>
        <View style={styles.phaseStrip}>
          {ROUNDS.map((r, i) => (
            <View
              key={r.scene}
              style={[
                styles.phasePill,
                i === roundIndex && styles.phasePillActive,
                i < roundIndex && styles.phasePillDone,
              ]}
            >
              <Text
                style={[
                  styles.phaseText,
                  (i === roundIndex || i < roundIndex) && styles.phaseTextActive,
                ]}
              >
                {i + 1}. {i === 0 ? 'Greeting' : 'Classroom'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.dialogueFrame}>
        <LinearGradient
          colors={[`${PALETTE.accent}33`, 'transparent', `${PALETTE.secondary}22`]}
          style={styles.dialogueGlow}
        />
        <Text style={styles.frameLabel}>{round.scene}</Text>

        <View style={styles.contextRow}>
          <Text style={styles.contextEmoji}>{round.contextEmoji}</Text>
          <Text style={styles.contextText}>{round.contextText}</Text>
        </View>

        <View style={styles.bubbleRow}>
          <View style={[styles.bubble, styles.speakerBubble]}>
            <Text style={styles.roleLabel}>{round.speakerRole}</Text>
            <Text style={styles.bubbleText}>{round.speakerLine}</Text>
          </View>
        </View>

        <View style={[styles.bubbleRow, styles.youRow]}>
          <View style={[styles.bubble, styles.youBubble]}>
            <Text style={styles.roleLabel}>{round.youRole}</Text>
            <Text style={[styles.bubbleText, styles.blankLine]}>______</Text>
          </View>
        </View>

        <Text style={styles.prompt}>What should you say?</Text>

        <View style={styles.optionsColumn}>
          {round.options.map((opt) => (
            <ReplyChip
              key={opt}
              label={opt}
              selected={selected === opt}
              feedback={feedback}
              onPress={() => handleChoice(opt)}
            />
          ))}
        </View>
      </View>
    </GraduateGameShell>
  );
}

const styles = StyleSheet.create({
  progressWrap: { marginBottom: 14 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: PALETTE.glow },
  progressCount: { fontSize: 14, fontWeight: '900', color: GR.textLight },
  progressBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: { height: '100%', borderRadius: 5 },
  phaseStrip: { flexDirection: 'row', gap: 8 },
  phasePill: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: GR.glassBorder,
    backgroundColor: 'rgba(15,10,30,0.45)',
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  phasePillActive: {
    borderColor: PALETTE.glow,
    backgroundColor: 'rgba(79,70,229,0.2)',
  },
  phasePillDone: {
    borderColor: GR.good,
    backgroundColor: 'rgba(52,211,153,0.12)',
  },
  phaseText: { fontSize: 10, fontWeight: '800', color: GR.textMuted, textAlign: 'center' },
  phaseTextActive: { color: PALETTE.glow },
  dialogueFrame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: `${PALETTE.accent}55`,
    backgroundColor: 'rgba(15,10,30,0.5)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  dialogueGlow: { ...StyleSheet.absoluteFillObject },
  frameLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: PALETTE.glow,
    marginBottom: 12,
    textAlign: 'center',
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${PALETTE.accent}44`,
    backgroundColor: 'rgba(79,70,229,0.15)',
  },
  contextEmoji: { fontSize: 22 },
  contextText: { fontSize: 14, fontWeight: '700', color: GR.textLight },
  bubbleRow: { marginBottom: 10 },
  youRow: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '88%',
    borderRadius: 18,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  speakerBubble: {
    alignSelf: 'flex-start',
    borderColor: `${PALETTE.accent}88`,
    backgroundColor: 'rgba(79,70,229,0.22)',
  },
  youBubble: {
    alignSelf: 'flex-end',
    borderColor: `${PALETTE.secondary}88`,
    backgroundColor: 'rgba(129,140,248,0.2)',
  },
  roleLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: PALETTE.glow,
    marginBottom: 4,
  },
  bubbleText: { fontSize: 18, fontWeight: '800', color: GR.textLight, lineHeight: 24 },
  blankLine: { color: PALETTE.glow, letterSpacing: 2 },
  prompt: {
    fontSize: 17,
    fontWeight: '800',
    color: GR.textLight,
    marginTop: 8,
    marginBottom: 14,
    textAlign: 'center',
  },
  optionsColumn: { width: '100%', gap: 10 },
  chipWrap: { width: '100%' },
  chip: {
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(11,10,26,0.7)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  chipText: { fontSize: 17, fontWeight: '800', color: GR.textLight, textAlign: 'center' },
  pressed: { opacity: 0.88 },
});
