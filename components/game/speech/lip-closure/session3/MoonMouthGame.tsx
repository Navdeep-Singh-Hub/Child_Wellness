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

export function MoonMouthGame({ onBack, onComplete }: Props) {
  const session = useLipRoundGameSession('moon-mouth', DEFAULT_ROUND_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipRoundSense(canPlay);
  const target = roundDifficultyMs(roundRoundDifficulty(session.round));
  const [glow, setGlow] = useState(0.15);
  const [stars, setStars] = useState(false);

  useEffect(() => {
    speakRound('Moon Mouth! Round lips light up the moon.');
    return () => clearRoundSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setGlow(0.15);
    setStars(false);
    speakRound('Make O shape to glow the moon!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setGlow((g) => {
        if (lip.confirmedRounded) return Math.min(1, g + 0.015);
        if (lip.roundedLips) return Math.min(1, g + 0.005);
        return Math.max(0.1, g - 0.006);
      });
      if (lip.confirmedRounded && glow > 0.6) setStars(true);
    }, 60);
    return () => clearInterval(id);
  }, [canPlay, lip.confirmedRounded, lip.roundedLips, glow]);

  const progress = useLipRoundProgress(lip, target, canPlay, () => {
    setStars(true);
    speakRound('Night sky! Beautiful round mouth!');
    void session.manager.markSuccess(lip.holdDuration, lip.roundnessScore);
    setTimeout(() => session.completeRound(), 1000);
  });

  const moon = glow > 0.85 ? '🌕✨' : glow > 0.45 ? '🌔' : '🌑';

  return (
    <>
      <LipRoundGameShell
        title="Moon Mouth"
        subtitle="O shape lights the moon"
        skills="🌙 Lip rounding • ⭐ Night sky"
        gradient={['#1E1B4B', '#312E81']}
        accent="#A5B4FC"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.moon}>{moon}</Text>
          {stars ? <Text style={styles.stars}>⭐✨🌟</Text> : null}
          <LipRoundProgressRing progress={progress} accent="#A5B4FC" />
          <Text style={styles.hint}>Hold round lips to fill the bar</Text>
        </View>
      </LipRoundGameShell>
      <LipRoundGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  moon: { fontSize: 88, marginBottom: 8 },
  stars: { fontSize: 36, marginBottom: 12 },
  hint: { marginTop: 12, fontSize: 15, fontWeight: '700', color: '#C7D2FE' },
});
