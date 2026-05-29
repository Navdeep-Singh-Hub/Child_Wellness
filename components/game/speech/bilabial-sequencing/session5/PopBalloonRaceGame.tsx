import {
  BilabialSequencingOverlays,
  BilabialSequencingShell,
  speakBilabialSequencing,
  useBilabialSequencingSession,
} from '@/components/game/speech/bilabial-sequencing/shared/bilabialSequencingShared';
import { CORE_REPEATS } from '@/components/game/speech/bilabial-sequencing/session5/bilabialRepeatAssets';
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

const BALLOONS = ['🎈', '🎈', '🎈'] as const;

function BalloonPlay({
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
  const item = useMemo(() => CORE_REPEATS[hits % CORE_REPEATS.length] ?? CORE_REPEATS[0], [hits]);
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
      <Level6StatusPill sense={mouth} target={target} accent="#E11D48" />
      <View style={styles.row}>
        {BALLOONS.map((b, i) => (
          <Text key={i} style={[styles.balloon, i < hits && styles.popped]}>
            {i < hits ? '✨' : b}
          </Text>
        ))}
      </View>
      <Text style={styles.pattern}>{item.label}</Text>
      <Text style={styles.hint}>Pop pop — mouth or sound tries!</Text>
      <Pressable style={styles.btn} onPress={tryRepeat}>
        <Text style={styles.btnText}>Pop try! 🎈</Text>
      </Pressable>
      {hits >= 2 && sense.rewardPulse && <Text style={styles.celebrate}>Balloon party!</Text>}
    </View>
  );
}

export function PopBalloonRaceGame({ onBack, onComplete }: Props) {
  const session = useBilabialSequencingSession('pop-balloon-race', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakBilabialSequencing('Pop pop balloon race! Each try pops a balloon — mouth movement counts too.');
  }, [canPlay, session.round]);

  return (
    <>
      <BilabialSequencingShell
        gameId="pop-balloon-race"
        title="Pop Pop Balloon Race"
        subtitle="Repeated mouth-sound tries"
        skills="🎈 Repetition play • 🗣️ Vocal tries"
        gradient={['#FEF2F2', '#FFF7ED']}
        accent="#E11D48"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Each try pops a balloon — any repeat counts!"
        startEmoji="🎈"
        progressLabel="pops"
      >
        {(sense) => (
          <BalloonPlay
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
  stage: { minHeight: 340, alignItems: 'center', padding: 10 },
  row: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  balloon: { fontSize: 56 },
  popped: { fontSize: 40 },
  pattern: { fontSize: 26, fontWeight: '900', color: '#BE123C' },
  hint: { fontSize: 14, fontWeight: '700', color: '#64748B', marginTop: 6 },
  btn: {
    marginTop: 16,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#E11D48',
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#BE123C' },
});
