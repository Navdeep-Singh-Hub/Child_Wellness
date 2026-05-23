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
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    helper: 'Police Officer',
    helperEmoji: '👮',
    jobs: [
      { id: 'protect', emoji: '🚔', label: 'Keeps us safe', correct: true },
      { id: 'teach', emoji: '📚', label: 'Teaches school', correct: false },
      { id: 'cook', emoji: '👨‍🍳', label: 'Cooks food', correct: false },
      { id: 'fly', emoji: '✈️', label: 'Flies planes', correct: false },
    ],
  },
  {
    helper: 'Mail Carrier',
    helperEmoji: '📬',
    jobs: [
      { id: 'mail', emoji: '✉️', label: 'Brings letters', correct: true },
      { id: 'fix', emoji: '🔧', label: 'Fixes teeth', correct: false },
      { id: 'sing', emoji: '🎤', label: 'Sings songs', correct: false },
      { id: 'plant', emoji: '🌱', label: 'Plants trees', correct: false },
    ],
  },
  {
    helper: 'Librarian',
    helperEmoji: '📖',
    jobs: [
      { id: 'books', emoji: '📚', label: 'Helps with books', correct: true },
      { id: 'fire', emoji: '🔥', label: 'Fights fires', correct: false },
      { id: 'bus', emoji: '🚌', label: 'Drives a bus', correct: false },
      { id: 'paint', emoji: '🎨', label: 'Paints houses', correct: false },
    ],
  },
];

export function CommunityHelpersGame({ onBack, onComplete }: Props) {
  const session = useCommunitySession('community-helpers', DEFAULT_COMMUNITY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [helperPicked, setHelperPicked] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakCommunity('Community helpers! Match the helper to their job.');
    return () => clearCommunitySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setHelperPicked(false);
    speakCommunity(`What does a ${round.helper.toLowerCase()} do?`);
  }, [session.round, canPlay, round.helper]);

  const onJob = (correct: boolean) => {
    if (!helperPicked) {
      speakCommunity(`Tap the ${round.helper} first!`);
      return;
    }
    if (correct) {
      hapticCommunitySuccess();
      speakCommunity('They help our community!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakCommunity('Try another job!');
    }
  };

  return (
    <>
      <CommunityShell
        title="Community Helpers"
        subtitle="Match helper to job"
        skills="🤝 Social understanding"
        gradient={['#D1FAE5', '#6EE7B7']}
        accent="#059669"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={helperPicked ? 'Tap their job' : `Tap the ${round.helper}`}
      >
        <Pressable
          style={[styles.helperCard, helperPicked && styles.helperOn]}
          onPress={() => {
            setHelperPicked(true);
            speakCommunity('What is their job?');
          }}
        >
          <Text style={styles.helperEmoji}>{round.helperEmoji}</Text>
          <Text style={styles.helperLabel}>{round.helper}</Text>
        </Pressable>
        <View style={styles.grid}>
          {round.jobs.map((j) => (
            <CommunityChoiceTile
              key={j.id}
              label={j.label}
              emoji={j.emoji}
              accent="#059669"
              onPress={() => onJob(j.correct)}
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
  helperCard: {
    alignSelf: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 12,
  },
  helperOn: { borderColor: '#059669', borderWidth: 3 },
  helperEmoji: { fontSize: 52 },
  helperLabel: { fontSize: 15, fontWeight: '900', color: '#059669', marginTop: 4, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
