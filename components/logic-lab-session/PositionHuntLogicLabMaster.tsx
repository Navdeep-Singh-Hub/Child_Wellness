/**
 * Game 1 — Position Hunt: find ball IN box, cup ON table, cat UNDER chair.
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

const ITEMS = [
  { id: 'ball', label: 'Ball', emoji: '⚽' },
  { id: 'cup', label: 'Cup', emoji: '☕' },
  { id: 'cat', label: 'Cat', emoji: '🐱' },
] as const;

type ItemId = (typeof ITEMS)[number]['id'];

const TASKS: {
  id: string;
  prompt: string;
  prep: string;
  correctId: ItemId;
  voice: string;
  coach: string;
  accent: string;
  scene: 'inBox' | 'onTable' | 'underChair';
}[] = [
  {
    id: 'in-box',
    prompt: 'Find what is IN the box',
    prep: 'IN',
    correctId: 'ball',
    voice: 'Tap the object that is IN the box.',
    coach: 'Which object sits inside the box?',
    accent: '#818CF8',
    scene: 'inBox',
  },
  {
    id: 'on-table',
    prompt: 'Find what is ON the table',
    prep: 'ON',
    correctId: 'cup',
    voice: 'Tap the object that is ON the table.',
    coach: 'Which object rests on top of the table?',
    accent: '#38BDF8',
    scene: 'onTable',
  },
  {
    id: 'under-chair',
    prompt: 'Find what is UNDER the chair',
    prep: 'UNDER',
    correctId: 'cat',
    voice: 'Tap the object that is UNDER the chair.',
    coach: 'Which object hides below the chair?',
    accent: '#A78BFA',
    scene: 'underChair',
  },
];

const VOICE_INTRO = 'Hunt for the right object. Find what is IN, ON, and UNDER.';

const CROWN = { gold: '#FBBF24', glow: '#FEF3C7', violet: '#7C3AED', amber: '#F59E0B', deep: '#1E1B4B' } as const;

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
      <Text style={bar.label}>Hunt {done + 1} of {total}</Text>
    </View>
  );
}

function HuntScene({ scene, prep, accent }: { scene: 'inBox' | 'onTable' | 'underChair'; prep: string; accent: string }) {
  return (
    <View style={[hunt.wrap, { borderColor: `${accent}55` }]}>
      <Text style={[hunt.label, { color: accent }]}>{prep} ZONE</Text>
      <LinearGradient colors={[`${accent}33`, 'transparent']} style={hunt.sky} />
      {scene === 'inBox' && (
        <View style={hunt.stage}>
          <View style={[hunt.box, { borderColor: accent }]}>
            <Text style={hunt.zoneEmoji}>?</Text>
          </View>
          <Text style={hunt.anchor}>📦</Text>
        </View>
      )}
      {scene === 'onTable' && (
        <View style={hunt.stage}>
          <Text style={hunt.floatingQ}>?</Text>
          <Text style={hunt.tableEmoji}>🪵</Text>
        </View>
      )}
      {scene === 'underChair' && (
        <View style={hunt.stage}>
          <Text style={hunt.chairEmoji}>🪑</Text>
          <View style={[hunt.underSlot, { borderColor: `${accent}66` }]}>
            <Text style={hunt.zoneEmoji}>?</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function ObjectCard({
  item,
  selected,
  feedback,
  onPress,
}: {
  item: (typeof ITEMS)[number];
  selected: boolean;
  feedback: 'idle' | 'wrong' | 'correct';
  onPress: () => void;
}) {
  const shake = useSharedValue(0);
  const scale = useSharedValue(1);

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
          ? CROWN.glow
          : LL.glassBorder;

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, { borderColor: border }, pressed && styles.pressed]}
        accessibilityLabel={item.label}
      >
        <LinearGradient colors={[`${CROWN.violet}22`, 'rgba(15,23,42,0.55)']} style={styles.cardGrad} />
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        <Text style={styles.cardLabel}>{item.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function PositionHuntLogicLabMaster({ onComplete }: { onComplete: () => void }) {
  const [taskIndex, setTaskIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selected, setSelected] = useState<ItemId | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');

  const task = TASKS[taskIndex];
  const isLast = taskIndex === TASKS.length - 1;

  const playVoice = useCallback(() => {
    speak(taskIndex === 0 ? VOICE_INTRO : task.voice, 0.75).catch(() => {});
  }, [taskIndex, task.voice]);

  useEffect(() => {
    speak(task.voice, 0.75).catch(() => {});
  }, [taskIndex, task.voice]);

  const handleTap = useCallback(
    (id: ItemId) => {
      if (feedback === 'correct') return;
      setSelected(id);

      if (id !== task.correctId) {
        setFeedback('wrong');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        const where =
          id === 'ball'
            ? 'The ball is IN the box'
            : id === 'cup'
              ? 'The cup is ON the table'
              : 'The cat is UNDER the chair';
        speak(`Not for this hunt. ${where}. Find ${task.prep}!`);
        setTimeout(() => {
          setFeedback('idle');
          setSelected(null);
        }, 900);
        return;
      }

      setFeedback('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speak(`Correct! The ${ITEMS.find((i) => i.id === id)!.label} is ${task.prep}!`);

      setTimeout(() => {
        if (isLast) {
          setShowSuccess(true);
          setTimeout(() => onComplete(), 2400);
        } else {
          setTaskIndex((i) => i + 1);
          setFeedback('idle');
          setSelected(null);
        }
      }, 800);
    },
    [feedback, task, isLast, onComplete],
  );

  if (showSuccess) {
    return (
      <SuccessCelebration
        variant="sunset"
        title="Position Hunt!"
        subtitle="IN, ON, UNDER — you found them all!"
        badgeEmoji="📍"
      />
    );
  }

  return (
    <LogicLabGameShell
      studio="POSITION HUNT · GAME 1"
      title="Find the correct position"
      instruction="Tap the object that matches each position hunt."
      mascot="📍"
      coachLine={task.coach}
      onReplayVoice={playVoice}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeTxt}>SESSION 10 · LOGIC LAB MASTER</Text>
      </View>

      <ProgressBar done={taskIndex} total={TASKS.length} />

      <View style={styles.layout}>
        <HuntScene scene={task.scene} prep={task.prep} accent={task.accent} />
        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>HUNT CLUE</Text>
          <Text style={styles.prompt}>{task.prompt}</Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        {ITEMS.map((item) => (
          <ObjectCard
            key={item.id}
            item={item}
            selected={selected === item.id}
            feedback={feedback}
            onPress={() => handleTap(item.id)}
          />
        ))}
      </View>
    </LogicLabGameShell>
  );
}

const bar = StyleSheet.create({
  wrap: { marginBottom: 12, gap: 5 },
  track: { height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.35)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  label: { fontSize: 12, fontWeight: '800', color: CROWN.glow, textAlign: 'center' },
});

const hunt = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'rgba(30,27,75,0.55)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  label: { fontSize: 8, fontWeight: '900', letterSpacing: 1.2, marginBottom: 8 },
  sky: { ...StyleSheet.absoluteFillObject },
  stage: { alignItems: 'center', justifyContent: 'center', minHeight: 90 },
  box: {
    width: 64,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(129,140,248,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  zoneEmoji: { fontSize: 22, fontWeight: '900', color: LL.textMuted },
  anchor: { fontSize: 20 },
  floatingQ: { fontSize: 28, marginBottom: 4 },
  tableEmoji: { fontSize: 32 },
  chairEmoji: { fontSize: 32 },
  underSlot: {
    width: 56,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
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
  layout: { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'stretch' },
  promptCard: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${CROWN.gold}55`,
    backgroundColor: 'rgba(15,23,42,0.55)',
    padding: 14,
  },
  promptLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1.2, color: CROWN.amber, marginBottom: 8 },
  prompt: { fontSize: 17, fontWeight: '800', color: LL.textLight, lineHeight: 24 },
  cardsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  card: {
    width: 108,
    borderRadius: 18,
    borderWidth: 2.5,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  cardGrad: { ...StyleSheet.absoluteFillObject },
  cardEmoji: { fontSize: 36 },
  cardLabel: { fontSize: 13, fontWeight: '900', color: LL.textLight, marginTop: 6 },
  pressed: { opacity: 0.88 },
});
