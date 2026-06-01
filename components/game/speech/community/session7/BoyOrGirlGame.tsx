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
    answer: 'boy' as const,
    prompt: 'Tap the boy!',
    choices: [
      { id: 'boy', emoji: '👦', label: 'Boy', correct: true },
      { id: 'girl', emoji: '👧', imageKey: 'girl' as const, label: 'Girl', correct: false },
    ],
  },
  {
    answer: 'girl' as const,
    prompt: 'Tap the girl!',
    choices: [
      { id: 'boy', emoji: '👦', imageKey: 'boy' as const, label: 'Boy', correct: false },
      { id: 'girl', emoji: '👧', imageKey: 'girl' as const, label: 'Girl', correct: true },
    ],
  },
  {
    answer: 'boy' as const,
    prompt: 'Who is the boy?',
    choices: [
      { id: 'boy', emoji: '🧒', imageKey: 'boy' as const, label: 'Boy', correct: true },
      { id: 'girl', emoji: '👧', imageKey: 'girl' as const, label: 'Girl', correct: false },
    ],
  },
];

export function BoyOrGirlGame({ onBack, onComplete }: Props) {
  const session = useCommunitySession('boy-or-girl', DEFAULT_COMMUNITY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakCommunity('Boy or girl? Tap the one you hear.');
    return () => clearCommunitySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakCommunity(round.prompt);
  }, [session.round, canPlay, round.prompt]);

  const onPick = (correct: boolean) => {
    if (correct) {
      hapticCommunitySuccess();
      speakCommunity('You got it!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakCommunity(round.prompt);
    }
  };

  return (
    <>
      <CommunityShell
        title="Boy or Girl?"
        subtitle="Simple gender identification"
        skills="👦 Visual discrimination"
        gradient={['#E0E7FF', '#A5B4FC']}
        accent="#4F46E5"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={round.prompt}
      >
        <View style={styles.row}>
          {round.choices.map((c) => (
            <CommunityChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              imageKey={c.imageKey}
              accent="#4F46E5"
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
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
