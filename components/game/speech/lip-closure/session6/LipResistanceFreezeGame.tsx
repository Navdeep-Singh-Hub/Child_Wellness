import {
  resistanceDifficultyMs,
  resistanceRoundDifficulty,
} from '@/components/game/speech/lip-closure/modules/LipResistanceSessionManager';
import {
  DEFAULT_RESISTANCE_ROUNDS,
  LipResistanceGameOverlays,
  LipResistanceGameShell,
  LipResistanceProgressRing,
  clearResistanceSpeech,
  poseEmoji,
  speakResistance,
  useLipResistanceGameSession,
  useLipResistanceProgress,
  useLipResistanceSense,
} from '@/components/game/speech/lip-closure/shared/lipResistanceShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function LipResistanceFreezeGame({ onBack, onComplete }: Props) {
  const session = useLipResistanceGameSession('lip-resistance-freeze', DEFAULT_RESISTANCE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const lip = useLipResistanceSense(canPlay);
  const target = resistanceDifficultyMs(resistanceRoundDifficulty(session.round));
  const [ice, setIce] = useState(0);
  const [statue, setStatue] = useState(false);

  useEffect(() => {
    speakResistance('Freeze Timer! Hold your lip posture like a statue.');
    return () => clearResistanceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    session.manager.startDetecting();
    setIce(0);
    setStatue(false);
    speakResistance('Freeze and hold steady!');
  }, [session.round, canPlay]);

  useEffect(() => {
    if (!canPlay) return;
    const id = setInterval(() => {
      setIce((v) => {
        if (lip.stableHold) return Math.min(1, v + 0.018);
        return Math.max(0, v - 0.008);
      });
    }, 55);
    return () => clearInterval(id);
  }, [canPlay, lip.stableHold]);

  const progress = useLipResistanceProgress(lip, target, canPlay, () => {
    setStatue(true);
    speakResistance('Ice statue celebration! Amazing hold!');
    void session.manager.markSuccess(lip.holdDuration, lip.stabilityScore);
    setTimeout(() => session.completeRound(), 1000);
  });

  return (
    <>
      <LipResistanceGameShell
        title="Freeze Timer"
        subtitle="Hold lip posture — timer grows"
        skills="🧊 Freeze hold • 💪 Endurance"
        gradient={['#E0F7FA', '#B2EBF2']}
        accent="#0891B2"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        lip={lip}
      >
        <View style={styles.center}>
          <Text style={styles.face}>{statue ? '🗿❄️✨' : poseEmoji(lip.lipPose)}</Text>
          <View style={styles.iceBar}>
            <View style={[styles.iceFill, { width: `${ice * 100}%` }]} />
          </View>
          <LipResistanceProgressRing progress={progress} accent="#0891B2" />
        </View>
      </LipResistanceGameShell>
      <LipResistanceGameOverlays {...session} onBack={onBack} onComplete={onComplete} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  face: { fontSize: 80, marginBottom: 12 },
  iceBar: {
    width: '85%',
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  iceFill: { height: '100%', backgroundColor: '#67E8F9', borderRadius: 7 },
});
