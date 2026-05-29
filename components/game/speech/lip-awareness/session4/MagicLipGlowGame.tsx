import {
  DEFAULT_LIP_ROUNDS,
  LIP_INTERACTIONS_PER_ROUND,
  LipAwarenessGameFrame,
  LipGameOverlays,
  clearLipSpeech,
  hapticLipSuccess,
  speakLip,
  useLipAwarenessGameSession,
} from '@/components/game/speech/lip-awareness/shared/lipAwarenessShared';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const GLOWS = [
  { id: 'pink', emoji: '💗', color: '#EC4899', label: 'Pink glow' },
  { id: 'gold', emoji: '✨', color: '#D97706', label: 'Gold glow' },
  { id: 'blue', emoji: '💙', color: '#3B82F6', label: 'Blue glow' },
] as const;

export function MagicLipGlowGame({ onBack, onComplete }: Props) {
  const session = useLipAwarenessGameSession('magic-lip-glow', DEFAULT_LIP_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const [lit, setLit] = useState<Record<string, boolean>>({});

  useEffect(() => {
    speakLip('Magic Lip Glow! Tap each lip for a soft sparkle.');
    return () => clearLipSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startRound();
    setHits(0);
    setLit({});
    speakLip('Tap the lips — watch them glow!');
  }, [session.round, canPlay]);

  const onGlowTap = useCallback(
    (id: string) => {
      const next = hits + 1;
      setHits(next);
      setLit((l) => ({ ...l, [id]: true }));
      session.manager.recordInteraction(`glow-${id}`);
      hapticLipSuccess();
      if (next >= LIP_INTERACTIONS_PER_ROUND) {
        speakLip('Soft magic sparkles everywhere!');
        setTimeout(() => session.completeRound(), 1000);
      } else {
        speakLip('Beautiful glow!');
      }
    },
    [hits, session],
  );

  return (
    <>
      <LipAwarenessGameFrame
        title="Magic Lip Glow"
        subtitle="Tap lips — see magic glow"
        skills="💋 Tap • ✨ Sparkle • 🌈 Playful"
        gradient={['#F5F3FF', '#EDE9FE']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        startEmoji="✨"
      >
        {() => <MagicGlowPlay hits={hits} lit={lit} onGlowTap={onGlowTap} />}
      </LipAwarenessGameFrame>
      <LipGameOverlays {...session} onBack={onBack} onComplete={onComplete} message="Magic lip explorer!" />
    </>
  );
}

function MagicGlowPlay({
  hits,
  lit,
  onGlowTap,
}: {
  hits: number;
  lit: Record<string, boolean>;
  onGlowTap: (id: string) => void;
}) {
  const nextId = GLOWS[hits % GLOWS.length]?.id;

  return (
    <View style={styles.center}>
      <Text style={styles.title}>👄 Magic lips</Text>
      <View style={styles.row}>
        {GLOWS.map((g) => (
          <Pressable
            key={g.id}
            style={[
              styles.glowBtn,
              { borderColor: g.color },
              lit[g.id] && { backgroundColor: `${g.color}44` },
              nextId === g.id && styles.highlight,
            ]}
            onPress={() => onGlowTap(g.id)}
          >
            <Text style={styles.glowEmoji}>{lit[g.id] ? `${g.emoji}👄` : '👄'}</Text>
            <Text style={[styles.glowLabel, { color: g.color }]}>{g.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>Tap any lip — each one glows differently!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center', color: '#5B21B6', marginBottom: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  glowBtn: {
    width: 110,
    padding: 14,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  highlight: { transform: [{ scale: 1.05 }] },
  glowEmoji: { fontSize: 40 },
  glowLabel: { fontSize: 12, fontWeight: '800', marginTop: 6 },
  hint: { marginTop: 20, fontSize: 15, fontWeight: '700', color: '#6D28D9', textAlign: 'center' },
});
