import {
  ActionChoiceTile,
  ActionsOverlays,
  ActionsShell,
  clearActionSpeech,
  DEFAULT_ACTION_ROUNDS,
  hapticActionSuccess,
  speakAction,
  useActionsSession,
} from '@/components/game/speech/actions/shared/actionsShared';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    tool: { id: 'hammer', emoji: '🔨', label: 'Hammer' },
    uses: [
      { id: 'nail', emoji: '🔩', label: 'Hit a nail', correct: true },
      { id: 'hair', emoji: '💇', label: 'Cut hair', correct: false },
      { id: 'soup', emoji: '🥣', label: 'Eat soup', correct: false },
      { id: 'book', emoji: '📖', label: 'Read a book', correct: false },
    ],
  },
  {
    tool: { id: 'scissors', emoji: '✂️', label: 'Scissors' },
    uses: [
      { id: 'paper', emoji: '📄', label: 'Cut paper', correct: true },
      { id: 'swim', emoji: '🏊', label: 'Go swimming', correct: false },
      { id: 'phone', emoji: '📞', label: 'Make a call', correct: false },
      { id: 'sleep', emoji: '🛏️', label: 'Go to bed', correct: false },
    ],
  },
  {
    tool: { id: 'brush', emoji: '🖌️', label: 'Paint brush' },
    uses: [
      { id: 'paint', emoji: '🎨', label: 'Paint a picture', correct: true },
      { id: 'drive', emoji: '🚗', label: 'Drive a car', correct: false },
      { id: 'cook', emoji: '🍳', label: 'Fry an egg', correct: false },
      { id: 'climb', emoji: '🧗', label: 'Climb a tree', correct: false },
    ],
  },
];

export function ToolMatchGame({ onBack, onComplete }: Props) {
  const session = useActionsSession('tool-match', DEFAULT_ACTION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [toolPicked, setToolPicked] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakAction('Tool match! Tap the tool, then what we use it for.');
    return () => clearActionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setToolPicked(false);
    speakAction(`What do we use a ${round.tool.label.toLowerCase()} for?`);
  }, [session.round, canPlay, round.tool.label]);

  const onUse = (correct: boolean) => {
    if (!toolPicked) {
      speakAction(`Tap the ${round.tool.label} first!`);
      return;
    }
    if (correct) {
      hapticActionSuccess();
      speakAction('Perfect match!');
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakAction('That is not what this tool does!');
    }
  };

  return (
    <>
      <ActionsShell
        title="Tool Match"
        subtitle="Match object with its use"
        skills="🔧 Problem solving"
        gradient={['#F1F5F9', '#94A3B8']}
        accent="#475569"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={toolPicked ? 'Tap what it is for' : 'Tap the tool'}
      >
        <View style={styles.toolRow}>
          <ActionChoiceTile
            label={round.tool.label}
            emoji={round.tool.emoji}
            accent="#475569"
            selected={toolPicked}
            onPress={() => {
              setToolPicked(true);
              speakAction('Now tap what we use it for!');
            }}
          />
        </View>
        <Text style={styles.arrow}>{toolPicked ? '⬇️ matches ⬇️' : ''}</Text>
        <View style={styles.grid}>
          {round.uses.map((u) => (
            <ActionChoiceTile
              key={u.id}
              label={u.label}
              emoji={u.emoji}
              accent="#475569"
              onPress={() => onUse(u.correct)}
            />
          ))}
        </View>
      </ActionsShell>
      <ActionsOverlays
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
  toolRow: { flexDirection: 'row', justifyContent: 'center' },
  arrow: { textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#475569', marginVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
