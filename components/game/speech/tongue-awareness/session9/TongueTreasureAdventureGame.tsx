import {
  TONGUE_AWARENESS_INTERACTIONS_PER_ROUND,
  TongueAwarenessOverlays,
  TongueAwarenessShell,
  speakTongueAwareness,
  useTongueAwarenessSession,
} from '@/components/game/speech/tongue-awareness/shared/tongueAwarenessShared';
import { useTongueAwareness } from '@/hooks/useTongueAwareness';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const STEPS = [
  { id: 'tap', label: 'Tap the tongue', emoji: '👅' },
  { id: 'watch', label: 'Watch wiggle', emoji: '😛' },
  { id: 'copy', label: 'Copy playful face', emoji: '😜' },
] as const;

export function TongueTreasureAdventureGame({ onBack, onComplete }: Props) {
  const session = useTongueAwarenessSession('tongue-treasure-adventure', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useTongueAwareness(canPlay, 'tongue-treasure-adventure', session.round);

  const step = useMemo(() => STEPS[Math.min(hits, STEPS.length - 1)] ?? STEPS[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakTongueAwareness('Treasure adventure! Tap, watch, and copy — all tries count.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction();
    session.manager.recordExploration(`adventure:${step.id}`);
    if (next >= TONGUE_AWARENESS_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 700);
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <TongueAwarenessShell
        title="Tongue Treasure Adventure"
        subtitle="Mini adventure for tongue awareness"
        skills="🗺️ Combined exploration"
        gradient={['#FEF3C7', '#E0F2FE']}
        accent="#0EA5E9"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Step: ${step.label}. Tap the card when ready.`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.map}>🗺️</Text>
          <View style={styles.path}>
            {STEPS.map((s, i) => (
              <View key={s.id} style={[styles.node, i <= hits && styles.nodeDone]}>
                <Text style={styles.nodeEmoji}>{s.emoji}</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.card} onPress={() => sense.interact()}>
            <Text style={styles.cardEmoji}>{step.emoji}</Text>
            <Text style={styles.cardLabel}>{step.label}</Text>
          </Pressable>
          {sense.rewardState === 'TREASURE' && <Text style={styles.treasure}>Treasure! ⭐</Text>}
        </View>
      </TongueAwarenessShell>
      <TongueAwarenessOverlays
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
    padding: 14,
  },
  map: { fontSize: 42, marginBottom: 8 },
  path: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  node: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 2,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeDone: { backgroundColor: '#E0F2FE', borderColor: '#0EA5E9' },
  nodeEmoji: { fontSize: 26 },
  card: {
    width: '88%',
    maxWidth: 360,
    minHeight: 140,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 2,
    borderColor: 'rgba(14,165,233,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: { fontSize: 72 },
  cardLabel: { marginTop: 8, fontSize: 17, fontWeight: '900', color: '#0C4A6E' },
  treasure: { marginTop: 12, fontSize: 20, fontWeight: '900', color: '#CA8A04' },
});
