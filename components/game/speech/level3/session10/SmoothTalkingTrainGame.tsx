import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useFluentSession,
  DEFAULT_VOICE_ROUNDS,
  matchStep,
  useSpeechHitCounter,
  createBurstDetector,
  TRAIN_SYLLABLE_CHAIN,
  type SeqCue,
} from '@/components/game/speech/level3/shared/fluentSpeechGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const CHAINS_PER_ROUND = 2;

export function SmoothTalkingTrainGame({ onBack, onComplete }: Props) {
  const session = useFluentSession('smooth-talking-train', DEFAULT_VOICE_ROUNDS);
  const [chainDone, setChainDone] = useState(0);
  const [sylIndex, setSylIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const cue: SeqCue = TRAIN_SYLLABLE_CHAIN[sylIndex % TRAIN_SYLLABLE_CHAIN.length];
  const speech = useSpeechHitCounter(true, cue.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 320 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const trainX = useRef(new Animated.Value(0)).current;
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  const chainProgress = (chainDone + sylIndex / TRAIN_SYLLABLE_CHAIN.length) / CHAINS_PER_ROUND;

  useEffect(() => {
    speakGame('Keep talking smoothly — move the train!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setChainDone(0);
    setSylIndex(0);
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    trainX.setValue(0);
    burstRef.current.reset();
    speech.resetHits();
    speakGame(`Say ${TRAIN_SYLLABLE_CHAIN[0].label} — keep going!`);
  }, [session.round, trainX]);

  useEffect(() => {
    speech.resetHits();
    burstRef.current.reset();
    holdRef.current = null;
  }, [sylIndex]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current || lockRef.current) return;
      const { progress: p, matched } = matchStep(
        cue,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        cue.mode === 'hold' ? 700 : 500,
      );
      setProgress(p);
      if (!matched) return;
      lockRef.current = true;
      holdRef.current = null;
      setProgress(0);
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      const nextSyl = sylIndex + 1;
      const totalProgress = (chainDone + nextSyl / TRAIN_SYLLABLE_CHAIN.length) / CHAINS_PER_ROUND;
      Animated.timing(trainX, {
        toValue: Math.min(1, totalProgress),
        duration: 280,
        useNativeDriver: true,
      }).start();

      if (nextSyl >= TRAIN_SYLLABLE_CHAIN.length) {
        const nextChain = chainDone + 1;
        setChainDone(nextChain);
        setSylIndex(0);
        if (nextChain >= CHAINS_PER_ROUND) {
          roundDoneRef.current = true;
          speakGame('Smooth train ride!');
          setTimeout(() => session.completeRound(), 900);
        } else {
          speakGame('Keep the smooth sounds going!');
          setTimeout(() => {
            speakGame(`Say ${TRAIN_SYLLABLE_CHAIN[0].label}!`);
            lockRef.current = false;
          }, 500);
        }
      } else {
        setSylIndex(nextSyl);
        const next = TRAIN_SYLLABLE_CHAIN[nextSyl];
        speakGame(next.label);
        setTimeout(() => {
          lockRef.current = false;
        }, 400);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session, cue, sylIndex, chainDone, speech.useSpeech]);

  const translateX = trainX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  return (
    <>
      <VoiceGameFrame
        title="Smooth Talking Train"
        subtitle="Continuous syllables move the train"
        skills="🚂 Connected speech • 🔗 Smooth • 🗣️ Flow"
        gradient={['#DBEAFE', '#BFDBFE']}
        accent="#2563EB"
        onBack={onBack}
        progress={Math.floor(chainProgress * CHAINS_PER_ROUND * TRAIN_SYLLABLE_CHAIN.length)}
        progressTotal={CHAINS_PER_ROUND * TRAIN_SYLLABLE_CHAIN.length}
        roundLabel={`Chain ${chainDone + 1}/${CHAINS_PER_ROUND} · ${cue.label} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <View style={styles.track}>
                <Animated.Text style={[styles.train, { transform: [{ translateX }] }]}>
                  🚂
                </Animated.Text>
              </View>
              <Text style={styles.syl}>{cue.label}</Text>
              <Text style={styles.hint}>Keep saying each sound smoothly!</Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  track: {
    width: '90%',
    height: 56,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  train: { fontSize: 48, position: 'absolute', left: 0 },
  syl: { fontSize: 44, fontWeight: '900', color: '#1D4ED8' },
  hint: { fontSize: 16, fontWeight: '700', color: '#1E40AF', marginTop: 8 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 8 },
});
