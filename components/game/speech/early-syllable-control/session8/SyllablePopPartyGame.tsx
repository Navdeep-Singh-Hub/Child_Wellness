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
import type { EarlySyllableControlSessionManager } from '@/components/game/speech/early-syllable-control/modules/EarlySyllableControlSessionManager';
import type { EarlySyllableControlSense } from '@/hooks/useEarlySyllableControl';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const BALLOONS = ['🎈', '🎈', '🎈'] as const;

function PopPlay({
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
  const item = useMemo(
    () => CORE_SYLLABLES[(hits + sense.syllableAttempt) % CORE_SYLLABLES.length] ?? CORE_SYLLABLES[0],
    [hits, sense.syllableAttempt],
  );
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
      <Level6StatusPill sense={mouth} target={target} accent="#E11D48" />
      <View style={styles.row}>
        {BALLOONS.map((b, i) => (
          <Text key={i} style={[styles.balloon, i < hits && styles.popped]}>
            {i < hits ? '✨' : b}
          </Text>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.emoji}>{SYLLABLE_EMOJI[item.syllable]}</Text>
        <Text style={styles.label}>{item.label}</Text>
      </View>
      <Pressable style={styles.btn} onPress={trySyllable}>
        <Text style={styles.btnText}>Syllable pop! 🎈</Text>
      </Pressable>
      {sense.rewardPulse && <Text style={styles.celebrate}>Pop party!</Text>}
    </View>
  );
}

export function SyllablePopPartyGame({ onBack, onComplete }: Props) {
  const session = useEarlySyllableControlSession('syllable-pop-party', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakEarlySyllable('Syllable pop party! Try MA, PA, or BA — any version counts.');
  }, [canPlay, session.round]);

  return (
    <>
      <EarlySyllableControlShell
        gameId="syllable-pop-party"
        title="Syllable Pop Party"
        subtitle="MA, PA, BA tries"
        skills="🎈 Syllable tries • 🗣️ Speech readiness"
        gradient={['#FEF2F2', '#FFF7ED']}
        accent="#E11D48"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Try a syllable — mouth or sound, then pop!"
        startEmoji="🎈"
        progressLabel="pops"
      >
        {(sense) => (
          <PopPlay
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
  stage: { minHeight: 340, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  balloon: { fontSize: 48 },
  popped: { fontSize: 36 },
  card: {
    width: '88%',
    maxWidth: 320,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 3,
    borderColor: 'rgba(225,29,72,0.35)',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emoji: { fontSize: 72 },
  label: { marginTop: 8, fontSize: 28, fontWeight: '900', color: '#BE123C' },
  btn: {
    marginTop: 14,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#E11D48',
  },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 10, fontSize: 16, fontWeight: '900', color: '#BE123C' },
});
