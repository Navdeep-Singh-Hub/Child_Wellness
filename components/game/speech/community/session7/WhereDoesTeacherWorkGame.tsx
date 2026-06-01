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
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    person: 'Teacher',
    personEmoji: '👩‍🏫',
    personImageKey: 'teacher' as const,
    prompt: 'Where does a teacher work?',
    places: [
      { id: 'school', emoji: '🏫', imageKey: 'place-school' as const, label: 'School', correct: true },
      { id: 'hospital', emoji: '🏥', imageKey: 'place-hospital' as const, label: 'Hospital', correct: false },
      { id: 'farm', emoji: '🚜', imageKey: 'place-farm' as const, label: 'Farm', correct: false },
      { id: 'store', emoji: '🏪', label: 'Store', correct: false },
    ],
  },
  {
    person: 'Doctor',
    personEmoji: '👨‍⚕️',
    personImageKey: 'doctor' as const,
    prompt: 'Where does a doctor work?',
    places: [
      { id: 'school', emoji: '🏫', imageKey: 'place-school' as const, label: 'School', correct: false },
      { id: 'hospital', emoji: '🏥', imageKey: 'place-hospital' as const, label: 'Hospital', correct: true },
      { id: 'park', emoji: '🏞️', imageKey: 'place-park' as const, label: 'Park', correct: false },
      { id: 'beach', emoji: '🏖️', imageKey: 'place-beach' as const, label: 'Beach', correct: false },
    ],
  },
  {
    person: 'Firefighter',
    personEmoji: '👨‍🚒',
    personImageKey: 'fire-fighter' as const,
    prompt: 'Where does a firefighter work?',
    places: [
      { id: 'station', emoji: '🚒', imageKey: 'fire-truck' as const, label: 'Fire station', correct: true },
      { id: 'library', emoji: '📚', imageKey: 'book-stack' as const, label: 'Library', correct: false },
      { id: 'zoo', emoji: '🦁', imageKey: 'place-zoo' as const, label: 'Zoo', correct: false },
      { id: 'kitchen', emoji: '🍳', label: 'Kitchen', correct: false },
    ],
  },
];

export function WhereDoesTeacherWorkGame({ onBack, onComplete }: Props) {
  const session = useCommunitySession('where-does-teacher-work', DEFAULT_COMMUNITY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [personPicked, setPersonPicked] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakCommunity('Where do people work? Tap the person, then the place.');
    return () => clearCommunitySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setPersonPicked(false);
    speakCommunity(round.prompt);
  }, [session.round, canPlay, round.prompt]);

  const onPlace = (correct: boolean) => {
    if (!personPicked) {
      speakCommunity(`Tap the ${round.person} first!`);
      return;
    }
    if (correct) {
      hapticCommunitySuccess();
      speakCommunity('That is where they work!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakCommunity('Try another place!');
    }
  };

  return (
    <>
      <CommunityShell
        title="Where Does Teacher Work?"
        subtitle="Match person to place"
        skills="🏫 Community understanding"
        gradient={['#DBEAFE', '#93C5FD']}
        accent="#2563EB"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={personPicked ? 'Tap where they work' : `Tap the ${round.person}`}
      >
        <Pressable
          style={[styles.personCard, personPicked && styles.personOn]}
          onPress={() => {
            setPersonPicked(true);
            speakCommunity('Now tap where they work!');
          }}
        >
          <Level2Picture imageKey={round.personImageKey} emoji={round.personEmoji} size={52} />
          <Text style={styles.personLabel}>{round.person}</Text>
        </Pressable>
        <View style={styles.grid}>
          {round.places.map((p) => (
            <CommunityChoiceTile
              key={p.id}
              label={p.label}
              emoji={p.emoji}
              imageKey={p.imageKey}
              accent="#2563EB"
              onPress={() => onPlace(p.correct)}
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
  personCard: {
    alignSelf: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 12,
  },
  personOn: { borderColor: '#2563EB', borderWidth: 3 },
  personEmoji: { fontSize: 52 },
  personLabel: { fontSize: 16, fontWeight: '900', color: '#2563EB', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
