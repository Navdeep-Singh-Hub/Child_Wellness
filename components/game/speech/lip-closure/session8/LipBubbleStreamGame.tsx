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

export function LipBubbleStreamGame({ onBack, onComplete }: Props) {
  const session = useAirflowGameSession('lip-bubble-stream', DEFAULT_AIRFLOW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const flow = useAirflowSense(canPlay, session.manager.coordinator);
  const targetMs = airflowRoundTargetMs(session.round, 3200);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    speakAirflow('Bubble Stream! Keep blowing softly to make a stream of bubbles.');
    return () => clearAirflowSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setBurst(false);
    session.manager.startRound('ANY', targetMs);
    speakAirflow('Steady airflow makes bigger bubbles!');
  }, [session.round, canPlay, targetMs]);

  const onSuccess = useCallback(async () => {
    setBurst(true);
    speakAirflow('Bubble celebration!');
    await session.manager.recordSuccess(
      targetMs,
      flow.airflowStrength,
      flow.airflowStability,
    );
    setTimeout(() => session.completeRound(), 1100);
  }, [session, targetMs, flow.airflowStrength, flow.airflowStability]);

  useAirflowRoundSuccess(flow, session.manager.coordinator, canPlay && !burst, onSuccess);

  const bubbleCount = Math.min(8, Math.floor(flow.accumulatedMs / 400) + (flow.airflowActive ? 1 : 0));
  const bubbles = '🫧'.repeat(Math.max(1, bubbleCount)) + (burst ? '✨💫' : '');

  return (
    <>
      <AirflowGameShell
        title="Bubble Stream"
        subtitle="Continuous gentle airflow"
        skills="🫧 Sustained breath • 💨 Airflow"
        gradient={['#EFF6FF', '#DBEAFE']}
        accent="#2563EB"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        flow={flow}
        targetMs={targetMs}
      >
        <View style={styles.center}>
          <Text style={styles.bubbles}>{bubbles}</Text>
          <Text style={styles.hint}>
            {flow.airflowStability > 0.5 ? 'Steady stream!' : 'Blow gently and keep going'}
          </Text>
        </View>
      </AirflowGameShell>
      <AirflowGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  bubbles: { fontSize: 36, textAlign: 'center', lineHeight: 44 },
  hint: { marginTop: 16, fontWeight: '700', color: '#1D4ED8', fontSize: 15, textAlign: 'center' },
});
