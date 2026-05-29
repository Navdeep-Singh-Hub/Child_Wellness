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

const STEPS = ['Watch mouth', 'Copy shape', 'Optional sound'] as const;

function AdventurePlay({
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
  const step = STEPS[Math.min(hits, STEPS.length - 1)] ?? STEPS[0];
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
    onRoundComplete,
    pose.shape,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#EA580C" />
      <Text style={styles.hero}>🦸</Text>
      <View style={styles.badges}>
        {CORE_VOWELS.map((v, i) => (
          <View key={v.shape} style={[styles.badge, i <= hits && styles.badgeOn]}>
            <Text style={styles.badgeEmoji}>{VOWEL_EMOJI[v.shape]}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.face}>{VOWEL_EMOJI[pose.shape]}</Text>
      <Pressable style={styles.btn} onPress={tryShape}>
        <Text style={styles.btnText}>Shape adventure! ✨</Text>
      </Pressable>
      {sense.rewardState === 'HERO' && <Text style={styles.celebrate}>Hero celebration!</Text>}
    </View>
  );
}

export function SpeechShapeAdventureGame({ onBack, onComplete }: Props) {
  const session = useVowelShapingSession('speech-shape-adventure', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakVowelShaping('Speech shape adventure! AAA, OOO, EEE — watch, copy, celebrate!');
  }, [canPlay, session.round]);

  return (
    <>
      <VowelShapingShell
        gameId="speech-shape-adventure"
        title="Speech Shape Adventure"
        subtitle="Integrate vowel shaping play"
        skills="🗺️ Vowel integration • 🦸 Hero play"
        gradient={['#FEF3C7', '#E0E7FF']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Watch, copy shape, optional sound — no fail!"
      >
        {(sense) => (
          <AdventurePlay
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
  stage: { minHeight: 340, alignItems: 'center', padding: 10 },
  hero: { fontSize: 52 },
  badges: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 2,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOn: { backgroundColor: '#FFEDD5', borderColor: '#EA580C' },
  badgeEmoji: { fontSize: 24 },
  step: { fontSize: 16, fontWeight: '900', color: '#9A3412' },
  face: { fontSize: 76, marginVertical: 6 },
  btn: { paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14, backgroundColor: '#EA580C' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 10, fontSize: 17, fontWeight: '900', color: '#C2410C' },
});
