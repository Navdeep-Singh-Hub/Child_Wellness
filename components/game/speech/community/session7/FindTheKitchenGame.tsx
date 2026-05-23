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
import { StyleSheet, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    room: 'kitchen',
    prompt: 'Find the kitchen!',
    choices: [
      { id: 'kitchen', emoji: '🍳', label: 'Kitchen', correct: true },
      { id: 'bed', emoji: '🛏️', label: 'Bedroom', correct: false },
      { id: 'bath', emoji: '🛁', label: 'Bathroom', correct: false },
      { id: 'yard', emoji: '🌳', label: 'Backyard', correct: false },
    ],
  },
  {
    room: 'bathroom',
    prompt: 'Find the bathroom!',
    choices: [
      { id: 'living', emoji: '🛋️', label: 'Living room', correct: false },
      { id: 'bath', emoji: '🛁', label: 'Bathroom', correct: true },
      { id: 'kitchen', emoji: '🍳', label: 'Kitchen', correct: false },
      { id: 'garage', emoji: '🚗', label: 'Garage', correct: false },
    ],
  },
  {
    room: 'bedroom',
    prompt: 'Find the bedroom!',
    choices: [
      { id: 'bed', emoji: '🛏️', label: 'Bedroom', correct: true },
      { id: 'kitchen', emoji: '🍳', label: 'Kitchen', correct: false },
      { id: 'office', emoji: '💼', label: 'Office', correct: false },
      { id: 'park', emoji: '🏞️', label: 'Park', correct: false },
    ],
  },
];

export function FindTheKitchenGame({ onBack, onComplete }: Props) {
  const session = useCommunitySession('find-the-kitchen', DEFAULT_COMMUNITY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakCommunity('Find the room! Tap the right place in the house.');
    return () => clearCommunitySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakCommunity(round.prompt);
  }, [session.round, canPlay, round.prompt]);

  const onPick = (correct: boolean) => {
    if (correct) {
      hapticCommunitySuccess();
      speakCommunity('You found it!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakCommunity('Try another room!');
    }
  };

  return (
    <>
      <CommunityShell
        title="Find the Kitchen"
        subtitle="Match the room"
        skills="🏠 Room identification"
        gradient={['#FFEDD5', '#FDBA74']}
        accent="#C2410C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={round.prompt}
      >
        <View style={styles.grid}>
          {round.choices.map((c) => (
            <CommunityChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              accent="#C2410C"
              onPress={() => onPick(c.correct)}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
