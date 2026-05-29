import {
  VowelShapingOverlays,
  VowelShapingShell,
  speakVowelShaping,
  useVowelShapingSession,
} from '@/components/game/speech/vowel-shaping/shared/vowelShapingShared';
import { CORE_VOWELS, VOWEL_EMOJI } from '@/components/game/speech/vowel-shaping/session3/vowelShapeAssets';
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

function BalloonPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  sense: VowelShapingSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: VowelShapingSessionManager;
  onRoundComplete: () => void;
}) {
  const [size, setSize] = useState(0.4);
  const [party, setParty] = useState(false);
  const pose = useMemo(
    () => CORE_VOWELS[hits % CORE_VOWELS.length] ?? CORE_VOWELS[0],
    [hits],
  );

  const { tryShape, mouth, target } = useVowelShapeAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    () => {
      setSize((s) => {
        const next = Math.min(1, s + 0.22);
        if (next >= 0.95) {
          setParty(true);
          setTimeout(() => {
            setParty(false);
            setSize(0.4);
          }, 900);
        }
        return next;
      });
      onRoundComplete();
    },
    pose.shape,
  );

  const scale = 0.55 + size * 0.85;

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#EC4899" />
      <Text style={styles.shape}>{VOWEL_EMOJI[pose.shape]}</Text>
      <Text style={[styles.balloon, { fontSize: 56 * scale }]}>{party ? '🎉' : '🎈'}</Text>
      <Text style={styles.hint}>Each shape try grows the balloon</Text>
      <Pressable style={styles.btn} onPress={tryShape}>
        <Text style={styles.btnText}>Shape try! 🎈</Text>
      </Pressable>
    </View>
  );
}

export function VowelBalloonBuilderGame({ onBack, onComplete }: Props) {
  const session = useVowelShapingSession('vowel-balloon-builder', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakVowelShaping('Shape the balloon! AAA, OOO, EEE tries make it grow.');
  }, [canPlay, session.round]);

  return (
    <>
      <VowelShapingShell
        gameId="vowel-balloon-builder"
        title="Vowel Balloon Builder"
        subtitle="Shapes grow the balloon"
        skills="🎈 Repeated shaping • 😮 Vowel play"
        gradient={['#FCE7F3', '#FEF9C3']}
        accent="#EC4899"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Copy the vowel shape to inflate the balloon"
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
  shape: { fontSize: 48, marginBottom: 4 },
  balloon: { lineHeight: 80 },
  hint: { marginTop: 10, fontSize: 15, fontWeight: '800', color: '#831843' },
  btn: { marginTop: 14, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, backgroundColor: '#EC4899' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
