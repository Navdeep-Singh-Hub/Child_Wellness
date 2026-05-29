import {
  TONGUE_AWARENESS_INTERACTIONS_PER_ROUND,
  TongueAwarenessOverlays,
  TongueAwarenessShell,
  speakTongueAwareness,
  useTongueAwarenessSession,
} from '@/components/game/speech/tongue-awareness/shared/tongueAwarenessShared';
import { useTongueAwareness } from '@/hooks/useTongueAwareness';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const TREATS = ['🍪', '🍓', '🧁', '🍌'] as const;

export function HungryTongueMonsterGame({ onBack, onComplete }: Props) {
  const session = useTongueAwarenessSession('hungry-tongue-monster', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [treatIdx, setTreatIdx] = useState(0);
  const [dancing, setDancing] = useState(false);
  const sense = useTongueAwareness(canPlay, 'hungry-tongue-monster', session.round);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    setTreatIdx(0);
    speakTongueAwareness('The monster uses a funny tongue. Tap treats to play!');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    setDancing(true);
    setTimeout(() => setDancing(false), 900);
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction();
    session.manager.recordExploration(`monster-treat:${TREATS[treatIdx]}`);
    if (next >= TONGUE_AWARENESS_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 700);
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  const onTreat = () => {
    setTreatIdx((i) => (i + 1) % TREATS.length);
    sense.interact();
  };

  return (
    <>
      <TongueAwarenessShell
        title="Hungry Tongue Monster"
        subtitle="Play with a silly tongue monster"
        skills="👾 Playful awareness"
        gradient={['#DCFCE7', '#FEF9C3']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Tap a treat. The monster tongue wiggles — no fail!"
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={[styles.monster, dancing && styles.monsterDance]}>👾</Text>
          <Text style={styles.tongue}>👅</Text>
          <View style={styles.treatRow}>
            {TREATS.map((t, i) => (
              <Pressable key={t} style={[styles.treat, i === treatIdx && styles.treatActive]} onPress={onTreat}>
                <Text style={styles.treatEmoji}>{t}</Text>
              </Pressable>
            ))}
          </View>
          {dancing && <Text style={styles.dance}>Monster dance! 🎉</Text>}
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
    justifyContent: 'center',
    padding: 14,
  },
  monster: { fontSize: 88 },
  monsterDance: { transform: [{ rotate: '8deg' }, { scale: 1.05 }] },
  tongue: { fontSize: 48, marginTop: -8, marginBottom: 12 },
  treatRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  treat: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    borderColor: 'rgba(22,163,74,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  treatActive: { borderColor: '#16A34A', backgroundColor: '#DCFCE7' },
  treatEmoji: { fontSize: 36 },
  dance: { marginTop: 14, fontSize: 18, fontWeight: '900', color: '#166534' },
});
