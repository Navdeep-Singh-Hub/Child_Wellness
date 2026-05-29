import {
  CVPreparationOverlays,
  CVPreparationShell,
  speakCVPreparation,
  useCVPreparationSession,
} from '@/components/game/speech/cv-preparation/shared/cvPreparationShared';
import { PATTERN_SHORT, TRAIN_SEQUENCES } from '@/components/game/speech/cv-preparation/session4/cvPatternAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useCVPatternAttempt,
} from '@/components/game/speech/cv-preparation/session4/useCVPatternAttempt';
import type { CVPreparationSessionManager } from '@/components/game/speech/cv-preparation/modules/CVPreparationSessionManager';
import type { CVPreparationSense } from '@/hooks/useCVPreparation';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

function TrainPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  sense: CVPreparationSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: CVPreparationSessionManager;
  onRoundComplete: () => void;
}) {
  const seq = useMemo(() => TRAIN_SEQUENCES[hits % TRAIN_SEQUENCES.length] ?? TRAIN_SEQUENCES[0], [hits]);
  const { tryPattern, mouth, target } = useCVPatternAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    seq.to,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#D97706" />
      <Text style={styles.train}>🚂</Text>
      <View style={styles.track}>
        <View style={styles.car}>
          <Text style={styles.carText}>{PATTERN_SHORT[seq.from]}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
        <View style={[styles.car, styles.carOn]}>
          <Text style={styles.carText}>{PATTERN_SHORT[seq.to]}</Text>
        </View>
      </View>
      <Text style={styles.seqLabel}>{seq.label}</Text>
      <Pressable style={styles.btn} onPress={tryPattern}>
        <Text style={styles.btnText}>Choo-choo try! 🎈</Text>
      </Pressable>
      {sense.rewardPulse && <Text style={styles.celebrate}>Train celebration!</Text>}
    </View>
  );
}

export function SpeechPatternTrainGame({ onBack, onComplete }: Props) {
  const session = useCVPreparationSession('speech-pattern-train', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakCVPreparation('Speech pattern train! MA to MA, PA to PA — repeat any way you like.');
  }, [canPlay, session.round]);

  return (
    <>
      <CVPreparationShell
        gameId="speech-pattern-train"
        title="Speech Pattern Train"
        subtitle="Repeat simple patterns"
        skills="🚂 Sequencing • 🗣️ CV readiness"
        gradient={['#FFF7ED', '#FEF3C7']}
        accent="#D97706"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Watch the train pattern, then try!"
        startEmoji="🚂"
      >
        {(sense) => (
          <TrainPlay
            sense={sense}
            active={canPlay && !session.gameFinished}
            hits={hits}
            setHits={setHits}
            manager={session.manager}
            onRoundComplete={session.completeRound}
          />
        )}
      </CVPreparationShell>
      <CVPreparationOverlays
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
  train: { fontSize: 56, marginBottom: 8 },
  track: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  car: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  carOn: { borderColor: '#D97706', backgroundColor: '#FFFBEB' },
  carText: { fontSize: 22, fontWeight: '900', color: '#92400E' },
  arrow: { fontSize: 28, fontWeight: '900', color: '#B45309' },
  seqLabel: { marginTop: 12, fontSize: 16, fontWeight: '800', color: '#78350F' },
  btn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#D97706',
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#B45309' },
});
