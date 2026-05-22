import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useSyllableGameSession,
  DEFAULT_VOICE_ROUNDS,
  SYLLABLE_MA,
  tickSyllableMatch,
  useSpeechHitCounter,
  createBurstDetector,
} from '@/components/game/speech/level3/shared/syllableGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const PLANKS = 5;

export function SyllableBridgeGame({ onBack, onComplete }: Props) {
  const session = useSyllableGameSession('syllable-bridge', DEFAULT_VOICE_ROUNDS);
  const [planks, setPlanks] = useState(0);
  const speech = useSpeechHitCounter(true, SYLLABLE_MA.words);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 420 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);

  useEffect(() => {
    speakGame('Say ma to build the bridge!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setPlanks(0);
    roundDoneRef.current = false;
    burstRef.current.reset();
    holdRef.current = null;
    speech.resetHits();
    speakGame('Ma! Each ma adds a plank!');
  }, [session.round]);

  const addPlank = () => {
    if (roundDoneRef.current) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setPlanks((p) => {
      const next = p + 1;
      if (next >= PLANKS) {
        roundDoneRef.current = true;
        speakGame('Bridge complete!');
        setTimeout(() => session.completeRound(), 900);
      }
      return next;
    });
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current) return;
      const v = voiceRef.current;
      const { matched } = tickSyllableMatch(
        SYLLABLE_MA,
        v,
        speech,
        burstRef.current,
        holdRef,
        650,
      );
      if (matched) addPlank();
    }, 50);
    return () => clearInterval(tick);
  }, [session, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Syllable Bridge"
        subtitle='Say “ma” to build the bridge'
        skills="🌉 CV syllables • 🅼🅰 Ma • 🗣️ Production"
        gradient={['#DBEAFE', '#93C5FD']}
        accent="#2563EB"
        onBack={onBack}
        progress={planks}
        progressTotal={PLANKS}
        roundLabel={`Planks ${planks}/${PLANKS} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.scene}>
              <Text style={styles.cue}>Ma</Text>
              <View style={styles.bridge}>
                {Array.from({ length: PLANKS }).map((_, i) => (
                  <View key={i} style={[styles.plank, i < planks && styles.plankOn]} />
                ))}
              </View>
              <Text style={styles.emoji}>{planks >= PLANKS ? '🌉✨' : '🏗️'}</Text>
              <Text style={styles.hint}>Say “Ma!” for each plank</Text>
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
  cue: { fontSize: 56, fontWeight: '900', color: '#1D4ED8' },
  bridge: { flexDirection: 'row', gap: 6, marginVertical: 20 },
  plank: {
    width: 44,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 4,
  },
  plankOn: { backgroundColor: '#3B82F6' },
  emoji: { fontSize: 48 },
  hint: { fontSize: 15, fontWeight: '800', color: '#1E40AF', marginTop: 8 },
});
