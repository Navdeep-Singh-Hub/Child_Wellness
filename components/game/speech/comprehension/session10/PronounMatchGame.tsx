import {
  clearComprehensionSpeech,
  ComprehensionChoiceTile,
  ComprehensionOverlays,
  ComprehensionShell,
  DEFAULT_COMPREHENSION_ROUNDS,
  hapticComprehensionSuccess,
  speakComprehension,
  useComprehensionSession,
} from '@/components/game/speech/comprehension/shared/comprehensionShared';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    picture: '👦',
    label: 'Boy',
    answer: 'he' as const,
    speak: 'He is playing. Match HE.',
    choices: [
      { id: 'he', emoji: '👦', label: 'He', pronoun: 'he' as const },
      { id: 'she', emoji: '👧', label: 'She', pronoun: 'she' as const },
      { id: 'they', emoji: '👫', label: 'They', pronoun: 'they' as const },
    ],
  },
  {
    picture: '👧',
    label: 'Girl',
    answer: 'she' as const,
    speak: 'She is happy. Match SHE.',
    choices: [
      { id: 'he', emoji: '👦', label: 'He', pronoun: 'he' as const },
      { id: 'she', emoji: '👧', label: 'She', pronoun: 'she' as const },
      { id: 'they', emoji: '👫', label: 'They', pronoun: 'they' as const },
    ],
  },
  {
    picture: '👫',
    label: 'Friends',
    answer: 'they' as const,
    speak: 'They are together. Match THEY.',
    choices: [
      { id: 'he', emoji: '👦', label: 'He', pronoun: 'he' as const },
      { id: 'she', emoji: '👧', label: 'She', pronoun: 'she' as const },
      { id: 'they', emoji: '👫', label: 'They', pronoun: 'they' as const },
    ],
  },
];

export function PronounMatchGame({ onBack, onComplete }: Props) {
  const session = useComprehensionSession('pronoun-match', DEFAULT_COMPREHENSION_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const [seen, setSeen] = useState(false);
  const round = ROUNDS[(session.round - 1) % ROUNDS.length];

  useEffect(() => {
    speakComprehension('Pronoun match! Tap the picture, then he, she, or they.');
    return () => clearComprehensionSpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    setSeen(false);
    speakComprehension(round.speak);
  }, [session.round, canPlay, round.speak]);

  const onPronoun = (pronoun: 'he' | 'she' | 'they') => {
    if (!seen) {
      speakComprehension('Tap the picture first!');
      return;
    }
    if (pronoun === round.answer) {
      hapticComprehensionSuccess();
      speakComprehension(`Yes, ${pronoun}!`);
      setTimeout(() => session.completeRound(), 800);
    } else {
      speakComprehension(round.speak);
    }
  };

  return (
    <>
      <ComprehensionShell
        title="Pronoun Match"
        subtitle="Match he, she, or they"
        skills="💬 Pronoun understanding"
        gradient={['#FCE7F3', '#F9A8D4']}
        accent="#DB2777"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={seen ? 'Tap the pronoun' : 'Tap who you see'}
      >
        <Pressable
          style={[styles.picCard, seen && styles.picOn]}
          onPress={() => {
            setSeen(true);
            speakComprehension('Now pick the pronoun!');
          }}
        >
          <Text style={styles.pic}>{round.picture}</Text>
          <Text style={styles.picLabel}>{round.label}</Text>
        </Pressable>
        <View style={styles.row}>
          {round.choices.map((c) => (
            <ComprehensionChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              accent="#DB2777"
              onPress={() => onPronoun(c.pronoun)}
            />
          ))}
        </View>
      </ComprehensionShell>
      <ComprehensionOverlays
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
  picCard: {
    alignSelf: 'center',
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 12,
  },
  picOn: { borderColor: '#DB2777', borderWidth: 3 },
  pic: { fontSize: 64 },
  picLabel: { fontSize: 16, fontWeight: '900', color: '#DB2777', marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
