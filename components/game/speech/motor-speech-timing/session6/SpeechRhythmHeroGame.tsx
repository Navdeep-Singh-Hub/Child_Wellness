import {
  MotorSpeechTimingOverlays,
  MotorSpeechTimingShell,
  speakMotorSpeechTiming,
  useMotorSpeechTimingSession,
} from '@/components/game/speech/motor-speech-timing/shared/motorSpeechTimingShared';
import { CORE_RHYTHMS, RHYTHM_EMOJI } from '@/components/game/speech/motor-speech-timing/session6/rhythmBeatAssets';
import {
  Level6CameraLayer,
  Level6MirrorPreview,
  Level6StatusPill,
  useRhythmBeatAttempt,
} from '@/components/game/speech/motor-speech-timing/session6/useRhythmBeatAttempt';
import type { MotorSpeechTimingSessionManager } from '@/components/game/speech/motor-speech-timing/modules/MotorSpeechTimingSessionManager';
import type { MotorSpeechTimingSense } from '@/hooks/useMotorSpeechTiming';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const HERO_STEPS = ['Repeat rhythm', 'Copy mouth timing', 'Optional vocal beat'] as const;

function HeroPlay({
  sense,
  active,
  hits,
  setHits,
  manager,
  onRoundComplete,
}: {
  sense: MotorSpeechTimingSense;
  active: boolean;
  hits: number;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  manager: MotorSpeechTimingSessionManager;
  onRoundComplete: () => void;
}) {
  const step = HERO_STEPS[Math.min(hits, HERO_STEPS.length - 1)] ?? HERO_STEPS[0];
  const item = useMemo(() => CORE_RHYTHMS[hits % CORE_RHYTHMS.length] ?? CORE_RHYTHMS[0], [hits]);
  const { tryRhythm, mouth, target } = useRhythmBeatAttempt(
    sense,
    active,
    hits,
    setHits,
    manager,
    onRoundComplete,
    item.rhythm,
  );

  return (
    <View style={styles.stage}>
      <Level6CameraLayer sense={mouth} active={active} />
      <Level6MirrorPreview sense={mouth} active={active} />
      <Level6StatusPill sense={mouth} target={target} accent="#7C3AED" />
      <Text style={styles.hero}>🦸</Text>
      <View style={styles.badges}>
        {CORE_RHYTHMS.map((v, i) => (
          <View key={v.rhythm} style={[styles.badge, i <= hits && styles.badgeOn]}>
            <Text style={styles.badgeEmoji}>{RHYTHM_EMOJI[v.rhythm]}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.label}>{item.label}</Text>
      <View style={[styles.pulse, sense.rhythmPulse && styles.pulseOn]} />
      <Pressable style={styles.btn} onPress={tryRhythm}>
        <Text style={styles.btnText}>Rhythm hero! ✨</Text>
      </Pressable>
      {sense.rewardState === 'HERO' && <Text style={styles.celebrate}>Hero celebration!</Text>}
    </View>
  );
}

export function SpeechRhythmHeroGame({ onBack, onComplete }: Props) {
  const session = useMotorSpeechTimingSession('speech-rhythm-hero', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakMotorSpeechTiming('Speech rhythm hero! Repeat, copy mouth timing, celebrate — no fail!');
  }, [canPlay, session.round]);

  return (
    <>
      <MotorSpeechTimingShell
        gameId="speech-rhythm-hero"
        title="Speech Rhythm Hero"
        subtitle="Integrate timing readiness"
        skills="🦸 Hero play • 🎵 Speech rhythm"
        gradient={['#FEF3C7', '#E0E7FF']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint="Repeat rhythm, mouth timing, optional sound — no fail!"
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
      </MotorSpeechTimingShell>
      <MotorSpeechTimingOverlays
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
  label: { fontSize: 26, fontWeight: '900', color: '#6D28D9', marginVertical: 6 },
  pulse: {
    width: 100,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(124,58,237,0.25)',
    marginBottom: 10,
  },
  pulseOn: { backgroundColor: '#7C3AED' },
  btn: { paddingHorizontal: 26, paddingVertical: 14, borderRadius: 14, backgroundColor: '#7C3AED' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 10, fontSize: 17, fontWeight: '900', color: '#5B21B6' },
});
