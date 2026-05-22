import {
  VowelGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useVoiceGameSession,
  DEFAULT_VOICE_ROUNDS,
  type VowelSense,
} from '@/components/game/speech/level3/shared/vowelGameShared';
import {
  MOUTH_TARGETS,
  tickMouthAndSoundMatch,
  useSpeechHitCounter,
  createBurstDetector,
  type MouthTarget,
} from '@/components/game/speech/level3/shared/listenRepeatGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const TARGETS_PER_ROUND = 3;

export function MatchMyMouthGame({ onBack, onComplete }: Props) {
  const session = useVoiceGameSession('match-my-mouth', DEFAULT_VOICE_ROUNDS);
  const [targetIndex, setTargetIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [progress, setProgress] = useState(0);
  const target: MouthTarget =
    MOUTH_TARGETS[(session.round - 1 + targetIndex) % MOUTH_TARGETS.length];
  const speech = useSpeechHitCounter(true, target.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 550 }));
  const soundHoldRef = useRef<number | null>(null);
  const mouthHoldRef = useRef<number | null>(null);
  const senseRef = useRef<VowelSense | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    speakGame('Copy the mouth and the sound!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setTargetIndex(0);
    setDone(0);
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    burstRef.current.reset();
    soundHoldRef.current = null;
    mouthHoldRef.current = null;
    speech.resetHits();
    const t = MOUTH_TARGETS[(session.round - 1) % MOUTH_TARGETS.length];
    speakGame(`Match ${t.mouthEmoji} and say ${t.label}!`);
  }, [session.round]);

  useEffect(() => {
    speech.resetHits();
    burstRef.current.reset();
    soundHoldRef.current = null;
    mouthHoldRef.current = null;
  }, [targetIndex, target.label]);

  useEffect(() => {
    const tick = setInterval(() => {
      const sense = senseRef.current;
      if (!sense || session.gameFinished || roundDoneRef.current || lockRef.current) return;
      const { progress: p, matched } = tickMouthAndSoundMatch(
        target,
        sense,
        voiceRef.current,
        speech,
        burstRef.current,
        soundHoldRef,
        mouthHoldRef,
      );
      setProgress(p);
      if (!matched) return;
      lockRef.current = true;
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      speakGame('Great mouth match!');
      const nextDone = done + 1;
      setDone(nextDone);
      if (nextDone >= TARGETS_PER_ROUND) {
        roundDoneRef.current = true;
        setTimeout(() => session.completeRound(), 900);
      } else {
        const nextIdx = targetIndex + 1;
        setTargetIndex(nextIdx);
        const next = MOUTH_TARGETS[(session.round - 1 + nextIdx) % MOUTH_TARGETS.length];
        setTimeout(() => {
          speakGame(`Now ${next.mouthEmoji} — say ${next.label}!`);
          lockRef.current = false;
        }, 700);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session, target, done, targetIndex, speech.useSpeech]);

  return (
    <>
      <VowelGameFrame
        title="Match My Mouth"
        subtitle="Copy mouth shape + sound"
        skills="👄 Articulation • 😮 Mouth shape • 🗣️ Sound"
        gradient={['#FFEDD5', '#FED7AA']}
        accent="#EA580C"
        onBack={onBack}
        progress={done}
        progressTotal={TARGETS_PER_ROUND}
        roundLabel={`Mouth ${done}/${TARGETS_PER_ROUND} · Round ${session.round}/${session.rounds}`}
        showCamera={Platform.OS === 'web'}
      >
        {(sense) => {
          senseRef.current = sense;
          voiceRef.current = { level: sense.voiceLevel, active: sense.voiceActive };
          return (
            <View style={styles.center}>
              <Text style={styles.mouth}>{target.mouthEmoji}</Text>
              <Text style={styles.label}>{target.label}</Text>
              <Text style={styles.hint}>
                {Platform.OS === 'web' && sense.isDetecting
                  ? 'Match the mouth on camera + say it'
                  : 'Copy the mouth face and say the sound'}
              </Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
            </View>
          );
        }}
      </VowelGameFrame>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mouth: { fontSize: 96 },
  label: { fontSize: 40, fontWeight: '900', color: '#C2410C', marginTop: 8 },
  hint: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9A3412',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#F97316', borderRadius: 8 },
});
