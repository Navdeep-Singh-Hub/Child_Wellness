import {
  FunctionalVocalIntentFrame,
  FunctionalVocalIntentOverlays,
  speakFunctionalVocalIntent,
  useFunctionalVocalIntentSession,
} from '@/components/game/speech/functional-vocal-intent/shared/functionalVocalIntentShared';
import { useChildTurn } from '@/components/game/speech/functional-vocal-intent/session9/useChildTurn';
import { useVocalIntentInteraction } from '@/components/game/speech/functional-vocal-intent/session9/useVocalIntentInteraction';
import type { FunctionalVocalIntentSessionManager } from '@/components/game/speech/functional-vocal-intent/modules/FunctionalVocalIntentSessionManager';
import type { FunctionalVocalIntentSense } from '@/hooks/useFunctionalVocalIntent';
import React, { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const STEPS = ['Make sound', 'Friend responds', 'Your turn again'] as const;

function HeroPlay({
  sense,
  active,
  childTurn,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  sense: FunctionalVocalIntentSense;
  active: boolean;
  childTurn: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: FunctionalVocalIntentSessionManager;
  onRoundComplete: () => void;
}) {
  const step = STEPS[Math.min(hits, STEPS.length - 1)] ?? STEPS[0];

  useVocalIntentInteraction(sense, active, childTurn, hits, setHits, manager, onRoundComplete);

  return (
    <View style={styles.stage}>
      <Text style={styles.hero}>🦸</Text>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.turn}>{childTurn ? 'Your turn — any sound!' : 'Friend turn…'}</Text>
      <Pressable
        style={[styles.tap, !childTurn && styles.tapDim]}
        disabled={!childTurn}
        onPress={() => {
          if (!childTurn) return;
          sense.tapResponse();
        }}
      >
        <Text style={styles.tapText}>Or tap if mic is off</Text>
      </Pressable>
      {sense.rewardState === 'HERO' && <Text style={styles.celebrate}>Hero celebration!</Text>}
    </View>
  );
}

export function LittleCommunicatorHeroGame({ onBack, onComplete }: Props) {
  const session = useFunctionalVocalIntentSession('little-communicator-hero', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const childTurn = useChildTurn(
    canPlay,
    session.round,
    'Little hero! I said hello. Now you make a sound — any sound works!',
    2600,
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakFunctionalVocalIntent('Little communicator hero! Take turns with sounds — no fail!');
  }, [canPlay, session.round]);

  return (
    <>
      <FunctionalVocalIntentFrame
        title="Little Communicator Hero"
        subtitle="Integrate vocal intent"
        skills="🦸 Turn-taking • 💬 Communication hero"
        gradient={['#FEF3C7', '#E0E7FF']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="turns"
      >
        {(sense) => (
          <HeroPlay
            sense={sense}
            active={canPlay && !session.gameFinished}
            childTurn={childTurn}
            hits={hits}
            setHits={setHits}
            manager={session.manager}
            onRoundComplete={session.completeRound}
          />
        )}
      </FunctionalVocalIntentFrame>
      <FunctionalVocalIntentOverlays
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
  stage: { minHeight: 320, alignItems: 'center', padding: 10 },
  hero: { fontSize: 72 },
  step: { fontSize: 18, fontWeight: '900', color: '#5B21B6', marginTop: 8 },
  turn: { fontSize: 16, fontWeight: '800', color: '#6D28D9', marginVertical: 8 },
  tap: {
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.15)',
  },
  tapDim: { opacity: 0.45 },
  tapText: { fontSize: 14, fontWeight: '800', color: '#5B21B6' },
  celebrate: { marginTop: 12, fontSize: 17, fontWeight: '900', color: '#5B21B6' },
});
