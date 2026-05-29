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

export function SmileBridgeGame({ onBack, onComplete }: Props) {
  const session = useLipSpreadGameSession('smile-bridge', DEFAULT_SPREAD_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipSpreadSense(canPlay);
  const target = spreadDifficultyMs(spreadRoundDifficulty(session.round));
  const [bridge, setBridge] = useState(0.15);
  const [crossed, setCrossed] = useState(false);

  useEffect(() => {
    speakSpread('Smile Bridge! Stretch lips sideways to build the bridge.');
    return () => clearSpreadSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setBridge(0.15);
    setCrossed(false);
    speakSpread('Smile wide to grow the bridge!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setBridge((b) => {
        if (lip.confirmedSpread) return Math.min(1, b + 0.014);
        if (lip.lipsSpread) return Math.min(1, b + 0.005);
        return Math.max(0.1, b - 0.006);
      });
      if (lip.confirmedSpread) session.manager.onSpreading();
      else if (!lip.inGracePeriod) session.manager.onWarning();
    }, 55);
    return () => clearInterval(id);
  }, [canPlay, lip.confirmedSpread, lip.lipsSpread, lip.inGracePeriod]);

  const progress = useLipSpreadProgress(lip, target, canPlay, () => {
    setCrossed(true);
    speakSpread('The animal crosses happily! Bridge complete!');
    void session.manager.markSuccess(lip.holdDuration, lip.spreadScore);
    setTimeout(() => session.completeRound(), 1000);
  });

  return (
    <>
      <LipSpreadGameShell
        title="Smile Bridge"
        subtitle="Smile builds bridge pieces"
        skills="🌉 Lip spread • 😁 EEE shape"
        gradient={['#FEF3C7', '#FDE68A']}
        accent="#D97706"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.bridge}>{'🌉'.repeat(Math.max(1, Math.round(bridge * 4)))}</Text>
          {crossed ? <Text style={styles.animal}>🐻➡️🌉✨</Text> : <Text style={styles.animal}>🐻…</Text>}
          <LipSpreadProgressRing progress={progress} accent="#D97706" />
        </View>
      </LipSpreadGameShell>
      <LipSpreadGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bridge: { fontSize: 36, marginBottom: 12, letterSpacing: 2 },
  animal: { fontSize: 48, marginBottom: 12 },
});
