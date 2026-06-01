import {
  CommunityChoiceTile,
  CommunityOverlays,
  CommunityShell,
  clearCommunitySpeech,
  DEFAULT_COMMUNITY_ROUNDS,
  hapticCommunitySuccess,
  speakCommunity,
  useCommunitySession,
} from '@/components/game/speech/community/shared/communityShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    target: 'mom',
    prompt: 'Find Mom!',
    members: [
      { id: 'mom', emoji: '👩', imageKey: 'mom' as const, label: 'Mom', correct: true },
      { id: 'dad', emoji: '👨', imageKey: 'dad' as const, label: 'Dad', correct: false },
      { id: 'sis', emoji: '👧', imageKey: 'sister' as const, label: 'Sister', correct: false },
      { id: 'dog', emoji: '🐕', label: 'Dog', correct: false },
    ],
  },
  {
    target: 'dad',
    prompt: 'Find Dad!',
    members: [
      { id: 'grandma', emoji: '👵', imageKey: 'grandma' as const, label: 'Grandma', correct: false },
      { id: 'dad', emoji: '👨', imageKey: 'dad' as const, label: 'Dad', correct: true },
      { id: 'bro', emoji: '👦', imageKey: 'brother' as const, label: 'Brother', correct: false },
      { id: 'baby', emoji: '👶', imageKey: 'baby' as const, label: 'Baby', correct: false },
    ],
  },
  {
    target: 'grandma',
    prompt: 'Find Grandma!',
    members: [
      { id: 'mom', emoji: '👩', imageKey: 'mom' as const, label: 'Mom', correct: false },
      { id: 'grandma', emoji: '👵', imageKey: 'grandma' as const, label: 'Grandma', correct: true },
      { id: 'grandpa', emoji: '👴', imageKey: 'grandpa' as const, label: 'Grandpa', correct: false },
      { id: 'cat', emoji: '🐱', label: 'Cat', correct: false },
    ],
  },
];

export function FamilyMatchGame({ onBack, onComplete }: Props) {
  const session = useCommunitySession('family-match', DEFAULT_COMMUNITY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakCommunity('Family match! Tap the family member you hear.');
    return () => clearCommunitySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakCommunity(round.prompt);
  }, [session.round, canPlay, round.prompt]);

  const onPick = (correct: boolean, label: string) => {
    if (correct) {
      hapticCommunitySuccess();
      speakCommunity(`Yes, ${label}!`);
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakCommunity(round.prompt);
    }
  };

  return (
    <>
      <CommunityShell
        title="Family Match"
        subtitle="Identify the family member"
        skills="👨‍👩‍👧 Social recognition"
        gradient={['#FCE7F3', '#F9A8D4']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={round.prompt}
      >
        <Text style={styles.family}>👨‍👩‍👧‍👦</Text>
        <View style={styles.grid}>
          {round.members.map((m) => (
            <CommunityChoiceTile
              key={m.id}
              label={m.label}
              emoji={m.emoji}
              imageKey={m.imageKey}
              accent="#DB2777"
              onPress={() => onPick(m.correct, m.label)}
            />
          ))}
        </View>
      </CommunityShell>
      <CommunityOverlays
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
  family: { textAlign: 'center', fontSize: 48, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
