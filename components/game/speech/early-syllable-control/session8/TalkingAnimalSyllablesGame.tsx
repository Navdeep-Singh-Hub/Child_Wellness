import {
  EarlySyllableControlOverlays,
  EarlySyllableControlShell,
  speakEarlySyllable,
  useEarlySyllableControlSession,
} from '@/components/game/speech/early-syllable-control/shared/earlySyllableControlShared';
import { ANIMAL_SYLLABLES } from '@/components/game/speech/early-syllable-control/session8/syllableAssets';
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

function AnimalPlay({
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
  const animal = useMemo(() => ANIMAL_SYLLABLES[hits % ANIMAL_SYLLABLES.length] ?? ANIMAL_SYLLABLES[0], [hits]);
  const { trySyllable, mouth, target } = useSyllableAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    animal.syllable,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#16A34A" />
      <Text style={styles.animalEmoji}>{animal.emoji}</Text>
      <Text style={styles.animalName}>{animal.animal} says…</Text>
      <View style={styles.bubble}>
        <Text style={styles.syllable}>{animal.syllable === 'moo' ? 'MOO' : animal.syllable === 'bee' ? 'BEE' : 'MA'}</Text>
      </View>
      <Pressable style={styles.btn} onPress={trySyllable}>
        <Text style={styles.btnText}>Copy animal! 🎉</Text>
      </Pressable>
      {sense.rewardState !== 'NONE' && <Text style={styles.dance}>Animal dance!</Text>}
    </View>
  );
}

export function TalkingAnimalSyllablesGame({ onBack, onComplete }: Props) {
  const session = useEarlySyllableControlSession('talking-animal-syllables', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakEarlySyllable('Talking animal syllables! MOO, BEE, MA — copy any way you like.');
  }, [canPlay, session.round]);

  return (
    <>
      <EarlySyllableControlShell
        gameId="talking-animal-syllables"
        title="Talking Animal Syllables"
        subtitle="Playful MOO, BEE, MA"
        skills="🦁 Animal play • 🗣️ Syllable exposure"
        gradient={['#ECFDF5', '#FEF9C3']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Watch the animal, try the syllable — no correctness needed!"
        startEmoji="🦁"
      >
        {(sense) => (
          <AnimalPlay
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
  animalEmoji: { fontSize: 88 },
  animalName: { fontSize: 18, fontWeight: '900', color: '#166534' },
  bubble: {
    marginTop: 12,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 3,
    borderColor: '#86EFAC',
  },
  syllable: { fontSize: 32, fontWeight: '900', color: '#15803D' },
  btn: {
    marginTop: 18,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#16A34A',
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  dance: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#15803D' },
});
