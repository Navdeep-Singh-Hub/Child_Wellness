import {
  ORAL_IMITATION_INTERACTIONS_PER_ROUND,
  OralImitationOverlays,
  OralImitationShell,
  speakOralImitation,
  useOralImitationSession,
} from '@/components/game/speech/oral-imitation-integration/shared/oralImitationShared';
import { oralPromptToTarget } from '@/components/game/speech/mouth-pose/modules/poseTargetMap';
import { useOralImitationIntegration } from '@/hooks/useOralImitationIntegration';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

/** Tap-only air play — no mic detection (autism-safe, no pressure) */
export function AirMouthPlayGame({ onBack, onComplete }: Props) {
  const session = useOralImitationSession('air-mouth-play', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [balloons, setBalloons] = useState(0);
  const sense = useOralImitationIntegration(canPlay, 'air-mouth-play', session.round);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    setBalloons(0);
    speakOralImitation('Watch the soft blow animation. Tap when you try — no microphone needed.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    setBalloons((b) => b + 1);
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction();
    if (next >= ORAL_IMITATION_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 700);
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <OralImitationShell
        title="Air + Mouth Play"
        subtitle="Soft blow and mouth watch — tap to try"
        skills="🌬️ Air + mouth awareness"
        gradient={['#E0F2FE', '#DCFCE7']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Watch 💨 then tap I tried a soft blow!"
        onGoodTry={sense.goodTry}
        sense={sense}
        poseTarget={oralPromptToTarget('blow')}
        onPoseMatch={sense.goodTry}
      >
        <View style={styles.stage}>
          <Text style={styles.face}>😮</Text>
          <Text style={styles.breeze}>💨 · · · 💨</Text>
          <View style={styles.balloonRow}>
            {Array.from({ length: Math.min(5, balloons + 1) }).map((_, i) => (
              <Text key={i} style={styles.balloon}>
                🎈
              </Text>
            ))}
          </View>
          <Pressable style={styles.tryBtn} onPress={() => sense.interact()}>
            <Text style={styles.tryText}>I tried soft blow ✨</Text>
          </Pressable>
        </View>
      </OralImitationShell>
      <OralImitationOverlays
        showRoundSuccess={session.showRoundSuccess}
        gameFinished={session.gameFinished}
        finalStats={session.finalStats}
        onBack={onBack}
        onComplete={onComplete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  stage: {
    minHeight: 360,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  face: { fontSize: 88 },
  breeze: { fontSize: 28, marginVertical: 8, color: '#0369A1', fontWeight: '800' },
  balloonRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, minHeight: 44 },
  balloon: { fontSize: 32 },
  tryBtn: {
    marginTop: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#0284C7',
  },
  tryText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
