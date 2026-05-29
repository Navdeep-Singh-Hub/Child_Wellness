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

const HIDES = [
  { id: 'left', label: 'Left peek', emoji: '👅' },
  { id: 'center', label: 'Center peek', emoji: '😛' },
  { id: 'right', label: 'Right peek', emoji: '👅' },
  { id: 'down', label: 'Down peek', emoji: '🫦' },
] as const;

export function TongueHideSeekGame({ onBack, onComplete }: Props) {
  const session = useTongueAwarenessSession('tongue-hide-seek', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [peekVisible, setPeekVisible] = useState(true);
  const sense = useTongueAwareness(canPlay, 'tongue-hide-seek', session.round);

  const active = useMemo(() => HIDES[(hits + session.round) % HIDES.length] ?? HIDES[0], [hits, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    setPeekVisible(true);
    speakTongueAwareness('Where is the funny tongue? Tap when you see it.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => setPeekVisible((v) => !v), sense.difficulty === 'easy' ? 1400 : 1100);
    return () => clearInterval(id);
  }, [canPlay, sense.difficulty]);

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction();
    session.manager.recordExploration(`peek:${active.id}`);
    if (next >= TONGUE_AWARENESS_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 700);
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <TongueAwarenessShell
        title="Tongue Hide & Seek"
        subtitle="Notice where the tongue peeks"
        skills="🔍 Tongue location"
        gradient={['#FEF9C3', '#DCFCE7']}
        accent="#CA8A04"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={peekVisible ? `Peek at ${active.label}! Tap anywhere.` : 'Waiting for peek… tap when ready.'}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.face}>🙂</Text>
          <Pressable
            style={[styles.peekZone, active.id === 'left' && styles.peekLeft, active.id === 'right' && styles.peekRight]}
            onPress={() => sense.interact()}
          >
            {peekVisible ? (
              <Text style={styles.peekEmoji}>{active.emoji}</Text>
            ) : (
              <Text style={styles.hideText}>…</Text>
            )}
          </Pressable>
          <Text style={styles.caption}>{peekVisible ? 'Giggle tongue!' : 'Where did it go?'}</Text>
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
    padding: 16,
  },
  face: { fontSize: 88, marginBottom: 8 },
  peekZone: {
    width: '88%',
    maxWidth: 340,
    minHeight: 120,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    borderColor: 'rgba(202,138,4,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  peekLeft: { alignItems: 'flex-start', paddingLeft: 28 },
  peekRight: { alignItems: 'flex-end', paddingRight: 28 },
  peekEmoji: { fontSize: 72 },
  hideText: { fontSize: 40, color: '#A16207', fontWeight: '900' },
  caption: { marginTop: 12, fontSize: 17, fontWeight: '900', color: '#713F12' },
});
