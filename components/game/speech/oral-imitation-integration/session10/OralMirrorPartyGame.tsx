import {
  ORAL_IMITATION_INTERACTIONS_PER_ROUND,
  OralImitationOverlays,
  OralImitationShell,
  speakOralImitation,
  useOralImitationSession,
} from '@/components/game/speech/oral-imitation-integration/shared/oralImitationShared';
import { oralPromptToTarget } from '@/components/game/speech/mouth-pose/modules/poseTargetMap';
import { POSE_EMOJI } from '@/components/game/speech/oral-imitation-integration/session10/copyMyMouthPrompts';
import type { OralImitationPrompt } from '@/components/game/speech/oral-imitation-integration/modules/oralImitationTypes';
import { useOralImitationIntegration } from '@/hooks/useOralImitationIntegration';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const PARTY_SEQUENCE: { prompt: OralImitationPrompt; label: string }[] = [
  { prompt: 'smile', label: 'Smile' },
  { prompt: 'open', label: 'Open mouth' },
  { prompt: 'tongue-out', label: 'Tongue out' },
  { prompt: 'funny-lips', label: 'Funny face' },
];

export function OralMirrorPartyGame({ onBack, onComplete }: Props) {
  const session = useOralImitationSession('oral-mirror-party', 3);
  const [canPlay, setCanPlay] = useState(false);
  const [hits, setHits] = useState(0);
  const sense = useOralImitationIntegration(canPlay, 'oral-mirror-party', session.round);

  const step = useMemo(() => PARTY_SEQUENCE[hits % PARTY_SEQUENCE.length] ?? PARTY_SEQUENCE[0], [hits]);

  useEffect(() => {
    if (!canPlay) return;
    setHits(0);
    speakOralImitation('Mirror party! Copy slowly — party stars for every try.');
  }, [canPlay, session.round]);

  useEffect(() => {
    if (!canPlay) return;
    if (!sense.rewardPulse) return;
    if (!sense.consumeReward()) return;
    const next = hits + 1;
    setHits(next);
    session.manager.recordInteraction();
    if (next >= ORAL_IMITATION_INTERACTIONS_PER_ROUND) setTimeout(() => session.completeRound(), 700);
  }, [canPlay, sense.rewardPulse]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <OralImitationShell
        title="Oral Mirror Party"
        subtitle="Slow copy sequence — party stars"
        skills="🎉 Gentle imitation"
        gradient={['#EDE9FE', '#FCE7F3']}
        accent="#7C3AED"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        hits={hits}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={`Mirror: ${step.label}. Tap when you copy or try.`}
        onGoodTry={sense.goodTry}
        sense={sense}
        poseTarget={oralPromptToTarget(step.prompt)}
        onPoseMatch={sense.goodTry}
      >
        <View style={styles.stage}>
          <Text style={styles.party}>🎉</Text>
          <View style={styles.mirror}>
            <Text style={styles.avatar}>{POSE_EMOJI[step.prompt]}</Text>
            <Text style={styles.label}>{step.label}</Text>
          </View>
          <View style={styles.stars}>
            {Array.from({ length: hits + 1 }).map((_, i) => (
              <Text key={i} style={styles.star}>
                ⭐
              </Text>
            ))}
          </View>
          <Pressable style={styles.copyBtn} onPress={() => sense.interact()}>
            <Text style={styles.copyText}>I copied! 🪞</Text>
          </Pressable>
        </View>
      </OralImitationShell>
      <OralImitationOverlays
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
  stage: {
    minHeight: 360,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    padding: 14,
  },
  party: { fontSize: 36, marginBottom: 4 },
  mirror: {
    width: '88%',
    maxWidth: 340,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 3,
    borderColor: 'rgba(124,58,237,0.35)',
    alignItems: 'center',
    paddingVertical: 18,
  },
  avatar: { fontSize: 100 },
  label: { fontSize: 18, fontWeight: '900', color: '#4C1D95', marginTop: 6 },
  stars: { flexDirection: 'row', gap: 4, marginTop: 10, minHeight: 32 },
  star: { fontSize: 26 },
  copyBtn: {
    marginTop: 12,
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#7C3AED',
  },
  copyText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
