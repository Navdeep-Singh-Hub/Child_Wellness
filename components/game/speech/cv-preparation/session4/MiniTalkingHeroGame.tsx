import {
  CVPreparationOverlays,
  CVPreparationShell,
  speakCVPreparation,
  useCVPreparationSession,
} from '@/components/game/speech/cv-preparation/shared/cvPreparationShared';
import { CORE_CV, PATTERN_EMOJI } from '@/components/game/speech/cv-preparation/session4/cvPatternAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useCVPatternAttempt,
} from '@/components/game/speech/cv-preparation/session4/useCVPatternAttempt';
import type { CVPreparationSessionManager } from '@/components/game/speech/cv-preparation/modules/CVPreparationSessionManager';
import type { CVPreparationSense } from '@/hooks/useCVPreparation';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const HERO_STEPS = ['Watch mouth', 'Copy pattern', 'Optional sound'] as const;

function HeroPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  sense: CVPreparationSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: CVPreparationSessionManager;
  onRoundComplete: () => void;
}) {
  const step = HERO_STEPS[Math.min(hits, HERO_STEPS.length - 1)] ?? HERO_STEPS[0];
  const item = useMemo(() => CORE_CV[hits % CORE_CV.length] ?? CORE_CV[0], [hits]);
  const { tryPattern, mouth, target } = useCVPatternAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    item.pattern,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#EA580C" />
      <Text style={styles.hero}>🦸</Text>
      <View style={styles.badges}>
        {CORE_CV.map((v, i) => (
          <View key={v.pattern} style={[styles.badge, i <= hits && styles.badgeOn]}>
            <Text style={styles.badgeEmoji}>{PATTERN_EMOJI[v.pattern]}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.pattern}>{item.label}</Text>
      <Pressable style={styles.btn} onPress={tryPattern}>
        <Text style={styles.btnText}>Hero try! ✨</Text>
      </Pressable>
      {sense.rewardState === 'HERO' && <Text style={styles.celebrate}>Hero celebration!</Text>}
    </View>
  );
}

export function MiniTalkingHeroGame({ onBack, onComplete }: Props) {
  const session = useCVPreparationSession('mini-talking-hero', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakCVPreparation('Mini talking hero! Watch, copy, celebrate — no fail, every try counts.');
  }, [canPlay, session.round]);

  return (
    <>
      <CVPreparationShell
        gameId="mini-talking-hero"
        title="Mini Talking Hero"
        subtitle="Integrate speech readiness"
        skills="🦸 Hero play • 🗣️ CV integration"
        gradient={['#FEF3C7', '#E0E7FF']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Watch, copy pattern, optional sound — no fail!"
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
      </CVPreparationShell>
      <CVPreparationOverlays
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
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOn: { backgroundColor: '#FFEDD5', borderColor: '#EA580C' },
  badgeEmoji: { fontSize: 24 },
  step: { fontSize: 16, fontWeight: '900', color: '#9A3412' },
  pattern: { fontSize: 28, fontWeight: '900', color: '#C2410C', marginVertical: 6 },
  btn: { paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14, backgroundColor: '#EA580C' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 10, fontSize: 17, fontWeight: '900', color: '#C2410C' },
});
