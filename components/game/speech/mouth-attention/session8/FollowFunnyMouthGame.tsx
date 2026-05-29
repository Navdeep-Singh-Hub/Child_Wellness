import {
  MOUTH_ATTENTION_INTERACTIONS_PER_ROUND,
  MouthAttentionOverlays,
  MouthAttentionShell,
  speakMouthAttention,
  useMouthAttentionSession,
} from '@/components/game/speech/mouth-attention/shared/mouthAttentionShared';
import { useMouthAttention } from '@/hooks/useMouthAttention';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const FACES = ['😮', '😄', '😛', '😲', '😁'] as const;

export function FollowFunnyMouthGame({ onBack, onComplete }: Props) {
  const session = useMouthAttentionSession('follow-funny-mouth', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMouthAttention(canPlay, 'follow-funny-mouth', session.round);

  const face = useMemo(() => FACES[(sense.attentionShiftCount + hits) % FACES.length] ?? '😮', [sense.attentionShiftCount, hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMouthAttention('Follow the funny mouth and tap.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction();
    session.manager.recordAttentionShift();
    if (next >= MOUTH_ATTENTION_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 700);
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <MouthAttentionShell
        title="Follow the Funny Mouth"
        subtitle="Watch and shift attention"
        skills="😄 Flexible attention"
        gradient={['#FEF9C3', '#FCE7F3']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Follow the changing mouth. Tap when ready."
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Pressable onPress={() => sense.interact()} style={styles.bigFaceCard}>
            <Text style={styles.face}>{face}</Text>
            <Text style={styles.text}>Tap the funny mouth</Text>
          </Pressable>
        </View>
      </MouthAttentionShell>
      <MouthAttentionOverlays
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
  stage: { minHeight: 360, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' },
  bigFaceCard: {
    width: '86%',
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: 'rgba(234,88,12,0.25)',
  },
  face: { fontSize: 110 },
  text: { marginTop: 8, fontSize: 17, fontWeight: '900', color: '#7C2D12' },
});

