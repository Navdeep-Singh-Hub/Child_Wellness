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
import { Level2Picture } from '@/components/game/speech/level2-shared/Level2Picture';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

const ROUNDS = [
  {
    picture: '👦',
    pictureImageKey: 'boy' as const,
    label: 'Boy',
    answer: 'he' as const,
    speak: 'He is playing. Match HE.',
    choices: [
      { id: 'he', emoji: '👦', imageKey: 'boy' as const, label: 'He', pronoun: 'he' as const },
      { id: 'she', emoji: '👧', imageKey: 'girl' as const, label: 'She', pronoun: 'she' as const },
      { id: 'they', emoji: '👫', imageKey: 'friends-two-kids' as const, label: 'They', pronoun: 'they' as const },
    ],
  },
  {
    picture: '👧',
    pictureImageKey: 'girl' as const,
    label: 'Girl',
    answer: 'she' as const,
    speak: 'She is happy. Match SHE.',
    choices: [
      { id: 'he', emoji: '👦', imageKey: 'boy' as const, label: 'He', pronoun: 'he' as const },
      { id: 'she', emoji: '👧', imageKey: 'girl' as const, label: 'She', pronoun: 'she' as const },
      { id: 'they', emoji: '👫', imageKey: 'friends-two-kids' as const, label: 'They', pronoun: 'they' as const },
    ],
  },
  {
    picture: '👫',
    pictureImageKey: 'friends-two-kids' as const,
    label: 'Friends',
    answer: 'they' as const,
    speak: 'They are together. Match THEY.',
    choices: [
      { id: 'he', emoji: '👦', imageKey: 'boy' as const, label: 'He', pronoun: 'he' as const },
      { id: 'she', emoji: '👧', imageKey: 'girl' as const, label: 'She', pronoun: 'she' as const },
      { id: 'they', emoji: '👫', imageKey: 'friends-two-kids' as const, label: 'They', pronoun: 'they' as const },
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
          <Level2Picture imageKey={round.pictureImageKey} emoji={round.picture} size={64} />
          <Text style={styles.picLabel}>{round.label}</Text>
        </Pressable>
        <View style={styles.row}>
          {round.choices.map((c) => (
            <ComprehensionChoiceTile
              key={c.id}
              label={c.label}
              emoji={c.emoji}
              imageKey={c.imageKey}
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
