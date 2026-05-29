import { spreadDifficultyMs, spreadRoundDifficulty } from '@/components/game/speech/lip-closure/modules/LipSpreadSessionManager';
import {
  DEFAULT_SPREAD_ROUNDS,
  LipSpreadGameOverlays,
  LipSpreadGameShell,
  LipSpreadProgressRing,
  clearSpreadSpeech,
  speakSpread,
  useLipSpreadGameSession,
  useLipSpreadProgress,
  useLipSpreadSense,
} from '@/components/game/speech/lip-closure/shared/lipSpreadShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function MirrorMatchGame({ onBack, onComplete }: Props) {
  const session = useLipSpreadGameSession('lip-mirror-match', DEFAULT_SPREAD_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipSpreadSense(canPlay);
  const target = spreadDifficultyMs(spreadRoundDifficulty(session.round));
  const [stars, setStars] = useState(false);

  useEffect(() => {
    speakSpread('Mirror Match! Copy the avatar smile.');
    return () => clearSpreadSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setStars(false);
    speakSpread('Imitate the big smile in the mirror!');
  }, [session.round, canPlay]);

  const progress = useLipSpreadProgress(lip, target, canPlay, () => {
    setStars(true);
    speakSpread('Mirror stars! Perfect smile match!');
    void session.manager.markSuccess(lip.holdDuration, lip.spreadScore);
    setTimeout(() => session.completeRound(), 1000);
  });

  const you = lip.confirmedSpread ? '😁' : lip.lipsSpread ? '🙂' : '😐';

  return (
    <>
      <LipSpreadGameShell
        title="Mirror Match"
        subtitle="Copy the avatar smile"
        skills="🪞 Imitation • 😁 Lip spread"
        gradient={['#F0FDF4', '#DCFCE7']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.label}>Avatar:</Text>
          <Text style={styles.avatar}>😁</Text>
          <Text style={styles.label}>You:</Text>
          <Text style={styles.you}>{you}</Text>
          {stars ? <Text style={styles.starRow}>⭐✨⭐</Text> : null}
          <LipSpreadProgressRing progress={progress} accent="#16A34A" />
        </View>
      </LipSpreadGameShell>
      <LipSpreadGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 15, fontWeight: '700', color: '#15803D' },
  avatar: { fontSize: 64, marginVertical: 6 },
  you: { fontSize: 64, marginBottom: 8 },
  starRow: { fontSize: 32, marginBottom: 8 },
});
