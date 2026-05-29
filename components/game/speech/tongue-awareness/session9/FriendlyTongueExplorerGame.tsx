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

const ZONES = [
  { id: 'tongue', label: 'Tongue', emoji: '👅' },
  { id: 'mouth', label: 'Mouth', emoji: '😮' },
  { id: 'inside', label: 'Inside', emoji: '🫦' },
  { id: 'lips', label: 'Lips', emoji: '👄' },
] as const;

export function FriendlyTongueExplorerGame({ onBack, onComplete }: Props) {
  const session = useTongueAwarenessSession('friendly-tongue-explorer', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useTongueAwareness(canPlay, 'friendly-tongue-explorer', session.round);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakTongueAwareness('Hi friend! Tap mouth areas and notice your tongue.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction();
    session.manager.recordExploration(`${sense.promptZone}:${sense.explorationState}`);
    if (next >= TONGUE_AWARENESS_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 700);
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <TongueAwarenessShell
        title="Friendly Tongue Explorer"
        subtitle="Meet your tongue inside your mouth"
        skills="👅 Tongue awareness"
        gradient={['#FCE7F3', '#E0F2FE']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Explore ${sense.promptZone}. Any tap is wonderful!`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.buddy}>🦊</Text>
          <Text style={styles.buddyLine}>I have a tongue too!</Text>
          <View style={styles.grid}>
            {ZONES.map((z) => (
              <Pressable
                key={z.id}
                style={[styles.tile, sense.promptZone === z.id && styles.tileGlow]}
                onPress={() => sense.interact()}
              >
                <Text style={styles.emoji}>{z.emoji}</Text>
                <Text style={styles.label}>{z.label}</Text>
              </Pressable>
            ))}
          </View>
          {sense.rewardPulse && <Text style={styles.reward}>Happy tongue! ✨</Text>}
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
    padding: 14,
    alignItems: 'center',
  },
  buddy: { fontSize: 64 },
  buddyLine: { fontSize: 16, fontWeight: '800', color: '#831843', marginBottom: 10 },
  grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  tile: {
    width: '46%',
    minHeight: 108,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    borderColor: '#FBCFE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileGlow: { borderColor: '#DB2777', backgroundColor: '#FCE7F3' },
  emoji: { fontSize: 44 },
  label: { marginTop: 6, fontSize: 15, fontWeight: '900', color: '#0F172A' },
  reward: { marginTop: 12, fontSize: 18, fontWeight: '900', color: '#DB2777' },
});
