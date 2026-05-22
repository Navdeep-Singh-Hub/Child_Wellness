import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useBilabialGameSession,
  DEFAULT_VOICE_ROUNDS,
  createBurstDetector,
  useSpeechHitCounter,
} from '@/components/game/speech/level3/shared/bilabialGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Bubble = { id: number; x: number; y: number; scale: Animated.Value; opacity: Animated.Value };

const POPS_NEEDED = 5;

export function BubblePopPuhGame({ onBack, onComplete }: Props) {
  const session = useBilabialGameSession('bubble-pop-puh', DEFAULT_VOICE_ROUNDS);
  const [pops, setPops] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const idRef = useRef(0);
  const burstRef = useRef(createBurstDetector({ minDelta: 0.14, cooldownMs: 500 }));
  const speech = useSpeechHitCounter(true, ['puh', 'pop', 'p', 'pu']);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);

  useEffect(() => {
    speakGame('Say puh to pop the bubbles!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setPops(0);
    setBubbles([]);
    roundDoneRef.current = false;
    burstRef.current.reset();
    speech.resetHits();
    speakGame('Puh! Pop each bubble!');
  }, [session.round]);

  const spawnBubble = () => ({
    id: idRef.current++,
    x: 40 + Math.random() * 220,
    y: 40 + Math.random() * 180,
    scale: new Animated.Value(0.6 + Math.random() * 0.4),
    opacity: new Animated.Value(1),
  });

  useEffect(() => {
    setBubbles([spawnBubble(), spawnBubble(), spawnBubble()]);
  }, [session.round]);

  const popBubble = () => {
    if (roundDoneRef.current) return;
    setBubbles((prev) => {
      if (!prev.length) return [spawnBubble()];
      const target = prev[0];
      Animated.parallel([
        Animated.timing(target.scale, { toValue: 1.8, duration: 200, useNativeDriver: true }),
        Animated.timing(target.opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      const rest = prev.slice(1);
      return [...rest, spawnBubble()];
    });
    setPops((p) => {
      const next = p + 1;
      if (next >= POPS_NEEDED) {
        roundDoneRef.current = true;
        speakGame('Pop pop pop! Great puh!');
        setTimeout(() => session.completeRound(), 900);
      }
      return next;
    });
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current) return;
      const v = voiceRef.current;
      if (speech.useSpeech && speech.consumeHit()) {
        popBubble();
        return;
      }
      if (burstRef.current.tick(v.level, v.active)) popBubble();
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title='Bubble Pop "Puh"'
        subtitle='Say “puh” to pop bubbles'
        skills="🫧 Bilabial P • 💨 Air burst • 🗣️ Plosive"
        gradient={['#E0F2FE', '#BAE6FD']}
        accent="#0284C7"
        onBack={onBack}
        progress={pops}
        progressTotal={POPS_NEEDED}
        roundLabel={`Pops ${pops}/${POPS_NEEDED} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.area}>
              {bubbles.map((b) => (
                <Animated.View
                  key={b.id}
                  style={[
                    styles.bubble,
                    {
                      left: b.x,
                      top: b.y,
                      opacity: b.opacity,
                      transform: [{ scale: b.scale }],
                    },
                  ]}
                >
                  <Text style={styles.bubbleEmoji}>🫧</Text>
                </Animated.View>
              ))}
              <Text style={styles.hint}>Say “Puh!” 👄💨</Text>
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
  area: { flex: 1, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 20 },
  bubble: { position: 'absolute' },
  bubbleEmoji: { fontSize: 56 },
  hint: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: '800',
    color: '#0369A1',
    fontSize: 16,
  },
});
