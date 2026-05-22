import {
  VowelGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useVoiceGameSession,
  DEFAULT_VOICE_ROUNDS,
  vowelMatch,
  type VowelSense,
} from '@/components/game/speech/level3/shared/vowelGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const HOLD_MS = 1100;
const FEEDS_NEEDED = 4;

export function RoundOooFishGame({ onBack, onComplete }: Props) {
  const session = useVoiceGameSession('round-ooo-fish', DEFAULT_VOICE_ROUNDS);
  const [feeds, setFeeds] = useState(0);
  const [progress, setProgress] = useState(0);
  const holdRef = useRef<number | null>(null);
  const lastFeedRef = useRef(0);
  const senseRef = useRef<VowelSense | null>(null);
  const fishScale = useRef(new Animated.Value(1)).current;
  const roundFeedsRef = useRef(0);

  useEffect(() => {
    speakGame('Say Ooo to feed the fish!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setFeeds(0);
    setProgress(0);
    roundFeedsRef.current = 0;
    holdRef.current = null;
    fishScale.setValue(1);
    speakGame('Round your lips — Ooo!');
  }, [session.round, fishScale]);

  useEffect(() => {
    const tick = setInterval(() => {
      const sense = senseRef.current;
      if (!sense || session.gameFinished) return;
      const { progress: p, matched } = vowelMatch(sense, 'O', HOLD_MS, holdRef);
      setProgress(p);
      if (matched) {
        const now = Date.now();
        if (now - lastFeedRef.current < 900) return;
        lastFeedRef.current = now;
        holdRef.current = null;
        setProgress(0);
        roundFeedsRef.current += 1;
        setFeeds(roundFeedsRef.current);
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {}
        speakGame('Yum!');
        Animated.sequence([
          Animated.timing(fishScale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
          Animated.timing(fishScale, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]).start();
        if (roundFeedsRef.current >= FEEDS_NEEDED) {
          speakGame('Fish is full!');
          setTimeout(() => session.completeRound(), 900);
        }
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session, fishScale]);

  return (
    <>
      <VowelGameFrame
        title='Round "Ooo" Fish'
        subtitle="Say Ooo to feed the fish"
        skills="🐟 Lip rounding • 🅾️ Vowel O • 🗣️ Stable vowel"
        gradient={['#E0F2FE', '#BAE6FD']}
        accent="#0284C7"
        onBack={onBack}
        progress={feeds}
        progressTotal={FEEDS_NEEDED}
        roundLabel={`Fed ${feeds}/${FEEDS_NEEDED} · Round ${session.round}/${session.rounds}`}
      >
        {(sense) => {
          senseRef.current = sense;
          return (
            <View style={styles.center}>
              <Text style={styles.letter}>O</Text>
              <Animated.Text style={[styles.fish, { transform: [{ scale: fishScale }] }]}>
                🐠
              </Animated.Text>
              <Text style={styles.bubble}>🫧 Ooo 🫧</Text>
              <Text style={styles.hint}>
                {Platform.OS === 'web' && sense.isDetecting
                  ? 'Round lips + Ooo to feed'
                  : 'Say “Ooo” to feed the fish'}
              </Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
            </View>
          );
        }}
      </VowelGameFrame>
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
  letter: { fontSize: 64, fontWeight: '900', color: '#0369A1' },
  fish: { fontSize: 80, marginVertical: 8 },
  bubble: { fontSize: 22, fontWeight: '800', color: '#0C4A6E' },
  hint: { fontSize: 15, fontWeight: '800', color: '#075985', marginTop: 8 },
  bar: {
    width: '85%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#38BDF8', borderRadius: 8 },
});
