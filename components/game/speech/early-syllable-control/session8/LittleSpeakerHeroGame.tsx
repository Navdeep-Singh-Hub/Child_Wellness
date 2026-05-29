import {
  EarlySyllableControlOverlays,
  EarlySyllableControlShell,
  speakEarlySyllable,
  useEarlySyllableControlSession,
} from '@/components/game/speech/early-syllable-control/shared/earlySyllableControlShared';
import { CORE_SYLLABLES, SYLLABLE_EMOJI } from '@/components/game/speech/early-syllable-control/session8/syllableAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useSyllableAttempt,
} from '@/components/game/speech/early-syllable-control/session8/useSyllableAttempt';
import type { EarlySyllable } from '@/components/game/speech/early-syllable-control/modules/earlySyllableControlTypes';
import type { EarlySyllableControlSessionManager } from '@/components/game/speech/early-syllable-control/modules/EarlySyllableControlSessionManager';
import type { EarlySyllableControlSense } from '@/hooks/useEarlySyllableControl';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const HERO_STEPS = ['Watch mouth', 'Speech chunk try', 'Playful repeat'] as const;

const HERO_SYLLABLES: { syllable: EarlySyllable; label: string }[] = [
  ...CORE_SYLLABLES,
  { syllable: 'moo', label: 'OO' },
  { syllable: 'aaa', label: 'AAA' },
];

function HeroPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  sense: EarlySyllableControlSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: EarlySyllableControlSessionManager;
  onRoundComplete: () => void;
}) {
  const step = HERO_STEPS[Math.min(hits, HERO_STEPS.length - 1)] ?? HERO_STEPS[0];
  const item = useMemo(() => HERO_SYLLABLES[hits % HERO_SYLLABLES.length] ?? HERO_SYLLABLES[0], [hits]);
  const { trySyllable, mouth, target } = useSyllableAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    item.syllable,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#7C3AED" />
      <Text style={styles.hero}>🦸</Text>
      <View style={styles.badges}>
        {HERO_SYLLABLES.slice(0, 4).map((v, i) => (
          <View key={v.syllable} style={[styles.badge, i <= hits && styles.badgeOn]}>
            <Text style={styles.badgeEmoji}>{SYLLABLE_EMOJI[v.syllable]}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.label}>{item.label}</Text>
      <Pressable style={styles.btn} onPress={trySyllable}>
        <Text style={styles.btnText}>Little speaker! ✨</Text>
      </Pressable>
      {sense.rewardState === 'HERO' && <Text style={styles.celebrate}>Hero celebration!</Text>}
    </View>
  );
}

export function LittleSpeakerHeroGame({ onBack, onComplete }: Props) {
  const session = useEarlySyllableControlSession('little-speaker-hero', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakEarlySyllable('Little speaker hero! MA, PA, BA, OO, AAA — watch, try, celebrate!');
  }, [canPlay, session.round]);

  return (
    <>
      <EarlySyllableControlShell
        gameId="little-speaker-hero"
        title="Little Speaker Hero"
        subtitle="Early syllable integration"
        skills="🦸 Hero play • 🗣️ Syllable readiness"
        gradient={['#FEF3C7', '#E0E7FF']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Watch, try a chunk, repeat playfully — no fail!"
        startEmoji="🦸"
      >
        {(sense) => (
          <HeroPlay
            sense={sense}
            active={canPlay && !session.gameFinished}
            hits={hits}
            setHits={setHits}
            manager={session.manager}
            onRoundComplete={session.completeRound}
          />
        )}
      </EarlySyllableControlShell>
      <EarlySyllableControlOverlays
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
  stage: { minHeight: 340, alignItems: 'center', padding: 10 },
  hero: { fontSize: 52 },
  badges: { flexDirection: 'row', gap: 8, marginVertical: 10 },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 2,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOn: { backgroundColor: '#EDE9FE', borderColor: '#7C3AED' },
  badgeEmoji: { fontSize: 24 },
  step: { fontSize: 16, fontWeight: '900', color: '#5B21B6' },
  label: { fontSize: 28, fontWeight: '900', color: '#6D28D9', marginVertical: 6 },
  btn: { paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14, backgroundColor: '#7C3AED' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 10, fontSize: 17, fontWeight: '900', color: '#5B21B6' },
});
