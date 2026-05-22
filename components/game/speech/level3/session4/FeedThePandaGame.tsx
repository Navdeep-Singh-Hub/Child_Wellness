import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useSyllableGameSession,
  DEFAULT_VOICE_ROUNDS,
  SYLLABLE_PA,
  tickSyllableMatch,
  useSpeechHitCounter,
  createBurstDetector,
} from '@/components/game/speech/level3/shared/syllableGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const BITES = 6;

export function FeedThePandaGame({ onBack, onComplete }: Props) {
  const session = useSyllableGameSession('feed-the-panda', DEFAULT_VOICE_ROUNDS);
  const [bites, setBites] = useState(0);
  const speech = useSpeechHitCounter(true, SYLLABLE_PA.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 400 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const pandaScale = useRef(new Animated.Value(1)).current;
  const roundDoneRef = useRef(false);

  useEffect(() => {
    speakGame('Say pa pa pa to feed the panda!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setBites(0);
    roundDoneRef.current = false;
    burstRef.current.reset();
    speech.resetHits();
    speakGame('Pa pa pa — feed the bamboo!');
  }, [session.round]);

  const feed = () => {
    if (roundDoneRef.current) return;
    Animated.sequence([
      Animated.timing(pandaScale, { toValue: 1.12, duration: 100, useNativeDriver: true }),
      Animated.timing(pandaScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setBites((b) => {
      const next = b + 1;
      if (next >= BITES) {
        roundDoneRef.current = true;
        speakGame('Panda is happy!');
        setTimeout(() => session.completeRound(), 900);
      }
      return next;
    });
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current) return;
      const { matched } = tickSyllableMatch(
        SYLLABLE_PA,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
      );
      if (matched) feed();
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech, pandaScale]);

  return (
    <>
      <VoiceGameFrame
        title="Feed the Panda"
        subtitle='Say “pa pa pa” to feed'
        skills="🐼 Repetition • 🅿️🅰 Pa • 🗣️ CV syllable"
        gradient={['#ECFDF5', '#A7F3D0']}
        accent="#059669"
        onBack={onBack}
        progress={bites}
        progressTotal={BITES}
        roundLabel={`Bites ${bites}/${BITES} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Animated.Text style={[styles.panda, { transform: [{ scale: pandaScale }] }]}>
                🐼
              </Animated.Text>
              <Text style={styles.bamboo}>🎋</Text>
              <Text style={styles.word}>Pa · Pa · Pa</Text>
              <Text style={styles.hint}>Each “pa” gives bamboo!</Text>
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
  panda: { fontSize: 96 },
  bamboo: { fontSize: 40, marginTop: 8 },
  word: { fontSize: 26, fontWeight: '900', color: '#047857', marginTop: 12 },
  hint: { fontSize: 15, fontWeight: '700', color: '#065F46' },
});
