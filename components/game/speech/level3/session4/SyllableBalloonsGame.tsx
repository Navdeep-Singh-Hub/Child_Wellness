import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useSyllableGameSession,
  DEFAULT_VOICE_ROUNDS,
  tickSyllableMatch,
  useSpeechHitCounter,
  createBurstDetector,
  type SyllableCue,
  SYLLABLE_MA,
  SYLLABLE_PA,
  SYLLABLE_MOO,
  SYLLABLE_PEE,
  SYLLABLE_BA,
} from '@/components/game/speech/level3/shared/syllableGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUND_CUES: SyllableCue[] = [
  SYLLABLE_MA,
  SYLLABLE_PA,
  SYLLABLE_MOO,
  SYLLABLE_PEE,
  SYLLABLE_BA,
];

export function SyllableBalloonsGame({ onBack, onComplete }: Props) {
  const session = useSyllableGameSession('syllable-balloons', DEFAULT_VOICE_ROUNDS);
  const [cueIndex, setCueIndex] = useState(0);
  const [inflated, setInflated] = useState(0);
  const cue = ROUND_CUES[cueIndex % ROUND_CUES.length];
  const speech = useSpeechHitCounter(true, cue.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 450 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const balloonScale = useRef(new Animated.Value(0.35)).current;
  const roundDoneRef = useRef(false);
  const busyRef = useRef(false);

  useEffect(() => {
    speakGame('Say each syllable to blow up the balloon!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setCueIndex(0);
    setInflated(0);
    roundDoneRef.current = false;
    busyRef.current = false;
    balloonScale.setValue(0.35);
    burstRef.current.reset();
    speakGame(`Say ${cue.label}!`);
  }, [session.round, balloonScale]);

  useEffect(() => {
    speech.resetHits();
    burstRef.current.reset();
    holdRef.current = null;
    balloonScale.setValue(0.35);
    speakGame(`Say ${cue.label}!`);
  }, [cue.label]);

  const inflate = () => {
    if (roundDoneRef.current || busyRef.current) return;
    busyRef.current = true;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    Animated.timing(balloonScale, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setInflated((n) => n + 1);
      const nextIdx = cueIndex + 1;
      if (nextIdx >= ROUND_CUES.length) {
        roundDoneRef.current = true;
        speakGame('All balloons big!');
        setTimeout(() => session.completeRound(), 900);
      } else {
        setCueIndex(nextIdx);
        busyRef.current = false;
        balloonScale.setValue(0.35);
      }
    });
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current || busyRef.current) return;
      const { matched } = tickSyllableMatch(
        cue,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        cue.mode === 'hold' ? 800 : 650,
      );
      if (matched) inflate();
    }, 50);
    return () => clearInterval(tick);
  }, [session, cue, cueIndex, speech.useSpeech, balloonScale]);

  return (
    <>
      <VoiceGameFrame
        title="Syllable Balloons"
        subtitle="Each syllable inflates the balloon"
        skills="🎈 Timing • 🗣️ ma pa moo • 🎯 Syllables"
        gradient={['#FEF3C7', '#FDE68A']}
        accent="#D97706"
        onBack={onBack}
        progress={inflated}
        progressTotal={ROUND_CUES.length}
        roundLabel={`Balloon ${inflated + 1}/${ROUND_CUES.length} · ${cue.label}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Animated.Text style={[styles.balloon, { transform: [{ scale: balloonScale }] }]}>
                🎈
              </Animated.Text>
              <Text style={styles.syllable}>{cue.label}</Text>
              <Text style={styles.hint}>Say “{cue.label}” to inflate!</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  balloon: { fontSize: 88 },
  syllable: { fontSize: 48, fontWeight: '900', color: '#B45309', marginTop: 16 },
  hint: { fontSize: 16, fontWeight: '800', color: '#92400E', marginTop: 8 },
});
