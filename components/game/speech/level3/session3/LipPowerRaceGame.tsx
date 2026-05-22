import {
  VoiceGameFrame,
  VoiceGameOverlays,
  clearGameSpeech,
  speakGame,
  useBilabialGameSession,
  DEFAULT_VOICE_ROUNDS,
  createBurstDetector,
  sustainedVoice,
  useSpeechHitCounter,
  VOICE_ACTIVE_THRESHOLD,
} from '@/components/game/speech/level3/shared/bilabialGameShared';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Lap = 'M' | 'P' | 'B';
const LAP_ORDER: Lap[] = ['M', 'P', 'B'];
const LAPS_PER_ROUND = 6;
const M_HOLD_MS = 700;

const LAP_WORDS: Record<Lap, string[]> = {
  M: ['ma', 'mama', 'mmm', 'mm'],
  P: ['puh', 'pop', 'p', 'pu'],
  B: ['buh', 'b', 'ba', 'ball'],
};

const LAP_HINT: Record<Lap, string> = {
  M: 'Mmm / Ma',
  P: 'Puh!',
  B: 'Buh!',
};

const LAP_EMOJI: Record<Lap, string> = { M: '🅼', P: '🅿️', B: '🅱️' };

export function LipPowerRaceGame({ onBack, onComplete }: Props) {
  const session = useBilabialGameSession('lip-power-race', DEFAULT_VOICE_ROUNDS);
  const [lapIndex, setLapIndex] = useState(0);
  const [lapsDone, setLapsDone] = useState(0);
  const [progress, setProgress] = useState(0);
  const lap = LAP_ORDER[lapIndex % LAP_ORDER.length];
  const speech = useSpeechHitCounter(true, LAP_WORDS[lap]);
  const burstRef = useRef(createBurstDetector({ cooldownMs: 480 }));
  const holdRef = useRef<number | null>(null);
  const voiceRef = useRef({ level: 0, active: false });
  const roundDoneRef = useRef(false);

  useEffect(() => {
    speakGame('Race through M, P, and B sounds!');
    return () => clearGameSpeech();
  }, []);

  useEffect(() => {
    setLapIndex(0);
    setLapsDone(0);
    setProgress(0);
    roundDoneRef.current = false;
    burstRef.current.reset();
    holdRef.current = null;
    speakGame('Start with Mmm!');
  }, [session.round]);

  useEffect(() => {
    speech.resetHits();
    burstRef.current.reset();
    holdRef.current = null;
    setProgress(0);
    speakGame(`Now ${LAP_HINT[lap]}!`);
  }, [lap]);

  const completeLap = () => {
    if (roundDoneRef.current) return;
    holdRef.current = null;
    setProgress(0);
    burstRef.current.reset();
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const nextLaps = lapsDone + 1;
    setLapsDone(nextLaps);
    if (nextLaps >= LAPS_PER_ROUND) {
      roundDoneRef.current = true;
      speakGame('You won the lip race!');
      setTimeout(() => session.completeRound(), 900);
      return;
    }
    setLapIndex((i) => i + 1);
  };

  useEffect(() => {
    const tick = setInterval(() => {
      if (session.gameFinished || roundDoneRef.current) return;
      const v = voiceRef.current;
      if (speech.useSpeech && speech.consumeHit()) {
        completeLap();
        return;
      }
      if (lap === 'M') {
        const { progress: p, done } = sustainedVoice(v.level, v.active, M_HOLD_MS, holdRef, VOICE_ACTIVE_THRESHOLD);
        setProgress(p);
        if (done) completeLap();
      } else if (burstRef.current.tick(v.level, v.active)) {
        completeLap();
      }
    }, 50);
    return () => clearInterval(tick);
  }, [session, lap, lapsDone, speech.useSpeech]);

  return (
    <>
      <VoiceGameFrame
        title="Lip Power Race"
        subtitle="Alternate M → P → B"
        skills="🏁 M · P · B • 👄 Bilabials • 🧠 Coordination"
        gradient={['#FEE2E2', '#FECACA']}
        accent="#DC2626"
        onBack={onBack}
        progress={lapsDone}
        progressTotal={LAPS_PER_ROUND}
        roundLabel={`Lap ${lapsDone}/${LAPS_PER_ROUND} · ${lap} · Round ${session.round}/${session.rounds}`}
      >
        {(voice) => {
          voiceRef.current = { level: voice.level, active: voice.status === 'active' };
          return (
            <View style={styles.center}>
              <Text style={styles.race}>🏁</Text>
              <Text style={styles.lapEmoji}>{LAP_EMOJI[lap]}</Text>
              <Text style={styles.lapLabel}>Say: {LAP_HINT[lap]}</Text>
              <View style={styles.lanes}>
                {LAP_ORDER.map((l) => (
                  <View
                    key={l}
                    style={[styles.lane, lap === l && styles.laneActive]}
                  >
                    <Text style={styles.laneText}>{l}</Text>
                  </View>
                ))}
              </View>
              {lap === 'M' && (
                <View style={styles.bar}>
                  <View style={[styles.fill, { width: `${progress * 100}%` }]} />
                </View>
              )}
              <Text style={styles.hint}>
                {speech.useSpeech ? 'Say the sound clearly' : 'Use your voice into the mic'}
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
  race: { fontSize: 48 },
  lapEmoji: { fontSize: 64, marginVertical: 8 },
  lapLabel: { fontSize: 24, fontWeight: '900', color: '#B91C1C' },
  lanes: { flexDirection: 'row', gap: 12, marginTop: 20 },
  lane: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  laneActive: { backgroundColor: '#FCA5A5', borderWidth: 3, borderColor: '#DC2626' },
  laneText: { fontSize: 22, fontWeight: '900', color: '#7F1D1D' },
  bar: {
    width: '75%',
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 6,
    marginTop: 16,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: '#EF4444', borderRadius: 6 },
  hint: { marginTop: 12, fontSize: 13, fontWeight: '700', color: '#991B1B' },
});
