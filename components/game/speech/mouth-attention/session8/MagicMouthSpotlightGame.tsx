import {
  MOUTH_ATTENTION_INTERACTIONS_PER_ROUND,
  MouthAttentionOverlays,
  MouthAttentionShell,
  speakMouthAttention,
  useMouthAttentionSession,
} from '@/components/game/speech/mouth-attention/shared/mouthAttentionShared';
import { useMouthAttention } from '@/hooks/useMouthAttention';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function MagicMouthSpotlightGame({ onBack, onComplete }: Props) {
  const session = useMouthAttentionSession('magic-mouth-spotlight', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useMouthAttention(canPlay, 'magic-mouth-spotlight', session.round);
  const pulse = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMouthAttention('Follow the magic spotlight.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.92, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [canPlay, pulse]);

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
        title="Magic Mouth Spotlight"
        subtitle="Follow the glowing area"
        skills="✨ Attention shifting"
        gradient={['#EDE9FE', '#DBEAFE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Spotlight on ${sense.promptTarget}. Tap anywhere on it.`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.face}>🙂</Text>
          <Animated.View style={[styles.spotlight, { transform: [{ scale: pulse }] }]}>
            <Pressable onPress={() => sense.interact()} style={styles.spotlightTap}>
              <Text style={styles.spotlightText}>✨ {sense.promptTarget}</Text>
            </Pressable>
          </Animated.View>
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
    padding: 14,
  },
  face: { fontSize: 84, marginBottom: 14 },
  spotlight: {
    width: 240,
    height: 150,
    borderRadius: 80,
    backgroundColor: 'rgba(196,181,253,0.5)',
    borderWidth: 3,
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightTap: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.92)' },
  spotlightText: { fontSize: 18, fontWeight: '900', color: '#4C1D95' },
});

