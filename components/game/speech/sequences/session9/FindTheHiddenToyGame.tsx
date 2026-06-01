import {
  clearSequenceSpeech,
  DEFAULT_SEQUENCE_ROUNDS,
  hapticSequenceSuccess,
  SequencesOverlays,
  SequencesShell,
  speakSequence,
  useSequencesSession,
} from '@/components/game/speech/sequences/shared/sequencesShared';
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type Spot = { id: string; emoji: string; label: string; correct: boolean; imageKey?: Level2ImageKey };

const ROUNDS: { clues: string[]; spots: Spot[] }[] = [
  {
    clues: ['Not on the chair.', 'It is under something soft.', 'Look under the bed!'],
    spots: [
      { id: 'chair', emoji: '🪑', label: 'On chair', imageKey: 'chair', correct: false },
      { id: 'table', emoji: '🪑', label: 'On table', imageKey: 'dining-table', correct: false },
      { id: 'bed', emoji: '🛏️', label: 'Under bed', imageKey: 'bed', correct: true },
      { id: 'tree', emoji: '🌳', label: 'Outside', imageKey: 'tree', correct: false },
    ],
  },
  {
    clues: ['It is in the kitchen.', 'Near something cold.', 'Look in the fridge!'],
    spots: [
      { id: 'bath', emoji: '🛁', label: 'Bathroom', imageKey: 'room-bathroom', correct: false },
      { id: 'bed', emoji: '🛏️', label: 'Bedroom', imageKey: 'room-bedroom', correct: false },
      { id: 'fridge', emoji: '🧊', label: 'In fridge', imageKey: 'fridge', correct: true },
      { id: 'yard', emoji: '🌳', label: 'Yard', imageKey: 'room-backyard', correct: false },
    ],
  },
  {
    clues: ['It is behind something.', 'In the living room.', 'Behind the sofa!'],
    spots: [
      { id: 'door', emoji: '🚪', label: 'By door', imageKey: 'door', correct: false },
      { id: 'sofa', emoji: '🛋️', label: 'Behind sofa', imageKey: 'sofa', correct: true },
      { id: 'roof', emoji: '🏠', label: 'On roof', imageKey: 'roof', correct: false },
      { id: 'car', emoji: '🚗', label: 'In car', imageKey: 'car', correct: false },
    ],
  },
];

export function FindTheHiddenToyGame({ onBack, onComplete }: Props) {
  const session = useSequencesSession('find-the-hidden-toy', DEFAULT_SEQUENCE_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [clueStep, setClueStep] = useState(0);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakSequence('Find the hidden toy! Follow each clue, then tap where it is.');
    return () => clearSequenceSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setClueStep(0);
    speakSequence('Tap NEXT CLUE to hear where to look.');
  }, [session.round, canPlay]);

  const nextClue = () => {
    if (clueStep < round.clues.length) {
      speakSequence(round.clues[clueStep]);
      setClueStep((s) => s + 1);
    } else {
      speakSequence('Now tap where the toy is hidden!');
    }
  };

  const onSpot = (correct: boolean) => {
    if (clueStep < round.clues.length) {
      speakSequence('Listen to all the clues first!');
      return;
    }
    if (correct) {
      hapticSequenceSuccess();
      speakSequence('You found the toy! 🧸');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakSequence('Try another place!');
    }
  };

  return (
    <>
      <SequencesShell
        title="Find the Hidden Toy"
        subtitle="Use location clues"
        skills="🔎 Multi-step reasoning"
        gradient={['#FFEDD5', '#FDBA74']}
        accent="#EA580C"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={
          clueStep < round.clues.length
            ? `Clue ${clueStep + 1} — tap Next Clue`
            : 'Tap where the toy is!'
        }
      >
        <Pressable style={styles.clueBtn} onPress={nextClue}>
          <Text style={styles.clueBtnText}>
            {clueStep < round.clues.length ? '▶ Next Clue' : '🔍 Search!'}
          </Text>
        </Pressable>
        {clueStep > 0 ? (
          <View style={styles.clueList}>
            {round.clues.slice(0, Math.min(clueStep, round.clues.length)).map((c, i) => (
              <Text key={i} style={styles.clueLine}>
                {i + 1}. {c}
              </Text>
            ))}
          </View>
        ) : null}
        <Text style={styles.toyHint}>🧸 Hidden somewhere…</Text>
        <View style={styles.grid}>
          {round.spots.map((s) => (
            <Pressable key={s.id} style={styles.spot} onPress={() => onSpot(s.correct)}>
              <Level2Picture imageKey={s.imageKey} emoji={s.emoji} size={36} />
              <Text style={styles.spotLabel}>{s.label}</Text>
            </Pressable>
          ))}
        </View>
      </SequencesShell>
      <SequencesOverlays
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
  clueBtn: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    marginBottom: 8,
  },
  clueBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  clueList: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  clueLine: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 3 },
  toyHint: { textAlign: 'center', fontSize: 28, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  spot: {
    width: '44%',
    margin: 5,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  spotEmoji: { fontSize: 36 },
  spotLabel: { fontSize: 12, fontWeight: '800', color: '#EA580C', marginTop: 4, textAlign: 'center' },
});
