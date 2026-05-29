import {
  FunctionalVocalIntentFrame,
  FunctionalVocalIntentOverlays,
  useFunctionalVocalIntentSession,
} from '@/components/game/speech/functional-vocal-intent/shared/functionalVocalIntentShared';
import { useChildTurn } from '@/components/game/speech/functional-vocal-intent/session9/useChildTurn';
import { useVocalIntentInteraction } from '@/components/game/speech/functional-vocal-intent/session9/useVocalIntentInteraction';
import type { FunctionalVocalIntentSessionManager } from '@/components/game/speech/functional-vocal-intent/modules/FunctionalVocalIntentSessionManager';
import type { FunctionalVocalIntentSense } from '@/hooks/useFunctionalVocalIntent';
import React, { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

function FriendPlay({
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
  const [celebrate, setCelebrate] = useState(false);

  useVocalIntentInteraction(sense, active, childTurn, hits, setHits, manager, onRoundComplete);

  useEffect(() => {
    if (hits > 0) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 1200);
      return () => clearTimeout(t);
    }
  }, [hits]);

  return (
    <View style={styles.stage}>
      <Text style={styles.friend}>🐻</Text>
      <Text style={styles.bubble}>{childTurn ? 'Your turn! Any sound!' : 'Beep boop! 🎵'}</Text>
      <Text style={styles.turn}>{childTurn ? '👂 Listening…' : '🗣️ Friend spoke'}</Text>
      {celebrate && <Text style={styles.dance}>Friend celebration!</Text>}
    </View>
  );
}

export function TalkingFriendTurnTakingGame({ onBack, onComplete }: Props) {
  const session = useFunctionalVocalIntentSession('talking-friend-turn-taking', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const childTurn = useChildTurn(
    canPlay,
    session.round,
    'Hello! I made a playful sound. Now you try — any sound is great!',
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
  }, [canPlay, session.round]);

  return (
    <>
      <FunctionalVocalIntentFrame
        title="Talking Friend Turn-Taking"
        subtitle="Take turns with sound"
        skills="🐻 Turn-taking • 💬 Vocal interaction"
        gradient={['#ECFDF5', '#FEF9C3']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        progressLabel="turns"
      >
        {(sense) => (
          <FriendPlay
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
  stage: { minHeight: 320, alignItems: 'center', padding: 12 },
  friend: { fontSize: 92 },
  bubble: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    fontSize: 18,
    fontWeight: '900',
    color: '#166534',
  },
  turn: { marginTop: 10, fontSize: 15, fontWeight: '800', color: '#15803D' },
  dance: { marginTop: 12, fontSize: 17, fontWeight: '900', color: '#16A34A' },
});
