import {
  BilabialSequencingOverlays,
  BilabialSequencingShell,
  speakBilabialSequencing,
  useBilabialSequencingSession,
} from '@/components/game/speech/bilabial-sequencing/shared/bilabialSequencingShared';
import { CORE_REPEATS, REPEAT_EMOJI } from '@/components/game/speech/bilabial-sequencing/session5/bilabialRepeatAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useBilabialRepeatAttempt,
} from '@/components/game/speech/bilabial-sequencing/session5/useBilabialRepeatAttempt';
import type { BilabialSequencingSessionManager } from '@/components/game/speech/bilabial-sequencing/modules/BilabialSequencingSessionManager';
import type { BilabialSequencingSense } from '@/hooks/useBilabialSequencing';
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
  sense: BilabialSequencingSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: BilabialSequencingSessionManager;
  onRoundComplete: () => void;
}) {
  const item = useMemo(
    () => CORE_REPEATS[(hits + sense.repetitionAttempt) % CORE_REPEATS.length] ?? CORE_REPEATS[0],
    [hits, sense.repetitionAttempt],
  );
  const { tryRepeat, mouth, target } = useBilabialRepeatAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    item.repeat,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#DB2777" />
      <Text style={styles.drum}>🥁</Text>
      <View style={styles.card}>
        <Text style={styles.emoji}>{REPEAT_EMOJI[item.repeat]}</Text>
        <Text style={styles.label}>{item.label}</Text>
      </View>
      <Pressable style={styles.btn} onPress={tryRepeat}>
        <Text style={styles.btnText}>Beat again! 🎵</Text>
      </Pressable>
      {sense.rewardPulse && <Text style={styles.celebrate}>Drum celebration!</Text>}
    </View>
  );
}

export function MamaDrumBeatGame({ onBack, onComplete }: Props) {
  const session = useBilabialSequencingSession('mama-drum-beat', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakBilabialSequencing('Mama drum beat! MA MA, PA PA, BA BA — repeat any way you like.');
  }, [canPlay, session.round]);

  return (
    <>
      <BilabialSequencingShell
        gameId="mama-drum-beat"
        title="Mama Drum Beat"
        subtitle="Repeated speech rhythm"
        skills="🥁 Bilabial rhythm • 🗣️ Repetition readiness"
        gradient={['#FFF7ED', '#FCE7F3']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Watch the beat, tap again — every repeat counts!"
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
      </BilabialSequencingShell>
      <BilabialSequencingOverlays
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
  drum: { fontSize: 48, marginBottom: 6 },
  card: {
    width: '88%',
    maxWidth: 340,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 3,
    borderColor: 'rgba(219,39,119,0.35)',
    alignItems: 'center',
    paddingVertical: 22,
  },
  emoji: { fontSize: 72 },
  label: { marginTop: 10, fontSize: 28, fontWeight: '900', color: '#9D174D' },
  btn: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#DB2777',
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
  celebrate: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#BE185D' },
});
