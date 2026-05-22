import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useWordGameSession,
  DEFAULT_VOICE_ROUNDS,
  WORD_MORE,
  tickWordMatch,
  useSpeechHitCounter,
  createBurstDetector,
} from '@/components/game/speech/level3/shared/wordGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const MORE_NEEDED = 4;
const HOLD_MS = 900;

const FOOD_EMOJIS = ['🍎', '🍪', '🧁', '🍌'];

export function SayMoreGame({ onBack, onComplete }: Props) {
  const session = useWordGameSession('say-more', DEFAULT_VOICE_ROUNDS);
  const [requests, setRequests] = useState(0);
  const [progress, setProgress] = useState(0);
  const speech = useSpeechHitCounter(true, WORD_MORE.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 600 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);
  const lockRef = useRef(false);

  useEffect(() => {
    speakGame('Say more to fill your bowl!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setRequests(0);
    setProgress(0);
    roundDoneRef.current = false;
    lockRef.current = false;
    burstRef.current.reset();
    holdRef.current = null;
    speech.resetHits();
    speakGame('Say more!');
  }, [session.round]);

  const onMore = () => {
    if (roundDoneRef.current || lockRef.current) return;
    lockRef.current = true;
    holdRef.current = null;
    setProgress(0);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    speakGame('More!');
    setRequests((r) => {
      const next = r + 1;
      if (next >= MORE_NEEDED) {
        roundDoneRef.current = true;
        speakGame('Yummy! You asked for more!');
        setTimeout(() => session.completeRound(), 900);
      }
      return next;
    });
    setTimeout(() => {
      lockRef.current = false;
    }, 650);
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current || lockRef.current) return;
      const { progress: p, matched } = tickWordMatch(
        WORD_MORE,
        voiceRef.current,
        speech,
        burstRef.current,
        holdRef,
        HOLD_MS,
      );
      setProgress(p);
      if (matched) onMore();
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title='Say "More"'
        subtitle="Voice request for more"
        skills="💬 Functional communication • 🗣️ Requesting • ➕ More"
        gradient={['#FEF3C7', '#FDE68A']}
        accent="#D97706"
        onBack={onBack}
        progress={requests}
        progressTotal={MORE_NEEDED}
        roundLabel={`More ${requests}/${MORE_NEEDED} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.bowl}>🥣</Text>
              <View style={styles.foodRow}>
                {FOOD_EMOJIS.slice(0, requests).map((e, i) => (
                  <Text key={i} style={styles.food}>
                    {e}
                  </Text>
                ))}
              </View>
              <Text style={styles.word}>More</Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.hint}>Say “More!” to get food</Text>
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
  bowl: { fontSize: 80 },
  foodRow: { flexDirection: 'row', minHeight: 48, marginTop: 8, gap: 6 },
  food: { fontSize: 36 },
  word: { fontSize: 44, fontWeight: '900', color: '#B45309', marginTop: 12 },
  bar: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 8,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 8 },
  hint: { marginTop: 10, fontWeight: '800', color: '#92400E' },
});
