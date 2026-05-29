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

const RAINBOW = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'];

export function RainbowSmileGame({ onBack, onComplete }: Props) {
  const session = useLipSpreadGameSession('rainbow-smile', DEFAULT_SPREAD_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipSpreadSense(canPlay);
  const target = spreadDifficultyMs(spreadRoundDifficulty(session.round));
  const [colors, setColors] = useState(1);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    speakSpread('Rainbow Smile! Spread lips to paint the rainbow.');
    return () => clearSpreadSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setColors(1);
    setCelebrate(false);
    speakSpread('Smile wide — more colors appear!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setColors((c) => {
        if (lip.confirmedSpread) return Math.min(RAINBOW.length, c + 0.04);
        if (lip.lipsSpread) return Math.min(RAINBOW.length, c + 0.01);
        return Math.max(1, c - 0.02);
      });
    }, 70);
    return () => clearInterval(id);
  }, [canPlay, lip.confirmedSpread, lip.lipsSpread]);

  const progress = useLipSpreadProgress(lip, target, canPlay, () => {
    setCelebrate(true);
    speakSpread('Sky celebration! Full rainbow!');
    void session.manager.markSuccess(lip.holdDuration, lip.spreadScore);
    setTimeout(() => session.completeRound(), 1000);
  });

  const visible = RAINBOW.slice(0, Math.max(1, Math.round(colors)));

  return (
    <>
      <LipSpreadGameShell
        title="Rainbow Smile"
        subtitle="Smile extends the rainbow"
        skills="🌈 Lip spread • 😁 Long hold"
        gradient={['#E0F2FE', '#BAE6FD']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.rainbow}>{visible.join('')}{celebrate ? '✨☁️' : ''}</Text>
          <LipSpreadProgressRing progress={progress} accent="#0284C7" />
        </View>
      </LipSpreadGameShell>
      <LipSpreadGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  rainbow: { fontSize: 40, marginBottom: 16, letterSpacing: 4 },
});
