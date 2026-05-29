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

export function LipWindTunnelGame({ onBack, onComplete }: Props) {
  const session = useAirflowGameSession('lip-wind-tunnel', DEFAULT_AIRFLOW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const flow = useAirflowSense(canPlay, session.manager.coordinator);
  const targetMs = airflowRoundTargetMs(session.round, 3000);
  const [finish, setFinish] = useState(false);

  useEffect(() => {
    speakAirflow('Wind Tunnel! Round your lips and guide the cloud through the tunnel with gentle air.');
    return () => clearAirflowSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setFinish(false);
    session.manager.startRound('ROUNDED', targetMs);
    speakAirflow('Round lips and blow to move the cloud!');
  }, [session.round, canPlay, targetMs]);

  const onSuccess = useCallback(async () => {
    setFinish(true);
    speakAirflow('You finished the tunnel race!');
    await session.manager.recordSuccess(
      targetMs,
      flow.airflowStrength,
      flow.airflowStability,
    );
    setTimeout(() => session.completeRound(), 1100);
  }, [session, targetMs, flow.airflowStrength, flow.airflowStability]);

  useAirflowRoundSuccess(flow, session.manager.coordinator, canPlay && !finish, onSuccess);

  const progress = Math.min(1, flow.accumulatedMs / targetMs);

  return (
    <>
      <AirflowGameShell
        title="Wind Tunnel"
        subtitle="Rounded lips guide the cloud"
        skills="🌬️ Air control • 😮 Lip shape"
        gradient={['#F5F3FF', '#EDE9FE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        flow={flow}
        targetMs={targetMs}
      >
        <View style={styles.tunnel}>
          <Text style={styles.exit}>{finish ? '🏁✨' : '🏁'}</Text>
          <View style={styles.track}>
            <Text style={[styles.cloud, { marginLeft: `${progress * 65}%` }]}>
              {finish ? '☁️🎉' : '☁️'}
            </Text>
          </View>
          <Text style={styles.tunnelEmoji}>🌀🌀🌀</Text>
        </View>
      </AirflowGameShell>
      <AirflowGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  tunnel: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
  exit: { fontSize: 32, alignSelf: 'flex-end', marginBottom: 8 },
  track: {
    height: 64,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.65)',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cloud: { fontSize: 44 },
  tunnelEmoji: { textAlign: 'center', fontSize: 28, opacity: 0.7 },
});
