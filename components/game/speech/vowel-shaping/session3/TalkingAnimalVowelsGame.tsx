import {
  VowelShapingOverlays,
  VowelShapingShell,
  speakVowelShaping,
  useVowelShapingSession,
} from '@/components/game/speech/vowel-shaping/shared/vowelShapingShared';
import { ANIMAL_VOWELS, VOWEL_EMOJI } from '@/components/game/speech/vowel-shaping/session3/vowelShapeAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useVowelShapeAttempt,
} from '@/components/game/speech/vowel-shaping/session3/useVowelShapeAttempt';
import type { VowelShapingSessionManager } from '@/components/game/speech/vowel-shaping/modules/VowelShapingSessionManager';
import type { VowelShapingSense } from '@/hooks/useVowelShaping';
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
  round,
}: {
  sense: VowelShapingSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: VowelShapingSessionManager;
  onRoundComplete: () => void;
  round: number;
}) {
  const [dance, setDance] = useState(false);
  const animal = useMemo(
    () => ANIMAL_VOWELS[(hits + round) % ANIMAL_VOWELS.length] ?? ANIMAL_VOWELS[0],
    [hits, round],
  );
  const { tryShape, mouth, target } = useVowelShapeAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    () => {
      setDance(true);
      setTimeout(() => setDance(false), 900);
      onRoundComplete();
    },
    animal.shape,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#16A34A" />
      <Text style={[styles.animal, dance && styles.animalDance]}>
        {animal.emoji}
      </Text>
      <Text style={styles.mouth}>{VOWEL_EMOJI[animal.shape]}</Text>
      <Text style={styles.say}>
        {animal.animal} says {animal.shape.toUpperCase()}
      </Text>
      <Pressable style={styles.btn} onPress={tryShape}>
        <Text style={styles.btnText}>Copy the animal! 🎵</Text>
      </Pressable>
    </View>
  );
}

export function TalkingAnimalVowelsGame({ onBack, onComplete }: Props) {
  const session = useVowelShapingSession('talking-animal-vowels', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakVowelShaping('Animals show OOO, EEE, and AAA. Copy with your mouth — no wrong answers!');
  }, [canPlay, session.round]);

  return (
    <>
      <VowelShapingShell
        gameId="talking-animal-vowels"
        title="Talking Animal Vowels"
        subtitle="Playful animal mouth shapes"
        skills="🐑 Animal vowels • 😮 Shape play"
        gradient={['#DCFCE7', '#FEF9C3']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${ANIMAL_VOWELS[0]?.animal ?? 'Friend'} shows a vowel shape — copy when ready`}
      >
        {(sense) => (
          <AnimalPlay
            sense={sense}
            active={canPlay && !session.gameFinished}
            hits={hits}
            setHits={setHits}
            manager={session.manager}
            onRoundComplete={session.completeRound}
            round={session.round}
          />
        )}
      </VowelShapingShell>
      <VowelShapingOverlays
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
  animal: { fontSize: 88 },
  animalDance: { transform: [{ rotate: '6deg' }, { scale: 1.06 }] },
  mouth: { fontSize: 64, marginVertical: 6 },
  say: { fontSize: 18, fontWeight: '900', color: '#14532D', marginBottom: 12 },
  btn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, backgroundColor: '#16A34A' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
