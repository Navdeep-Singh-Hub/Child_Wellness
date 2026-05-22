import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useBilabialGameSession,
  DEFAULT_VOICE_ROUNDS,
  createBurstDetector,
  createLipCycleDetector,
  useSpeechHitCounter,
} from '@/components/game/speech/level3/shared/bilabialGameShared';
import { useJawDetection } from '@/hooks/useJawDetection';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const BEATS_NEEDED = 6;

export function MamaDrumGame({ onBack, onComplete }: Props) {
  const session = useBilabialGameSession('mama-drum', DEFAULT_VOICE_ROUNDS);
  const [beats, setBeats] = useState(0);
  const speech = useSpeechHitCounter(true, ['ma', 'mama', 'mom', 'mmm']);
  const jaw = useJawDetection(true);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 380 }));
  const lipRef = useRef(createLipCycleDetector());
  const voiceRef = useRef({ level: 0, active: false, isOpen: false, ratio: 0, isDetecting: false });
  const drumScale = useRef(new Animated.Value(1)).current;
  const roundDoneRef = useRef(false);

  useEffect(() => {
    speakGame('Say ma ma ma to beat the drum!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setBeats(0);
    roundDoneRef.current = false;
    burstRef.current.reset();
    lipRef.current.reset();
    speech.resetHits();
    speakGame('Ma ma ma — tap the drum with your voice!');
  }, [session.round]);

  const hitDrum = () => {
    if (roundDoneRef.current) return;
    setBeats((b) => {
      const next = b + 1;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
      Animated.sequence([
        Animated.timing(drumScale, { toValue: 1.25, duration: 80, useNativeDriver: true }),
        Animated.timing(drumScale, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
      if (next >= BEATS_NEEDED) {
        roundDoneRef.current = true;
        speakGame('Great drumming!');
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
        hitDrum();
        return;
      }
      if (burstRef.current.tick(v.level, v.active)) {
        hitDrum();
        return;
      }
      if (lipRef.current.tick(v.isOpen, v.ratio, v.isDetecting)) {
        hitDrum();
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech, drumScale]);

  return (
    <>
      <VoiceGameFrame
        title="Mama Drum"
        subtitle='Say “ma ma ma” to beat the drum'
        skills="🥁 Bilabial M • 🔁 Repetition • 👄 Lip rhythm"
        gradient={['#FEF9C3', '#FDE047']}
        accent="#CA8A04"
        onBack={onBack}
        progress={beats}
        progressTotal={BEATS_NEEDED}
        roundLabel={`Beats ${beats}/${BEATS_NEEDED} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = {
            level: voice.level,
            active: voice.status === 'active',
            isOpen: jaw.isOpen || false,
            ratio: jaw.ratio || 0,
            isDetecting: jaw.isDetecting || false,
          };
          return (
            <View style={styles.center}>
              <Animated.Text style={[styles.drum, { transform: [{ scale: drumScale }] }]}>🥁</Animated.Text>
              <Text style={styles.word}>Ma · Ma · Ma</Text>
              <Text style={styles.hint}>
                {speech.useSpeech ? 'Say “ma ma ma”' : 'Say “ma ma ma” into the mic'}
              </Text>
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
  drum: { fontSize: 100 },
  word: { fontSize: 28, fontWeight: '900', color: '#A16207', marginTop: 16 },
  hint: { fontSize: 15, fontWeight: '700', color: '#854D0E', marginTop: 8 },
});
