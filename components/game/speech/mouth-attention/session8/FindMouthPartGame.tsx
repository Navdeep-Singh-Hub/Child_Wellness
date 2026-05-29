import {
  MOUTH_ATTENTION_INTERACTIONS_PER_ROUND,
  MouthAttentionOverlays,
  MouthAttentionShell,
  speakMouthAttention,
  useMouthAttentionSession,
} from '@/components/game/speech/mouth-attention/shared/mouthAttentionShared';
import { useMouthAttention } from '@/hooks/useMouthAttention';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const PARTS = [
  { id: 'lips', label: 'Lips', emoji: '👄' },
  { id: 'tongue', label: 'Tongue', emoji: '👅' },
  { id: 'mouth', label: 'Mouth', emoji: '😮' },
  { id: 'jaw', label: 'Jaw', emoji: '🙂' },
] as const;

export function FindMouthPartGame({ onBack, onComplete }: Props) {
  const session = useMouthAttentionSession('find-mouth-part', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMouthAttention(canPlay, 'find-mouth-part', session.round);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMouthAttention(`Find ${sense.promptTarget}!`);
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

  const onTapPart = () => {
    sense.interact();
  };

  return (
    <>
      <MouthAttentionShell
        title="Find the Mouth Part"
        subtitle="Notice and tap mouth areas"
        skills="👄 Mouth attention"
        gradient={['#E0F2FE', '#FCE7F3']}
        accent="#0284C7"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Find ${sense.promptTarget} (any tap counts)!`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.face}>🙂</Text>
          <View style={styles.grid}>
            {PARTS.map((p) => (
              <Pressable key={p.id} style={[styles.tile, sense.promptTarget === p.id && styles.tileGlow]} onPress={onTapPart}>
                <Text style={styles.emoji}>{p.emoji}</Text>
                <Text style={styles.label}>{p.label}</Text>
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
  stage: { minHeight: 360, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.55)', padding: 14, alignItems: 'center' },
  face: { fontSize: 78, marginBottom: 10 },
  grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  tile: {
    width: '46%',
    minHeight: 108,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileGlow: { borderColor: '#0284C7', backgroundColor: '#E0F2FE' },
  emoji: { fontSize: 44 },
  label: { marginTop: 6, fontSize: 15, fontWeight: '900', color: '#0F172A' },
});

