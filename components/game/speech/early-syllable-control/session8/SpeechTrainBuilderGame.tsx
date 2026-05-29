import {
  EarlySyllableControlOverlays,
  EarlySyllableControlShell,
  speakEarlySyllable,
  useEarlySyllableControlSession,
} from '@/components/game/speech/early-syllable-control/shared/earlySyllableControlShared';
import { CORE_SYLLABLES } from '@/components/game/speech/early-syllable-control/session8/syllableAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useSyllableAttempt,
} from '@/components/game/speech/early-syllable-control/session8/useSyllableAttempt';
import type { EarlySyllableControlSessionManager } from '@/components/game/speech/early-syllable-control/modules/EarlySyllableControlSessionManager';
import type { EarlySyllableControlSense } from '@/hooks/useEarlySyllableControl';
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
  sense: EarlySyllableControlSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: EarlySyllableControlSessionManager;
  onRoundComplete: () => void;
}) {
  const item = useMemo(() => CORE_SYLLABLES[hits % CORE_SYLLABLES.length] ?? CORE_SYLLABLES[0], [hits]);
  const { trySyllable, mouth, target } = useSyllableAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    item.syllable,
  );
  const offset = Math.min(hits * 34, 150);

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#CA8A04" />
      <Text style={styles.train}>🚂</Text>
      <View style={styles.track}>
        <View style={[styles.car, { marginLeft: offset }]}>
          <Text style={styles.carText}>{item.label}</Text>
        </View>
      </View>
      <Text style={styles.hint}>Each syllable try builds the train!</Text>
      <Pressable style={styles.btn} onPress={trySyllable}>
        <Text style={styles.btnText}>Choo-choo! 🎉</Text>
      </Pressable>
      {sense.rewardPulse && <Text style={styles.party}>Train party!</Text>}
    </View>
  );
}

export function SpeechTrainBuilderGame({ onBack, onComplete }: Props) {
  const session = useEarlySyllableControlSession('speech-train-builder', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakEarlySyllable('Speech train builder! Each try moves the train — mouth or voice counts.');
  }, [canPlay, session.round]);

  return (
    <>
      <EarlySyllableControlShell
        gameId="speech-train-builder"
        title="Speech Train Builder"
        subtitle="Repeated speech chunks"
        skills="🚂 Vocal play • 🗣️ Syllable chunks"
        gradient={['#FFFBEB', '#FEF3C7']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Try a syllable — the train chugs forward!"
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
      </EarlySyllableControlShell>
      <EarlySyllableControlOverlays
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
  train: { fontSize: 52 },
  track: {
    width: '90%',
    maxWidth: 320,
    height: 56,
    marginVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 2,
    borderColor: '#FDE047',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  car: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FEF9C3',
    borderWidth: 2,
    borderColor: '#CA8A04',
    alignSelf: 'flex-start',
  },
  carText: { fontSize: 20, fontWeight: '900', color: '#854D0E' },
  hint: { fontSize: 14, fontWeight: '700', color: '#78350F' },
  btn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#CA8A04',
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  party: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#A16207' },
});
