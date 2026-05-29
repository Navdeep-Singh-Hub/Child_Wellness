import {
  OralShell,
  OralOverlays,
  ORAL_INTERACTIONS_PER_ROUND,
  speakOral,
  useOralGameSession,
} from '@/components/game/speech/oral-sensory-tolerance/shared/oralSensoryShared';
import { useOralSensoryTolerance } from '@/hooks/useOralSensoryTolerance';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function SoftSensoryMonsterGame({ onBack, onComplete }: Props) {
  const session = useOralGameSession('soft-sensory-monster', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [hug, setHug] = useState(false);
  const sense = useOralSensoryTolerance(canPlay, 'soft-sensory-monster', session.round);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    setHug(false);
    speakOral('Meet the soft monster. Tap gently for a calm hug.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction();
    if (next >= ORAL_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 700);
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  const onTap = () => {
    sense.interact(0.25);
    setHug(true);
    sense.engine.triggerReward('HUG');
    setTimeout(() => setHug(false), 800);
  };

  const hint =
    sense.state === 'HELPING'
      ? 'Tiny taps. Monster will wait.'
      : hug
        ? 'Hug time!'
        : 'Tap the monster gently.';

  return (
    <>
      <OralShell
        title="Soft Sensory Monster"
        subtitle="Friendly monster play"
        skills="🧸 Comfort · emotional safety"
        gradient={['#E9D5FF', '#DCFCE7']}
        accent="#22C55E"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={hint}
        startEmoji="🧸"
        startTitle="Monster is friendly"
        startHint="Tap gently. Watching is okay. Monster will always be kind."
        onGoodTry={sense.goodTry}
        onCalmDown={sense.calmDown}
        sense={sense}
      >
        <View style={styles.stage}>
          <Pressable onPress={onTap} style={[styles.monsterCard, hug && styles.monsterCardHug]}>
            <Text style={styles.monster}>{hug ? '🫂' : '👾'}</Text>
            <Text style={styles.monsterText}>{hug ? 'Soft hug!' : 'Tap me softly'}</Text>
            <View style={styles.softRow}>
              <Text style={styles.softItem}>🫧</Text>
              <Text style={styles.softItem}>✨</Text>
              <Text style={styles.softItem}>🌿</Text>
            </View>
          </Pressable>
        </View>
      </OralShell>
      <OralOverlays
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
    height: 360,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 2,
    borderColor: 'rgba(34,197,94,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  monsterCard: {
    width: '86%',
    maxWidth: 380,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(34,197,94,0.25)',
  },
  monsterCardHug: {
    transform: [{ scale: 1.02 }],
    backgroundColor: 'rgba(236,253,245,0.96)',
  },
  monster: { fontSize: 96 },
  monsterText: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#0F172A' },
  softRow: { flexDirection: 'row', gap: 14, marginTop: 14 },
  softItem: { fontSize: 26, opacity: 0.9 },
});

