import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useTwoPartSession,
  DEFAULT_VOICE_ROUNDS,
  matchStep,
  useSpeechHitCounter,
  createBurstDetector,
  TAP_TARGETS,
  type TapTarget,
} from '@/components/game/speech/level3/shared/twoPartVerbalGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Phase = 'say' | 'tap';

const TRIALS_PER_ROUND = 3;

function pickChoices(target: TapTarget, all: TapTarget[]): TapTarget[] {
  const others = all.filter((t) => t.id !== target.id);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  const picks = [target, shuffled[0], shuffled[1]].filter(Boolean) as TapTarget[];
  return picks.sort(() => Math.random() - 0.5);
}

export function SayThenTapGame({ onBack, onComplete }: Props) {
  const session = useTwoPartSession('say-then-tap', DEFAULT_VOICE_ROUNDS);
  const [trial, setTrial] = useState(0);
  const [phase, setPhase] = useState<Phase>('say');
  const [progress, setProgress] = useState(0);
  const target = TAP_TARGETS[(session.round - 1 + trial) % TAP_TARGETS.length];
  const choices = useMemo(
    () => pickChoices(target, TAP_TARGETS),
    [target.id, trial, session.round],
  );
  const speech = useSpeechHitCounter(phase === 'say', target.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 500 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    speakGame('Say the word, then tap the picture!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setTrial(0);
    setPhase('say');
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    const t = TAP_TARGETS[(session.round - 1) % TAP_TARGETS.length];
    speakGame(`Say ${t.label}, then tap it!`);
  }, [session.round]);

  useEffect(() => {
    if (phase !== 'say' || session.gameFinished || roundDoneRef.current || lockRef.current) return;
    const tick = setInterval(() => {
      const { progress: p, matched } = matchStep(
        target,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
      );
      setProgress(p);
      if (!matched) return;
      lockRef.current = true;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      speakGame('Now tap it!');
      setPhase('tap');
      setProgress(0);
      setTimeout(() => {
        lockRef.current = false;
      }, 400);
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, target, speech.useSpeech]);

  const onTap = (t: TapTarget) => {
    if (phase !== 'tap' || lockRef.current || roundDoneRef.current) return;
    lockRef.current = true;
    if (t.id !== target.id) {
      speakGame(`Say ${target.label} and tap ${target.emoji}!`);
      setTimeout(() => {
        lockRef.current = false;
      }, 600);
      return;
    }
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    speakGame('Perfect!');
    const next = trial + 1;
    setTrial(next);
    if (next >= TRIALS_PER_ROUND) {
      roundDoneRef.current = true;
      setTimeout(() => session.completeRound(), 800);
    } else {
      const nextTarget = TAP_TARGETS[(session.round - 1 + next) % TAP_TARGETS.length];
      setPhase('say');
      speech.resetHits();
      burstRef.current.reset();
      holdRef.current = null;
      speakGame(`Say ${nextTarget.label}, then tap!`);
      setTimeout(() => {
        lockRef.current = false;
      }, 500);
    }
  };

  return (
    <>
      <VoiceGameFrame
        title="Say Then Tap"
        subtitle="Say the word, then tap it"
        skills="🗣️ + 👆 Dual-task • 🔤 Word • 🎯 Tap"
        gradient={['#E0E7FF', '#C7D2FE']}
        accent="#4F46E5"
        onBack={onBack}
        progress={trial}
        progressTotal={TRIALS_PER_ROUND}
        roundLabel={`Trials ${trial}/${TRIALS_PER_ROUND} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.phase}>{phase === 'say' ? '🗣️ Say' : '👆 Tap'}</Text>
              <Text style={styles.word}>{target.label}</Text>
              {phase === 'say' ? (
                <View style={styles.bar}>
                  <View style={[styles.fill, { width: `${progress * 100}%` }]} />
                </View>
              ) : (
                <View style={styles.grid}>
                  {choices.map((c) => (
                    <Pressable
                      key={c.id}
                      style={({ pressed }) => [
                        styles.choice,
                        c.id === target.id && styles.choiceTarget,
                        pressed && styles.choicePressed,
                      ]}
                      onPress={() => onTap(c)}
                    >
                      <Text style={styles.choiceEmoji}>{c.emoji}</Text>
                      <Text style={styles.choiceLabel}>{c.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          );
        }}
      </VoiceGameFrame>
      <VoiceGameOverlays
        showRoundSuccess={session.showRoundSuccess}
        gameFinished={session.gameFinished}
        finalStats={session.finalStats}
        onBack={onBack}
        onComplete={onComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  phase: { fontSize: 22, fontWeight: '900', color: '#4338CA' },
  word: { fontSize: 40, fontWeight: '900', color: '#312E81', marginTop: 8 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 24,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#6366F1', borderRadius: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 20 },
  choice: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 3,
    borderColor: 'transparent',
    minWidth: 96,
  },
  choiceTarget: { borderColor: 'rgba(99,102,241,0.35)' },
  choicePressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
  choiceEmoji: { fontSize: 48 },
  choiceLabel: { fontSize: 14, fontWeight: '800', color: '#3730A3', marginTop: 4 },
});
