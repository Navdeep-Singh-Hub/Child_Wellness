import {
  OralShell,
  OralOverlays,
  ORAL_INTERACTIONS_PER_ROUND,
  speakOral,
  useOralGameSession,
} from '@/components/game/speech/oral-sensory-tolerance/shared/oralSensoryShared';
import { useOralSensoryTolerance } from '@/hooks/useOralSensoryTolerance';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const OBJECTS = [
  { id: 'feather', emoji: '🪶', label: 'Soft feather' },
  { id: 'bubble', emoji: '🫧', label: 'Bubble' },
  { id: 'sparkle', emoji: '✨', label: 'Sparkle' },
  { id: 'leaf', emoji: '🍃', label: 'Leaf' },
  { id: 'heart', emoji: '💛', label: 'Warm heart' },
] as const;

export function CalmMouthAdventureGame({ onBack, onComplete }: Props) {
  const session = useOralGameSession('calm-mouth-adventure', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useOralSensoryTolerance(canPlay, 'calm-mouth-adventure', session.round);

  const items = useMemo(() => OBJECTS.slice(0, 3 + (sense.comfortLevel > 0.72 ? 2 : 1)), [sense.comfortLevel]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakOral('Calm adventure. Tap gentle objects. Watching is okay.');
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
    sense.interact(0.3);
    sense.engine.triggerReward('CALM_CELEBRATION');
  };

  const hint = sense.state === 'HELPING' ? 'Slow adventure now. One tap is enough.' : 'Tap any gentle object.';

  return (
    <>
      <OralShell
        title="Calm Mouth Adventure"
        subtitle="Explore gentle sensory objects"
        skills="🌿 Regulation · safe exploration"
        gradient={['#ECFCCB', '#E0E7FF']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={hint}
        startEmoji="🌿"
        startTitle="Gentle adventure"
        startHint="Tap slowly. Watching is okay. Every try counts."
        onGoodTry={sense.goodTry}
        onCalmDown={sense.calmDown}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.friend}>🙂</Text>
          <View style={styles.grid}>
            {items.map((o) => (
              <Pressable key={o.id} onPress={onTap} style={styles.tile}>
                <Text style={styles.emoji}>{o.emoji}</Text>
                <Text style={styles.label}>{o.label}</Text>
              </Pressable>
            ))}
          </View>
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
    minHeight: 360,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 2,
    borderColor: 'rgba(22,163,74,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  friend: { fontSize: 72, marginBottom: 10 },
  grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  tile: {
    width: '46%',
    maxWidth: 190,
    minHeight: 110,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(22,163,74,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  emoji: { fontSize: 44, marginBottom: 6 },
  label: { fontSize: 15, fontWeight: '900', color: '#0F172A', textAlign: 'center' },
});

