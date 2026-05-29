import {
  MotorSpeechTimingOverlays,
  MotorSpeechTimingShell,
  speakMotorSpeechTiming,
  useMotorSpeechTimingSession,
} from '@/components/game/speech/motor-speech-timing/shared/motorSpeechTimingShared';
import { CORE_RHYTHMS } from '@/components/game/speech/motor-speech-timing/session6/rhythmBeatAssets';
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

function MetronomePlay({
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
  const item = useMemo(() => CORE_RHYTHMS[hits % CORE_RHYTHMS.length] ?? CORE_RHYTHMS[0], [hits]);
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
      <Level6StatusPill sense={mouth} target={target} accent="#A855F7" />
      <Text style={styles.wand}>✨</Text>
      <View style={[styles.metronome, sense.rhythmPulse && styles.metronomeOn]}>
        <Text style={styles.mouth}>👄</Text>
        <View style={[styles.tick, sense.rhythmPulse && styles.tickOn]} />
      </View>
      <Text style={styles.label}>{item.label}</Text>
      <Text style={styles.hint}>Mouth or voice on the beat!</Text>
      <Pressable style={styles.btn} onPress={tryRhythm}>
        <Text style={styles.btnText}>Metronome try! ⭐</Text>
      </Pressable>
      {sense.rewardPulse && <Text style={styles.stars}>Magic stars!</Text>}
    </View>
  );
}

export function MagicMouthMetronomeGame({ onBack, onComplete }: Props) {
  const session = useMotorSpeechTimingSession('magic-mouth-metronome', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMotorSpeechTiming('Magic mouth metronome! Slow beat — move your mouth or make a sound.');
  }, [canPlay, session.round]);

  return (
    <>
      <MotorSpeechTimingShell
        gameId="magic-mouth-metronome"
        title="Magic Mouth Metronome"
        subtitle="Timing awareness"
        skills="✨ Timing • 👄 Mouth rhythm"
        gradient={['#FDF4FF', '#E0E7FF']}
        accent="#A855F7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Watch the slow tick, then try — any timing counts!"
        startEmoji="✨"
      >
        {(sense) => (
          <MetronomePlay
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
  stage: { minHeight: 340, alignItems: 'center', padding: 10 },
  wand: { fontSize: 40 },
  metronome: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 3,
    borderColor: 'rgba(168,85,247,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  metronomeOn: { borderColor: '#A855F7', backgroundColor: '#FAF5FF' },
  mouth: { fontSize: 56 },
  tick: {
    position: 'absolute',
    top: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(168,85,247,0.3)',
  },
  tickOn: { backgroundColor: '#A855F7' },
  label: { fontSize: 24, fontWeight: '900', color: '#6B21A8' },
  hint: { fontSize: 14, fontWeight: '700', color: '#64748B', marginTop: 4 },
  btn: {
    marginTop: 14,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#A855F7',
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  stars: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#7C3AED' },
});
