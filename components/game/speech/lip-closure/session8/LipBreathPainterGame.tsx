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

const COLORS = ['🩵', '💙', '💜', '💗', '🧡', '💛', '🌈'];

export function LipBreathPainterGame({ onBack, onComplete }: Props) {
  const session = useAirflowGameSession('lip-breath-painter', DEFAULT_AIRFLOW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const flow = useAirflowSense(canPlay, session.manager.coordinator);
  const targetMs = airflowRoundTargetMs(session.round, 3500);
  const [rainbow, setRainbow] = useState(false);

  useEffect(() => {
    speakAirflow('Breath Painter! Blow gently to paint the sky. Longer steady airflow adds more colors.');
    return () => clearAirflowSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setRainbow(false);
    session.manager.startRound('ANY', targetMs);
    speakAirflow('Paint the sky with your breath!');
  }, [session.round, canPlay, targetMs]);

  const onSuccess = useCallback(async () => {
    setRainbow(true);
    speakAirflow('Rainbow sky — beautiful breath painting!');
    await session.manager.recordSuccess(
      targetMs,
      flow.airflowStrength,
      flow.airflowStability,
    );
    setTimeout(() => session.completeRound(), 1100);
  }, [session, targetMs, flow.airflowStrength, flow.airflowStability]);

  useAirflowRoundSuccess(flow, session.manager.coordinator, canPlay && !rainbow, onSuccess);

  const colorCount = Math.min(
    COLORS.length,
    Math.floor((flow.accumulatedMs / targetMs) * COLORS.length) + 1,
  );
  const palette = rainbow ? COLORS.join('') : COLORS.slice(0, colorCount).join('');

  return (
    <>
      <AirflowGameShell
        title="Breath Painter"
        subtitle="Steady airflow paints colors"
        skills="🎨 Breath endurance • 💨 Airflow"
        gradient={['#FDF4FF', '#FAE8FF']}
        accent="#A855F7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        flow={flow}
        targetMs={targetMs}
      >
        <View style={styles.center}>
          <Text style={styles.canvas}>{rainbow ? '🌈☁️✨' : '☁️'}</Text>
          <Text style={styles.colors}>{palette}</Text>
        </View>
      </AirflowGameShell>
      <AirflowGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  canvas: { fontSize: 72, marginBottom: 12 },
  colors: { fontSize: 28, letterSpacing: 4 },
});
