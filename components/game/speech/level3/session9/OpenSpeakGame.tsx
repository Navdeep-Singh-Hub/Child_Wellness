import {
  VowelGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useVoiceGameSession,
  DEFAULT_VOICE_ROUNDS,
  vowelMatch,
  type VowelSense,
} from '@/components/game/speech/level3/shared/vowelGameShared';
import {
  matchStep,
  useSpeechHitCounter,
  createBurstDetector,
  SEQ_MA,
} from '@/components/game/speech/level3/shared/twoPartVerbalGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Phase = 'open' | 'speak';

const OPEN_MS = 1000;
const SEQUENCES_PER_ROUND = 3;

export function OpenSpeakGame({ onBack, onComplete }: Props) {
  const session = useVoiceGameSession('open-speak', DEFAULT_VOICE_ROUNDS);
  const [phase, setPhase] = useState<Phase>('open');
  const [done, setDone] = useState(0);
  const [progress, setProgress] = useState(0);
  const speech = useSpeechHitCounter(phase === 'speak', SEQ_MA.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 550 }));
  const openHoldRef = useRef<number | null>(null);
  const soundHoldRef = useRef<number | null>(null);
  const senseRef = useRef<VowelSense | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    speakGame('Open your mouth, then say Ma!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setDone(0);
    setPhase('open');
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    openHoldRef.current = null;
    soundHoldRef.current = null;
    burstRef.current.reset();
    speech.resetHits();
    speakGame('First: open wide!');
  }, [session.round]);

  useEffect(() => {
    const tick = setInterval(() => {
      const sense = senseRef.current;
      if (!sense || session.gameFinished || roundDoneRef.current || lockRef.current) return;

      if (phase === 'open') {
        const useCamera = Platform.OS === 'web' && sense.isDetecting;
        if (useCamera) {
          const { progress: p, matched } = vowelMatch(sense, 'A', OPEN_MS, openHoldRef);
          setProgress(p);
          if (!matched) return;
        } else if (sense.voiceActive && sense.voiceLevel >= 0.22) {
          if (!openHoldRef.current) openHoldRef.current = Date.now();
          const held = Date.now() - openHoldRef.current;
          setProgress(Math.min(1, held / OPEN_MS));
          if (held < OPEN_MS) return;
        } else {
          openHoldRef.current = null;
          setProgress(0);
          return;
        }
        lockRef.current = true;
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
        speakGame('Now say Ma!');
        setPhase('speak');
        setProgress(0);
        openHoldRef.current = null;
        speech.resetHits();
        burstRef.current.reset();
        setTimeout(() => {
          lockRef.current = false;
        }, 400);
        return;
      }

      const { progress: p, matched } = matchStep(
        SEQ_MA,
        voiceRef.current,
        speech,
        burstRef.current,
        soundHoldRef,
      );
      setProgress(p);
      if (!matched) return;
      lockRef.current = true;
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      speakGame('Great sequence!');
      const next = done + 1;
      setDone(next);
      if (next >= SEQUENCES_PER_ROUND) {
        roundDoneRef.current = true;
        setTimeout(() => session.completeRound(), 900);
      } else {
        setPhase('open');
        setProgress(0);
        openHoldRef.current = null;
        soundHoldRef.current = null;
        burstRef.current.reset();
        speakGame('Open wide again!');
        setTimeout(() => {
          lockRef.current = false;
        }, 600);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, done, speech.useSpeech]);

  return (
    <>
      <VowelGameFrame
        title="Open + Speak"
        subtitle="Open mouth → say syllable"
        skills="😮 Sequencing • 👄 Open • 🗣️ Ma"
        gradient={['#FEF3C7', '#FDE68A']}
        accent="#D97706"
        onBack={onBack}
        progress={done}
        progressTotal={SEQUENCES_PER_ROUND}
        roundLabel={`Steps ${done}/${SEQUENCES_PER_ROUND} · Round ${session.round}/${session.rounds}`}
        showCamera={Platform.OS === 'web'}
      >
        {(sense) => {
          senseRef.current = sense;
          voiceRef.current = { level: sense.voiceLevel, active: sense.voiceActive };
          return (
            <View style={styles.center}>
              <Text style={styles.step}>{phase === 'open' ? '1️⃣ Open' : '2️⃣ Speak'}</Text>
              <Text style={styles.face}>{phase === 'open' ? '😮' : '👄'}</Text>
              <Text style={styles.label}>{phase === 'open' ? 'Ahh / Open' : 'Ma'}</Text>
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
  step: { fontSize: 22, fontWeight: '900', color: '#B45309' },
  face: { fontSize: 88, marginTop: 8 },
  label: { fontSize: 40, fontWeight: '900', color: '#92400E', marginTop: 8 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 8 },
});
