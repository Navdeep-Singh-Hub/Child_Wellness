import {
  VowelShapingOverlays,
  VowelShapingShell,
  speakVowelShaping,
  useVowelShapingSession,
} from '@/components/game/speech/vowel-shaping/shared/vowelShapingShared';
import { CORE_VOWELS, VOWEL_EMOJI, VOWEL_SHORT } from '@/components/game/speech/vowel-shaping/session3/vowelShapeAssets';
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

function MagicShapesPlay({
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
  const pose = useMemo(
    () => CORE_VOWELS[(hits + sense.imitationAttempts) % CORE_VOWELS.length] ?? CORE_VOWELS[0],
    [hits, sense.imitationAttempts],
  );
  const { tryShape, mouth, target } = useVowelShapeAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    pose.shape,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#A855F7" />
      <View style={styles.card}>
        <Text style={styles.emoji}>{VOWEL_EMOJI[pose.shape]}</Text>
        <Text style={styles.label}>{VOWEL_SHORT[pose.shape]}</Text>
      </View>
      <Pressable style={styles.btn} onPress={tryShape}>
        <Text style={styles.btnText}>I tried! ⭐</Text>
      </Pressable>
    </View>
  );
}

export function MagicMouthShapesGame({ onBack, onComplete }: Props) {
  const session = useVowelShapingSession('magic-mouth-shapes', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakVowelShaping('Magic mouth shapes! Watch AAA, OOO, and EEE. Copy any way you like.');
  }, [canPlay, session.round]);

  return (
    <>
      <VowelShapingShell
        gameId="magic-mouth-shapes"
        title="Magic Mouth Shapes"
        subtitle="AAA, OOO, and EEE shapes"
        skills="✨ Vowel shaping • 😮 Speech readiness"
        gradient={['#FDF4FF', '#E0F2FE']}
        accent="#A855F7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Watch the shape, then tap I tried!"
      >
        {(sense) => (
          <MagicShapesPlay
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
  card: {
    width: '88%',
    maxWidth: 340,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 3,
    borderColor: 'rgba(168,85,247,0.35)',
    alignItems: 'center',
    paddingVertical: 22,
  },
  emoji: { fontSize: 110 },
  label: { marginTop: 10, fontSize: 22, fontWeight: '900', color: '#6B21A8' },
  btn: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#A855F7',
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
});
