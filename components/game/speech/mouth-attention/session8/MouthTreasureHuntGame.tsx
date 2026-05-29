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

const QUESTS = [
  { id: 'lips', text: 'Tap lips' },
  { id: 'mouth', text: 'Find mouth' },
  { id: 'tongue', text: 'Spot tongue' },
] as const;

export function MouthTreasureHuntGame({ onBack, onComplete }: Props) {
  const session = useMouthAttentionSession('mouth-treasure-hunt', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMouthAttention(canPlay, 'mouth-treasure-hunt', session.round);

  const quest = useMemo(() => QUESTS[hits % QUESTS.length] ?? QUESTS[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMouthAttention('Mouth treasure hunt! Follow gentle prompts.');
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
        title="Mouth Treasure Hunt"
        subtitle="Follow gentle mouth prompts"
        skills="🗺️ Joint attention readiness"
        gradient={['#FEF3C7', '#DCFCE7']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`${quest.text} (any tap counts)`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.face}>🙂</Text>
          <Text style={styles.quest}>{quest.text}</Text>
          <View style={styles.row}>
            <Pressable onPress={() => sense.interact()} style={styles.gem}>
              <Text style={styles.gemEmoji}>💎</Text>
              <Text style={styles.gemText}>Tap</Text>
            </Pressable>
            <Pressable onPress={() => sense.interact()} style={styles.gem}>
              <Text style={styles.gemEmoji}>⭐</Text>
              <Text style={styles.gemText}>Tap</Text>
            </Pressable>
            <Pressable onPress={() => sense.interact()} style={styles.gem}>
              <Text style={styles.gemEmoji}>✨</Text>
              <Text style={styles.gemText}>Tap</Text>
            </Pressable>
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
  stage: {
    minHeight: 360,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  face: { fontSize: 80, marginBottom: 10 },
  quest: { fontSize: 20, fontWeight: '900', color: '#92400E', marginBottom: 14 },
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },
  gem: {
    width: 94,
    height: 94,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(202,138,4,0.3)',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  gemEmoji: { fontSize: 34 },
  gemText: { marginTop: 4, fontSize: 13, fontWeight: '900', color: '#0F172A' },
});

