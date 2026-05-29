import {
  VowelShapingOverlays,
  VowelShapingShell,
  speakVowelShaping,
  useVowelShapingSession,
} from '@/components/game/speech/vowel-shaping/shared/vowelShapingShared';
import { CORE_VOWELS, VOWEL_EMOJI, VOWEL_LABEL } from '@/components/game/speech/vowel-shaping/session3/vowelShapeAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useVowelShapeAttempt,
} from '@/components/game/speech/vowel-shaping/session3/useVowelShapeAttempt';
import type { VowelShapingSessionManager } from '@/components/game/speech/vowel-shaping/modules/VowelShapingSessionManager';
import type { VowelShapingSense } from '@/hooks/useVowelShaping';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

function MirrorPlay({
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
  const [sparkle, setSparkle] = useState(false);
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
      setSparkle(true);
      setTimeout(() => setSparkle(false), 800);
      onRoundComplete();
    },
    pose.shape,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#7C3AED" />
      <View style={styles.mirror}>
        <Text style={styles.tag}>Vowel mirror</Text>
        <Text style={styles.face}>{VOWEL_EMOJI[pose.shape]}</Text>
        <Text style={styles.label}>{VOWEL_LABEL[pose.shape]}</Text>
      </View>
      {Platform.OS === 'web' && sense.postureHint && (
        <Text style={styles.softHint}>Soft hint: {sense.postureHint.toLowerCase()} feeling</Text>
      )}
      <Pressable style={styles.btn} onPress={tryShape}>
        <Text style={styles.btnText}>{sparkle ? '✨ Sparkles!' : 'Mirror copy ✨'}</Text>
      </Pressable>
    </View>
  );
}

export function MirrorVowelFaceGame({ onBack, onComplete }: Props) {
  const session = useVowelShapingSession('mirror-vowel-face', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakVowelShaping('Mirror vowel face! Watch AAA, OOO, EEE and copy — sparkle celebration!');
  }, [canPlay, session.round]);

  return (
    <>
      <VowelShapingShell
        gameId="mirror-vowel-face"
        title="Mirror Vowel Face"
        subtitle="Watch and imitate vowel shapes"
        skills="🪞 Mirror vowels • ✨ Sparkles"
        gradient={['#EDE9FE', '#E0F2FE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Copy the mirror mouth shape when ready"
      >
        {(sense) => (
          <MirrorPlay
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
  stage: { minHeight: 340, alignItems: 'center', padding: 12 },
  mirror: {
    width: '88%',
    maxWidth: 340,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 3,
    borderColor: 'rgba(124,58,237,0.35)',
    alignItems: 'center',
    paddingVertical: 18,
  },
  tag: { fontSize: 14, fontWeight: '800', color: '#5B21B6' },
  face: { fontSize: 100, marginVertical: 6 },
  label: { fontSize: 16, fontWeight: '900', color: '#4C1D95' },
  softHint: { marginTop: 8, fontSize: 13, fontWeight: '700', color: '#6D28D9' },
  btn: { marginTop: 12, paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14, backgroundColor: '#7C3AED' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
