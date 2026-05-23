import {
  BodyPartButton,
  BodyPartsOverlays,
  BodyPartsShell,
  clearBodySpeech,
  DEFAULT_BODY_ROUNDS,
  hapticBodySuccess,
  speakBody,
  useBodyPartsSession,
} from '@/components/game/speech/body-parts/shared/bodyPartsShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const PARTS = [
  { id: 'nose', label: 'Nose', emoji: '👃' },
  { id: 'eyes', label: 'Eyes', emoji: '👀' },
  { id: 'mouth', label: 'Mouth', emoji: '👄' },
  { id: 'ears', label: 'Ears', emoji: '👂' },
] as const;

export function TouchTheNoseGame({ onBack, onComplete }: Props) {
  const session = useBodyPartsSession('touch-the-nose', DEFAULT_BODY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [targetId, setTargetId] = useState<(typeof PARTS)[number]['id']>('nose');

  useEffect(() => {
    speakBody('Touch the body part I say!');
    return () => clearBodySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    const target = PARTS[(session.round - 1) % PARTS.length];
    setTargetId(target.id);
    speakBody(`Touch your ${target.label.toLowerCase()}!`);
  }, [session.round, canPlay]);

  const target = PARTS.find((p) => p.id === targetId)!;

  const onPick = (id: (typeof PARTS)[number]['id']) => {
    if (id === targetId) {
      hapticBodySuccess();
      speakBody(`Yes! That is your ${target.label.toLowerCase()}!`);
      setTimeout(() => session.completeRound(), 700);
    } else {
      speakBody(`Find your ${target.label.toLowerCase()}!`);
    }
  };

  return (
    <>
      <BodyPartsShell
        title="Touch the Nose"
        subtitle="Tap the correct body part"
        skills="👃 Body awareness"
        gradient={['#FFEDD5', '#FDBA74']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Touch your ${target.label.toLowerCase()}!`}
      >
        <Text style={styles.face}>🧒</Text>
        <View style={styles.grid}>
          {PARTS.map((p) => (
            <BodyPartButton
              key={p.id}
              label={p.label}
              emoji={p.emoji}
              accent="#EA580C"
              onPress={() => onPick(p.id)}
            />
          ))}
        </View>
      </BodyPartsShell>
      <BodyPartsOverlays
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
  face: { textAlign: 'center', fontSize: 64, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
