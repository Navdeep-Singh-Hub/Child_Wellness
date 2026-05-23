import {
  DEFAULT_JAW_ROUNDS,
  JawGameOverlays,
  JawGameShell,
  clearJawSpeech,
  hapticSuccess,
  speakJaw,
  useJawGameSession,
  useJawSense,
} from '@/components/game/speech/level2/shared/jawAwarenessShared';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function HungryCrocodileGame({ onBack, onComplete }: Props) {
  const session = useJawGameSession('hungry-crocodile', DEFAULT_JAW_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const jaw = useJawSense(canPlay);
  const [crocWantsOpen, setCrocWantsOpen] = useState(false);
  const [fed, setFed] = useState(0);
  const fedRef = useRef(0);
  const lastFeedCrocOpenRef = useRef(false);
  const crocScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    speakJaw('Feed the hungry crocodile! Open your mouth when the croc opens wide!');
    return () => clearJawSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    fedRef.current = 0;
    setFed(0);
    speakJaw('Watch the crocodile — open your mouth to feed it!');
    const loop = setInterval(() => {
      setCrocWantsOpen((prev) => {
        const next = !prev;
        Animated.spring(crocScale, {
          toValue: next ? 1.12 : 1,
          useNativeDriver: true,
        }).start();
        if (next) speakJaw('Open wide!');
        else speakJaw('Close your mouth.');
        return next;
      });
    }, 2200);
    return () => clearInterval(loop);
  }, [session.round, canPlay, crocScale]);

  useEffect(() => {
    if (!canPlay) return;
    if (crocWantsOpen && jaw.isOpen && !lastFeedCrocOpenRef.current) {
      lastFeedCrocOpenRef.current = true;
      fedRef.current += 1;
      setFed(fedRef.current);
      hapticSuccess();
      speakJaw('Yum! Good feeding!');
      if (fedRef.current >= 3) {
        setTimeout(() => session.completeRound(), 800);
      }
    }
    if (!crocWantsOpen) lastFeedCrocOpenRef.current = false;
  }, [crocWantsOpen, jaw.isOpen, canPlay, session]);

  return (
    <>
      <JawGameShell
        title="Hungry Crocodile"
        subtitle="Open/close mouth to feed the croc"
        skills="🐊 Jaw awareness • 👄 Open & close • 🎯 Copying"
        gradient={['#DCFCE7', '#86EFAC']}
        accent="#16A34A"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        jaw={jaw}
      >
        <View style={styles.center}>
          <Animated.Text style={[styles.croc, { transform: [{ scale: crocScale }] }]}>
            {crocWantsOpen ? '🐊😮' : '🐊😐'}
          </Animated.Text>
          <Text style={styles.hint}>
            {crocWantsOpen ? 'Croc is OPEN — you open too!' : 'Croc closed — close your mouth'}
          </Text>
          <Text style={styles.fed}>Fish fed: {fed} / 3</Text>
        </View>
      </JawGameShell>
      <JawGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  croc: { fontSize: 100 },
  hint: { fontSize: 17, fontWeight: '800', color: '#166534', marginTop: 16, textAlign: 'center' },
  fed: { fontSize: 16, fontWeight: '700', color: '#15803D', marginTop: 12 },
});
