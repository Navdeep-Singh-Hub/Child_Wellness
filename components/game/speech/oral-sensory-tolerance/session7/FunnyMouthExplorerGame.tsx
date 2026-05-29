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

type Step = { id: 'lips' | 'tongue' | 'teeth'; title: string; emoji: string; detail: string };

const STEPS: Step[] = [
  { id: 'lips', title: 'Lips', emoji: '👄', detail: 'Soft and safe' },
  { id: 'tongue', title: 'Tongue', emoji: '👅', detail: 'Wiggle-friendly' },
  { id: 'teeth', title: 'Teeth', emoji: '🦷', detail: 'Strong and gentle' },
];

export function FunnyMouthExplorerGame({ onBack, onComplete }: Props) {
  const session = useOralGameSession('funny-mouth-explorer', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useOralSensoryTolerance(canPlay, 'funny-mouth-explorer', session.round);

  const step = useMemo(() => STEPS[(hits % STEPS.length) as number] ?? STEPS[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakOral('Mouth explorer. Tap the big picture. Watching is okay.');
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

  const onExplore = () => {
    sense.interact(0.28);
    sense.engine.triggerReward('SPARKLE');
  };

  const hint = sense.state === 'HELPING' ? 'Slow and safe. One tap is enough.' : `Explore ${step.title.toLowerCase()} safely.`;

  return (
    <>
      <OralShell
        title="Funny Mouth Explorer"
        subtitle="Friendly mouth parts"
        skills="👄 Oral visuals · comfort"
        gradient={['#FFE4E6', '#E0F2FE']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={hint}
        startEmoji="👄"
        startTitle="Mouth pictures are safe"
        startHint="Tap the big picture gently. Watching is okay. Every try counts."
        onGoodTry={sense.goodTry}
        onCalmDown={sense.calmDown}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.friend}>🧸</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Pressable onPress={onExplore} style={[styles.bigCard, { transform: [{ scale: 0.95 + 0.08 * sense.sensoryIntensity }] }]}>
            <Text style={styles.bigEmoji}>{step.emoji}</Text>
            <Text style={styles.detail}>{step.detail}</Text>
            <Text style={styles.tapHint}>Tap</Text>
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
    borderColor: 'rgba(219,39,119,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  friend: { fontSize: 72, marginBottom: 6 },
  title: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 10 },
  bigCard: {
    width: '86%',
    maxWidth: 360,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(219,39,119,0.22)',
  },
  bigEmoji: { fontSize: 92 },
  detail: { marginTop: 10, fontSize: 16, fontWeight: '800', color: '#334155' },
  tapHint: { marginTop: 8, fontSize: 14, fontWeight: '900', color: '#DB2777' },
});

