import { airflowRoundTargetMs } from '@/components/game/speech/lip-closure/modules/LipAirflowSessionManager';
import {
  AirflowGameOverlays,
  AirflowGameShell,
  DEFAULT_AIRFLOW_ROUNDS,
  clearAirflowSpeech,
  speakAirflow,
  useAirflowGameSession,
  useAirflowRoundSuccess,
  useAirflowSense,
} from '@/components/game/speech/lip-closure/shared/lipAirflowShared';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function LipCandleControlGame({ onBack, onComplete }: Props) {
  const session = useAirflowGameSession('lip-candle-control', DEFAULT_AIRFLOW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const flow = useAirflowSense(canPlay, session.manager.coordinator);
  const targetMs = airflowRoundTargetMs(session.round, 2800);
  const [lit, setLit] = useState(false);

  useEffect(() => {
    speakAirflow('Candle Control! Blow gently so the flame dances calmly. Too loud makes it flicker wild.');
    return () => clearAirflowSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setLit(false);
    session.manager.startRound('ANY', targetMs);
    speakAirflow('Soft steady breath on the candle!');
  }, [session.round, canPlay, targetMs]);

  const onSuccess = useCallback(async () => {
    setLit(true);
    speakAirflow('Magic candle lights the room!');
    await session.manager.recordSuccess(
      targetMs,
      flow.airflowStrength,
      flow.airflowStability,
    );
    setTimeout(() => session.completeRound(), 1100);
  }, [session, targetMs, flow.airflowStrength, flow.airflowStability]);

  useAirflowRoundSuccess(flow, session.manager.coordinator, canPlay && !lit, onSuccess);

  const balanced = flow.airflowActive && !flow.isShout && flow.airflowStrength > 0.15;
  const flame = lit ? '🕯️✨🏠' : flow.isShout ? '🕯️💨💫' : balanced ? '🕯️🔥' : '🕯️';

  return (
    <>
      <AirflowGameShell
        title="Candle Control"
        subtitle="Gentle airflow steadies the flame"
        skills="🕯️ Air shaping • 💨 Soft breath"
        gradient={['#FFF7ED', '#FFEDD5']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        flow={flow}
        targetMs={targetMs}
      >
        <View style={styles.center}>
          <Text style={styles.flame}>{flame}</Text>
          {flow.isShout && <Text style={styles.warn}>Softer blow — like a whisper</Text>}
        </View>
      </AirflowGameShell>
      <AirflowGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  flame: { fontSize: 88 },
  warn: { marginTop: 12, fontWeight: '700', color: '#C2410C', fontSize: 15 },
});
