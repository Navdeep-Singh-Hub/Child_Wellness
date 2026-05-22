import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  useAnimalSoundSession,
  DEFAULT_VOICE_ROUNDS,
  MATCH_ANIMALS,
  tickSoundMatch,
  useSpeechHitCounter,
  createBurstDetector,
  type SoundCue,
} from '@/components/game/speech/level3/shared/animalSoundGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Phase = 'listen' | 'pick' | 'say' | 'success';

const MATCHES_PER_ROUND = 4;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function AnimalSoundMatchGame({ onBack, onComplete }: Props) {
  const session = useAnimalSoundSession('animal-sound-match', DEFAULT_VOICE_ROUNDS);
  const [index, setIndex] = useState(0);
  const [matches, setMatches] = useState(0);
  const [phase, setPhase] = useState<Phase>('listen');
  const [progress, setProgress] = useState(0);
  const target: SoundCue = MATCH_ANIMALS[index % MATCH_ANIMALS.length];
  const options = useMemo(() => {
    const others = MATCH_ANIMALS.filter((a) => a.id !== target.id);
    return shuffle([target, ...shuffle(others).slice(0, 2)]);
  }, [target.id, index]);

  const speech = useSpeechHitCounter(phase === 'say', target.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 500 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const busyRef = useRef(false);

  const startRound = (cue: SoundCue) => {
    busyRef.current = true;
    setPhase('listen');
    setProgress(0);
    holdRef.current = null;
    speakGame(`Listen! ${cue.speak}`);
    scheduleGameSpeech('Which animal was that? Tap it!', 1400);
    setTimeout(() => {
      setPhase('pick');
      busyRef.current = false;
    }, 1500);
  };

  useEffect(() => {
    speakGame('Match the sound to the animal!');
    startRound(MATCH_ANIMALS[0]);
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setIndex(0);
    setMatches(0);
    roundDoneRef.current = false;
    startRound(MATCH_ANIMALS[0]);
  }, [session.round]);

  const onPick = (cue: SoundCue) => {
    if (phase !== 'pick' || busyRef.current) return;
    if (cue.id !== target.id) {
      speakGame('Try again!');
      return;
    }
    busyRef.current = true;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    speakGame(`Yes! Now say ${target.label}!`);
    setPhase('say');
    speech.resetHits();
    burstRef.current.reset();
    holdRef.current = null;
    busyRef.current = false;
  };

  const finishMatch = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setPhase('success');
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    speakGame('Perfect match!');
    setTimeout(() => {
      const next = matches + 1;
      setMatches(next);
      if (next >= MATCHES_PER_ROUND) {
        roundDoneRef.current = true;
        setTimeout(() => session.completeRound(), 800);
      } else {
        const nextIdx = index + 1;
        setIndex(nextIdx);
        startRound(MATCH_ANIMALS[nextIdx % MATCH_ANIMALS.length]);
      }
      busyRef.current = false;
    }, 700);
  };

  useEffect(() => {
    if (phase !== 'say' || session.gameFinished || roundDoneRef.current) return;
    const tick = setInterval(() => {
      const { progress: p, matched } = tickSoundMatch(
        target,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        target.mode === 'burst' ? 500 : 800,
      );
      setProgress(p);
      if (matched) finishMatch();
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, target, speech.useSpeech, matches, index]);

  return (
    <>
      <VoiceGameFrame
        title="Animal Sound Match"
        subtitle="Listen → pick → say the sound"
        skills="👂 Listening • 🗣️ Speech • 🐾 Sound play"
        gradient={['#FEF3C7', '#FDE68A']}
        accent="#D97706"
        onBack={onBack}
        progress={matches}
        progressTotal={MATCHES_PER_ROUND}
        roundLabel={`Matches ${matches}/${MATCHES_PER_ROUND} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.area}>
              <Text style={styles.phase}>
                {phase === 'listen'
                  ? '👂 Listen…'
                  : phase === 'pick'
                    ? 'Tap the animal!'
                    : phase === 'say'
                      ? `Say: ${target.label}`
                      : '⭐'}
              </Text>
              {phase === 'pick' && (
                <View style={styles.grid}>
                  {options.map((o) => (
                    <Pressable
                      key={o.id}
                      style={styles.card}
                      onPress={() => onPick(o)}
                    >
                      <Text style={styles.cardEmoji}>{o.emoji}</Text>
                      <Text style={styles.cardLabel}>{o.label}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
              {(phase === 'listen' || phase === 'say') && (
                <Text style={styles.bigEmoji}>{target.emoji}</Text>
              )}
              {phase === 'say' && (
                <View style={styles.bar}>
                  <View style={[styles.fill, { width: `${progress * 100}%` }]} />
                </View>
              )}
            </View>
          );
        }}
      </VoiceGameFrame>
      <VoiceGameOverlays
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
  area: { flex: 1, alignItems: 'center', paddingTop: 8 },
  phase: { fontSize: 20, fontWeight: '900', color: '#92400E', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  card: {
    width: 100,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCD34D',
  },
  cardEmoji: { fontSize: 44 },
  cardLabel: { fontWeight: '800', color: '#78350F', marginTop: 4 },
  bigEmoji: { fontSize: 88, marginTop: 24 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 8 },
});
