import {
  MotorSpeechTimingOverlays,
  MotorSpeechTimingShell,
  speakMotorSpeechTiming,
  useMotorSpeechTimingSession,
} from '@/components/game/speech/motor-speech-timing/shared/motorSpeechTimingShared';
import { CORE_RHYTHMS, RHYTHM_EMOJI } from '@/components/game/speech/motor-speech-timing/session6/rhythmBeatAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useRhythmBeatAttempt,
} from '@/components/game/speech/motor-speech-timing/session6/useRhythmBeatAttempt';
import type { MotorSpeechTimingSessionManager } from '@/components/game/speech/motor-speech-timing/modules/MotorSpeechTimingSessionManager';
import type { MotorSpeechTimingSense } from '@/hooks/useMotorSpeechTiming';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

function DrumPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  sense: MotorSpeechTimingSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: MotorSpeechTimingSessionManager;
  onRoundComplete: () => void;
}) {
  const item = useMemo(
    () => CORE_RHYTHMS[(hits + sense.timingAttempt) % CORE_RHYTHMS.length] ?? CORE_RHYTHMS[0],
    [hits, sense.timingAttempt],
  );
  const { tryRhythm, mouth, target } = useRhythmBeatAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    item.rhythm,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#C2410C" />
      <View style={styles.drumRow}>
        <Text style={[styles.drum, sense.rhythmPulse && styles.drumOn]}>🥁</Text>
        <Text style={styles.dots}>…</Text>
        <Text style={[styles.drum, !sense.rhythmPulse && styles.drumOn]}>🥁</Text>
      </View>
      <Text style={styles.label}>{item.label}</Text>
      <Text style={styles.emoji}>{RHYTHM_EMOJI[item.rhythm]}</Text>
      <Pressable style={styles.btn} onPress={tryRhythm}>
        <Text style={styles.btnText}>Rhythm try! 🎵</Text>
      </Pressable>
      {sense.rewardPulse && <Text style={styles.celebrate}>Drum celebration!</Text>}
    </View>
  );
}

export function TalkingDrumRhythmGame({ onBack, onComplete }: Props) {
  const session = useMotorSpeechTimingSession('talking-drum-rhythm', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMotorSpeechTiming('Talking drum rhythm! MA … MA, PA … PA — slow beats, any try counts.');
  }, [canPlay, session.round]);

  return (
    <>
      <MotorSpeechTimingShell
        gameId="talking-drum-rhythm"
        title="Talking Drum Rhythm"
        subtitle="Speech rhythm imitation"
        skills="🥁 Speech timing • 🎵 Rhythm readiness"
        gradient={['#FFF7ED', '#FCE7F3']}
        accent="#C2410C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Watch the slow beat, then tap — timing can be loose!"
        startEmoji="🥁"
      >
        {(sense) => (
          <DrumPlay
            sense={sense}
            active={canPlay && !session.gameFinished}
            hits={hits}
            setHits={setHits}
            manager={session.manager}
            onRoundComplete={session.completeRound}
          />
        )}
      </MotorSpeechTimingShell>
      <MotorSpeechTimingOverlays
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
  stage: { minHeight: 340, alignItems: 'center', justifyContent: 'center' },
  drumRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  drum: { fontSize: 52, opacity: 0.45 },
  drumOn: { opacity: 1, transform: [{ scale: 1.08 }] },
  dots: { fontSize: 28, fontWeight: '900', color: '#9A3412' },
  label: { fontSize: 26, fontWeight: '900', color: '#C2410C' },
  emoji: { fontSize: 48, marginVertical: 8 },
  btn: {
    marginTop: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#C2410C',
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
  celebrate: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#9A3412' },
});
