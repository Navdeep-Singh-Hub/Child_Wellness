import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useSyllableGameSession,
  DEFAULT_VOICE_ROUNDS,
  SYLLABLE_MAMA,
  tickSyllableMatch,
  useSpeechHitCounter,
  createBurstDetector,
} from '@/components/game/speech/level3/shared/syllableGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const CALLS_NEEDED = 3;
const HOLD_MS = 1000;

export function BabyCallsMamaGame({ onBack, onComplete }: Props) {
  const session = useSyllableGameSession('baby-calls-mama', DEFAULT_VOICE_ROUNDS);
  const [calls, setCalls] = useState(0);
  const [progress, setProgress] = useState(0);
  const speech = useSpeechHitCounter(true, SYLLABLE_MAMA.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 600 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const babyY = useRef(new Animated.Value(0)).current;
  const roundDoneRef = useRef(false);
  const callLockRef = useRef(false);

  useEffect(() => {
    speakGame('Help the baby call Mama!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setCalls(0);
    setProgress(0);
    roundDoneRef.current = false;
    callLockRef.current = false;
    burstRef.current.reset();
    holdRef.current = null;
    speech.resetHits();
    babyY.setValue(0);
    speakGame('Say Mama!');
  }, [session.round, babyY]);

  const onCall = () => {
    if (roundDoneRef.current) return;
    holdRef.current = null;
    setProgress(0);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    Animated.sequence([
      Animated.timing(babyY, { toValue: -20, duration: 150, useNativeDriver: true }),
      Animated.timing(babyY, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
    speakGame('Mama!');
    setCalls((c) => {
      const next = c + 1;
      if (next >= CALLS_NEEDED) {
        roundDoneRef.current = true;
        setTimeout(() => {
          speakGame('Baby found Mama! Wonderful!');
          setTimeout(() => session.completeRound(), 1000);
        }, 400);
      }
      return next;
    });
    setTimeout(() => {
      callLockRef.current = false;
    }, 700);
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current) return;
      const { progress: p, matched } = tickSyllableMatch(
        SYLLABLE_MAMA,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        HOLD_MS,
      );
      setProgress(p);
      if (matched) onCall();
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech, babyY]);

  return (
    <>
      <VoiceGameFrame
        title="Baby Calls Mama"
        subtitle='Say “Mama”'
        skills="👶 Functional speech • 💬 Mama • ❤️ Communication"
        gradient={['#FFF1F2', '#FECDD3']}
        accent="#E11D48"
        onBack={onBack}
        progress={calls}
        progressTotal={CALLS_NEEDED}
        roundLabel={`Mama calls ${calls}/${CALLS_NEEDED} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.scene}>
              <Animated.Text style={[styles.baby, { transform: [{ translateY: babyY }] }]}>
                👶
              </Animated.Text>
              <Text style={styles.mama}>{calls > 0 ? '👩‍👧' : '👩'}</Text>
              <Text style={styles.word}>Mama</Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.hint}>Say “Mama!” clearly</Text>
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
  scene: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  baby: { fontSize: 72 },
  mama: { fontSize: 64, marginTop: 16 },
  word: { fontSize: 36, fontWeight: '900', color: '#BE123C', marginTop: 8 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#F43F5E', borderRadius: 8 },
  hint: { marginTop: 10, fontWeight: '800', color: '#9F1239' },
});
