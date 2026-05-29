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

const SPOTS = [
  { id: 'lips', title: 'Lips' },
  { id: 'mouth', title: 'Mouth' },
  { id: 'cheek', title: 'Cheek' },
  { id: 'tongue', title: 'Tongue' },
] as const;

export function WhereDidItGoMouthGame({ onBack, onComplete }: Props) {
  const session = useMouthAttentionSession('where-did-it-go-mouth', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMouthAttention(canPlay, 'where-did-it-go-mouth', session.round);

  const hidden = useMemo(() => SPOTS[(hits + session.round) % SPOTS.length] ?? SPOTS[0], [hits, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMouthAttention(`Where did it go? Try ${hidden.title}.`);
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

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
        title="Where Did It Go? Mouth Explorer"
        subtitle="Tap where the object hides"
        skills="🧭 Flexible shifting"
        gradient={['#DCFCE7', '#E0E7FF']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Try a spot: ${hidden.title}. Any tap counts.`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.face}>🙂</Text>
          <View style={styles.grid}>
            {SPOTS.map((s) => (
              <Pressable key={s.id} style={[styles.spot, s.id === hidden.id && styles.hiddenSpot]} onPress={() => sense.interact()}>
                <Text style={styles.spotEmoji}>{s.id === hidden.id ? '⭐' : '📍'}</Text>
                <Text style={styles.spotText}>{s.title}</Text>
              </Pressable>
            ))}
          </View>
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
  stage: { minHeight: 360, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', padding: 12 },
  face: { fontSize: 78, marginBottom: 10 },
  grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  spot: {
    width: '46%',
    minHeight: 98,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(22,163,74,0.28)',
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenSpot: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
  spotEmoji: { fontSize: 34 },
  spotText: { marginTop: 6, fontSize: 15, fontWeight: '900', color: '#0F172A' },
});

