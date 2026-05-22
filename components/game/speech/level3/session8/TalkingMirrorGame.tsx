import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  scheduleGameSpeech,
  useListenRepeatSession,
  DEFAULT_VOICE_ROUNDS,
  matchStep,
  useSpeechHitCounter,
  createBurstDetector,
  LISTEN_WORD_POOL,
  type ListenPhase,
  type SeqCue,
} from '@/components/game/speech/level3/shared/listenRepeatGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const MIRROR_WORDS: SeqCue[] = LISTEN_WORD_POOL.slice(0, 5);

export function TalkingMirrorGame({ onBack, onComplete }: Props) {
  const session = useListenRepeatSession('talking-mirror', DEFAULT_VOICE_ROUNDS);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [phase, setPhase] = useState<ListenPhase>('listen');
  const [progress, setProgress] = useState(0);
  const cue: SeqCue = MIRROR_WORDS[index % MIRROR_WORDS.length];
  const speech = useSpeechHitCounter(phase === 'say', cue.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 500 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const busyRef = useRef(false);
  const avatarScale = useRef(new Animated.Value(1)).current;
  const childScale = useRef(new Animated.Value(1)).current;

  const pulseAvatar = () => {
    Animated.sequence([
      Animated.timing(avatarScale, { toValue: 1.12, duration: 120, useNativeDriver: true }),
      Animated.timing(avatarScale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const playAvatar = (c: SeqCue) => {
    busyRef.current = true;
    setPhase('listen');
    setProgress(0);
    pulseAvatar();
    speakGame(c.speak);
    scheduleGameSpeech('Copy me in the mirror!', 1100);
    setTimeout(() => {
      setPhase('say');
      speech.resetHits();
      burstRef.current.reset();
      holdRef.current = null;
      busyRef.current = false;
    }, 1300);
  };

  useEffect(() => {
    speakGame('Watch the mirror friend, then repeat!');
    playAvatar(MIRROR_WORDS[0]);
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setIndex(0);
    setDone(0);
    roundDoneRef.current = false;
    playAvatar(MIRROR_WORDS[0]);
  }, [session.round]);

  useEffect(() => {
    if (phase !== 'say' || session.gameFinished || roundDoneRef.current || busyRef.current) return;
    const tick = setInterval(() => {
      const { progress: p, matched } = matchStep(
        cue,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
      );
      setProgress(p);
      if (!matched) return;
      busyRef.current = true;
      Animated.sequence([
        Animated.timing(childScale, { toValue: 1.15, duration: 100, useNativeDriver: true }),
        Animated.timing(childScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      speakGame('Mirror match!');
      setTimeout(() => {
        const next = done + 1;
        setDone(next);
        if (next >= MIRROR_WORDS.length) {
          roundDoneRef.current = true;
          setTimeout(() => session.completeRound(), 800);
        } else {
          const nextIdx = index + 1;
          setIndex(nextIdx);
          playAvatar(MIRROR_WORDS[nextIdx % MIRROR_WORDS.length]);
        }
        busyRef.current = false;
      }, 600);
    }, 50);
    return () => clearInterval(tick);
  }, [phase, session, cue, done, index, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Talking Mirror"
        subtitle="Avatar says → you repeat"
        skills="🪞 Visual imitation • 👀 Watch • 🗣️ Copy"
        gradient={['#F3E8FF', '#E9D5FF']}
        accent="#9333EA"
        onBack={onBack}
        progress={done}
        progressTotal={MIRROR_WORDS.length}
        roundLabel={`Mirror ${done}/${MIRROR_WORDS.length} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.row}>
              <View style={styles.pane}>
                <Text style={styles.mirror}>🪞</Text>
                <Animated.Text
                  style={[styles.avatar, { transform: [{ scale: avatarScale }] }]}
                >
                  {phase === 'listen' ? '🙂' : '😊'}
                </Animated.Text>
                <Text style={styles.name}>Friend</Text>
                <Text style={styles.word}>{cue.label}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.pane}>
                <Text style={styles.mirror}>🪞</Text>
                <Animated.Text
                  style={[styles.avatar, { transform: [{ scale: childScale }] }]}
                >
                  {phase === 'say' ? '🧒' : '🙂'}
                </Animated.Text>
                <Text style={styles.name}>You</Text>
                {phase === 'say' && (
                  <View style={styles.bar}>
                    <View style={[styles.fill, { width: `${progress * 100}%` }]} />
                  </View>
                )}
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
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pane: { flex: 1, alignItems: 'center', padding: 8 },
  mirror: { fontSize: 28, marginBottom: 4 },
  avatar: { fontSize: 64 },
  name: { fontSize: 16, fontWeight: '800', color: '#6B21A8', marginTop: 6 },
  word: { fontSize: 28, fontWeight: '900', color: '#7E22CE', marginTop: 4 },
  divider: { width: 2, height: '60%', backgroundColor: 'rgba(147,51,234,0.3)', borderRadius: 2 },
  bar: {
    width: '90%',
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#A855F7', borderRadius: 8 },
});
