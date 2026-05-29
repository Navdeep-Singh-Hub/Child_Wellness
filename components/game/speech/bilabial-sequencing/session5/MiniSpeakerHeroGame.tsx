import {
  BilabialSequencingOverlays,
  BilabialSequencingShell,
  speakBilabialSequencing,
  useBilabialSequencingSession,
} from '@/components/game/speech/bilabial-sequencing/shared/bilabialSequencingShared';
import { CORE_REPEATS, REPEAT_EMOJI } from '@/components/game/speech/bilabial-sequencing/session5/bilabialRepeatAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useBilabialRepeatAttempt,
} from '@/components/game/speech/bilabial-sequencing/session5/useBilabialRepeatAttempt';
import type { BilabialSequencingSessionManager } from '@/components/game/speech/bilabial-sequencing/modules/BilabialSequencingSessionManager';
import type { BilabialSequencingSense } from '@/hooks/useBilabialSequencing';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const HERO_STEPS = ['Watch avatar', 'Repeat movement', 'Optional sound'] as const;

const HERO_REPEATS = [...CORE_REPEATS, { repeat: 'mmm' as const, label: 'MMM' }];

function HeroPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  sense: BilabialSequencingSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: BilabialSequencingSessionManager;
  onRoundComplete: () => void;
}) {
  const step = HERO_STEPS[Math.min(hits, HERO_STEPS.length - 1)] ?? HERO_STEPS[0];
  const item = useMemo(() => HERO_REPEATS[hits % HERO_REPEATS.length] ?? HERO_REPEATS[0], [hits]);
  const { tryRepeat, mouth, target } = useBilabialRepeatAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    item.repeat,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#7C3AED" />
      <Text style={styles.hero}>🦸</Text>
      <View style={styles.badges}>
        {HERO_REPEATS.map((v, i) => (
          <View key={v.repeat} style={[styles.badge, i <= hits && styles.badgeOn]}>
            <Text style={styles.badgeEmoji}>{REPEAT_EMOJI[v.repeat]}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.pattern}>{item.label}</Text>
      <Pressable style={styles.btn} onPress={tryRepeat}>
        <Text style={styles.btnText}>Speaker hero! ✨</Text>
      </Pressable>
      {sense.rewardState === 'HERO' && <Text style={styles.celebrate}>Hero celebration!</Text>}
    </View>
  );
}

export function MiniSpeakerHeroGame({ onBack, onComplete }: Props) {
  const session = useBilabialSequencingSession('mini-speaker-hero', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakBilabialSequencing('Mini speaker hero! MA, PA, BA, MMM — watch, repeat, celebrate!');
  }, [canPlay, session.round]);

  return (
    <>
      <BilabialSequencingShell
        gameId="mini-speaker-hero"
        title="Mini Speaker Hero"
        subtitle="Bilabial sequencing challenge"
        skills="🦸 Hero play • 🗣️ Repetition integration"
        gradient={['#FEF3C7', '#E0E7FF']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Watch, repeat movement, optional sound — no fail!"
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
      </BilabialSequencingShell>
      <BilabialSequencingOverlays
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
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginVertical: 10 },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 2,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOn: { backgroundColor: '#EDE9FE', borderColor: '#7C3AED' },
  badgeEmoji: { fontSize: 22 },
  step: { fontSize: 16, fontWeight: '900', color: '#5B21B6' },
  pattern: { fontSize: 28, fontWeight: '900', color: '#6D28D9', marginVertical: 6 },
  btn: { paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14, backgroundColor: '#7C3AED' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 10, fontSize: 17, fontWeight: '900', color: '#5B21B6' },
});
