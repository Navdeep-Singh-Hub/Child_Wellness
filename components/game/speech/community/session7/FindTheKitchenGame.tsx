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
      { id: 'kitchen', emoji: '🍳', imageKey: 'room-kitchen' as const, label: 'Kitchen', correct: true },
      { id: 'bed', emoji: '🛏️', imageKey: 'room-bedroom' as const, label: 'Bedroom', correct: false },
      { id: 'bath', emoji: '🛁', imageKey: 'room-bathroom' as const, label: 'Bathroom', correct: false },
      { id: 'library', emoji: '📚', imageKey: 'place-library' as const, label: 'Library', correct: false },
    ],
  },
  {
    room: 'bathroom',
    prompt: 'Find the bathroom!',
    choices: [
      { id: 'living', emoji: '🛋️', imageKey: 'room-living' as const, label: 'Living room', correct: false },
      { id: 'bath', emoji: '🛁', imageKey: 'room-bathroom' as const, label: 'Bathroom', correct: true },
      { id: 'kitchen', emoji: '🍳', imageKey: 'room-kitchen' as const, label: 'Kitchen', correct: false },
      { id: 'station', emoji: '🚒', imageKey: 'place-fire-station' as const, label: 'Fire station', correct: false },
    ],
  },
  {
    room: 'bedroom',
    prompt: 'Find the bedroom!',
    choices: [
      { id: 'bed', emoji: '🛏️', imageKey: 'room-bedroom' as const, label: 'Bedroom', correct: true },
      { id: 'kitchen', emoji: '🍳', imageKey: 'room-kitchen' as const, label: 'Kitchen', correct: false },
      { id: 'garage', emoji: '🚗', imageKey: 'room-garage' as const, label: 'Garage', correct: false },
      { id: 'office', emoji: '💼', imageKey: 'room-office' as const, label: 'Office', correct: false },
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
              imageKey={c.imageKey}
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
