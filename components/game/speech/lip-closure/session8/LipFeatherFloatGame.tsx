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

export function LipFeatherFloatGame({ onBack, onComplete }: Props) {
  const session = useAirflowGameSession('lip-feather-float', DEFAULT_AIRFLOW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const flow = useAirflowSense(canPlay, session.manager.coordinator);
  const targetMs = airflowRoundTargetMs(session.round, 2500);
  const [sky, setSky] = useState(false);

  useEffect(() => {
    speakAirflow('Feather Float! Round your lips and blow gently to keep the feather in the sky.');
    return () => clearAirflowSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setSky(false);
    session.manager.startRound('ROUNDED', targetMs);
    speakAirflow('Round lips… gentle blow!');
  }, [session.round, canPlay, targetMs]);

  const onSuccess = useCallback(async () => {
    setSky(true);
    speakAirflow('The feather reached the sky!');
    await session.manager.recordSuccess(
      targetMs,
      flow.airflowStrength,
      flow.airflowStability,
    );
    setTimeout(() => session.completeRound(), 1100);
  }, [session, targetMs, flow.airflowStrength, flow.airflowStability]);

  useAirflowRoundSuccess(flow, session.manager.coordinator, canPlay && !sky, onSuccess);

  const lift = Math.min(1, flow.accumulatedMs / targetMs);
  const featherY = 40 - lift * 28;

  return (
    <>
      <AirflowGameShell
        title="Feather Float"
        subtitle="Rounded lips + gentle airflow"
        skills="🪶 Breath support • 👄 Lip rounding"
        gradient={['#F0FDFA', '#CCFBF1']}
        accent="#0D9488"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        flow={flow}
        targetMs={targetMs}
      >
        <View style={styles.scene}>
          <Text style={styles.sky}>{sky ? '☁️🌤️✨' : '☁️'}</Text>
          <Text style={[styles.feather, { marginTop: featherY }]}>{sky ? '🪶✨' : '🪶'}</Text>
        </View>
      </AirflowGameShell>
      <AirflowGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sky: { fontSize: 40, position: 'absolute', top: 24 },
  feather: { fontSize: 72 },
});
