import {
  LipJawCoordinationShell,
  LipJawOverlays,
  speakLipJaw,
  useCoordinationHits,
  useLipJawSession,
} from '@/components/game/speech/lip-jaw-coordination/shared/lipJawCoordinationShared';
import { ROBOT_CUES } from '@/components/game/speech/lip-jaw-coordination/session1/coordinationCues';
import { useLipJawCoordination } from '@/hooks/useLipJawCoordination';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

export function RobotMouthBuilderGame({ onBack, onComplete }: Props) {
  const session = useLipJawSession('robot-mouth-builder', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useLipJawCoordination(canPlay, 'robot-mouth-builder', session.round);

  const cue = useMemo(
    () => ROBOT_CUES[(hits + sense.coordinationAttempt) % ROBOT_CUES.length] ?? ROBOT_CUES[0],
    [hits, sense.coordinationAttempt],
  );

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    sense.engine.setCue(cue.mouthState, cue.lipLabel, cue.jawLabel);
    speakLipJaw(cue.tts);
  }, [canPlay, session.round]); // eslint-disable-line react-hooks/exhaustive-deps

  useCoordinationHits(canPlay, sense, hits, setHits, session.manager, session.completeRound);

  return (
    <>
      <LipJawCoordinationShell
        title="Robot Mouth Builder"
        subtitle="Build mouth shapes"
        skills="🤖 Coordinated shapes • 👄 Lip + jaw"
        gradient={['#EEF2FF', '#F1F5F9']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Robot: ${cue.label}. Copy the mouth team!`}
        onGoodTry={sense.goodTry}
        sense={sense}
      >
        <View style={styles.stage}>
          <Text style={styles.robot}>🤖</Text>
          <View style={styles.blueprint}>
            <Text style={styles.emoji}>{cue.emoji}</Text>
            <Text style={styles.parts}>{cue.lipLabel} + {cue.jawLabel}</Text>
          </View>
          <Pressable style={styles.btn} onPress={() => sense.coordinate()}>
            <Text style={styles.btnText}>Build mouth! 🔧</Text>
          </Pressable>
          {sense.rewardState === 'STAR' || sense.rewardState === 'HERO' ? (
            <Text style={styles.celebrate}>Robot celebration!</Text>
          ) : null}
        </View>
      </LipJawCoordinationShell>
      <LipJawOverlays
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
  stage: { minHeight: 340, alignItems: 'center', padding: 12 },
  robot: { fontSize: 72 },
  blueprint: {
    marginTop: 10,
    padding: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    minWidth: '85%',
  },
  emoji: { fontSize: 88 },
  parts: { marginTop: 8, fontSize: 17, fontWeight: '900', color: '#4338CA' },
  btn: { marginTop: 14, backgroundColor: '#4F46E5', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  celebrate: { marginTop: 12, fontSize: 18, fontWeight: '900', color: '#4F46E5' },
});
