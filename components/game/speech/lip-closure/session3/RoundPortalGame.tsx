import { roundDifficultyMs, roundRoundDifficulty } from '@/components/game/speech/lip-closure/modules/LipRoundSessionManager';
import {
  DEFAULT_ROUND_ROUNDS,
  LipRoundGameOverlays,
  LipRoundGameShell,
  LipRoundProgressRing,
  clearRoundSpeech,
  speakRound,
  useLipRoundGameSession,
  useLipRoundProgress,
  useLipRoundSense,
} from '@/components/game/speech/lip-closure/shared/lipRoundShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function RoundPortalGame({ onBack, onComplete }: Props) {
  const session = useLipRoundGameSession('round-portal', DEFAULT_ROUND_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipRoundSense(canPlay);
  const target = roundDifficultyMs(roundRoundDifficulty(session.round));
  const [portal, setPortal] = useState(0.2);
  const [creatures, setCreatures] = useState(false);

  useEffect(() => {
    speakRound('Round Portal! Match the O shape to open the portal.');
    return () => clearRoundSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setPortal(0.2);
    setCreatures(false);
    speakRound('Copy the round mouth demo!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setPortal((p) => {
        if (lip.confirmedRounded) return Math.min(1, p + 0.015);
        if (lip.roundedLips) return Math.min(1, p + 0.005);
        return Math.max(0.1, p - 0.006);
      });
    }, 60);
    return () => clearInterval(id);
  }, [canPlay, lip.confirmedRounded, lip.roundedLips]);

  const progress = useLipRoundProgress(lip, target, canPlay, () => {
    setCreatures(true);
    speakRound('Magic creatures appear! Portal open!');
    void session.manager.markSuccess(lip.holdDuration, lip.roundnessScore);
    setTimeout(() => session.completeRound(), 1100);
  });

  const portalEmoji = portal > 0.85 ? '🌀✨🦄🐉' : portal > 0.45 ? '🌀✨' : '🌀';

  return (
    <>
      <LipRoundGameShell
        title="Round Portal"
        subtitle="Match the O shape to grow the portal"
        skills="🌀 Lip rounding • 👄 O match"
        gradient={['#F3E8FF', '#E9D5FF']}
        accent="#9333EA"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.demoLabel}>Copy this O:</Text>
          <Text style={styles.demo}>😮</Text>
          <Text style={styles.portal}>{creatures ? '🦄🐉✨' : portalEmoji}</Text>
          <LipRoundProgressRing progress={progress} accent="#9333EA" />
        </View>
      </LipRoundGameShell>
      <LipRoundGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  demoLabel: { fontSize: 15, fontWeight: '700', color: '#7E22CE' },
  demo: { fontSize: 56, marginVertical: 6 },
  portal: { fontSize: 72, marginBottom: 12 },
});
