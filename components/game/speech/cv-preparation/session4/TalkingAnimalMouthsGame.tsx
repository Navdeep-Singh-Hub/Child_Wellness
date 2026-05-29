import {
  CVPreparationOverlays,
  CVPreparationShell,
  speakCVPreparation,
  useCVPreparationSession,
} from '@/components/game/speech/cv-preparation/shared/cvPreparationShared';
import { ANIMAL_CV, PATTERN_SHORT } from '@/components/game/speech/cv-preparation/session4/cvPatternAssets';
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

function AnimalPlay({
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
  const animal = useMemo(
    () => ANIMAL_CV[hits % ANIMAL_CV.length] ?? ANIMAL_CV[0],
    [hits],
  );
  const { tryPattern, mouth, target } = useCVPatternAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    animal.pattern,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#16A34A" />
      <Text style={styles.animalEmoji}>{animal.emoji}</Text>
      <Text style={styles.animalName}>{animal.animal} says…</Text>
      <View style={styles.bubble}>
        <Text style={styles.pattern}>{PATTERN_SHORT[animal.pattern]}</Text>
      </View>
      <Pressable style={styles.btn} onPress={tryPattern}>
        <Text style={styles.btnText}>Copy the animal! 🎉</Text>
      </Pressable>
      {sense.rewardState !== 'NONE' && <Text style={styles.dance}>Animal celebration!</Text>}
    </View>
  );
}

export function TalkingAnimalMouthsGame({ onBack, onComplete }: Props) {
  const session = useCVPreparationSession('talking-animal-mouths', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakCVPreparation('Talking animal mouths! MA, PA, MOO — copy any way you like.');
  }, [canPlay, session.round]);

  return (
    <>
      <CVPreparationShell
        gameId="talking-animal-mouths"
        title="Talking Animal Mouths"
        subtitle="Playful MA, PA, MOO"
        skills="🦁 Animal play • 🗣️ CV imitation"
        gradient={['#ECFDF5', '#FEF9C3']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Watch the animal mouth, then copy!"
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
  pattern: { fontSize: 32, fontWeight: '900', color: '#15803D' },
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
