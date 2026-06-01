import {
  BodyPartButton,
  BodyPartsOverlays,
  BodyPartsShell,
  clearBodySpeech,
  DEFAULT_BODY_ROUNDS,
  hapticBodySuccess,
  speakBody,
  useBodyPartsSession,
} from '@/components/game/speech/body-parts/shared/bodyPartsShared';
import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { onBack: () => void; onComplete?: () => void };

type BodyOption = { id: string; label: string; emoji: string; imageKey?: Level2ImageKey };

const BODY_KEYS: Record<string, Level2ImageKey> = {
  eyes: 'body-eyes',
  ears: 'body-ears',
  nose: 'body-nose',
  hands: 'body-hands',
  mouth: 'body-mouth',
  feet: 'body-feet',
  knee: 'body-knee',
  hair: 'body-hair',
};

function withImageKey(o: { id: string; label: string; emoji: string }): BodyOption {
  return { ...o, imageKey: BODY_KEYS[o.id] };
}

const QUESTIONS = [
  { q: 'What helps you see?', answer: 'eyes', options: [
    withImageKey({ id: 'eyes', label: 'Eyes', emoji: '👀' }),
    withImageKey({ id: 'ears', label: 'Ears', emoji: '👂' }),
    withImageKey({ id: 'nose', label: 'Nose', emoji: '👃' }),
    withImageKey({ id: 'hands', label: 'Hands', emoji: '✋' }),
  ]},
  { q: 'What helps you hear?', answer: 'ears', options: [
    withImageKey({ id: 'mouth', label: 'Mouth', emoji: '👄' }),
    withImageKey({ id: 'ears', label: 'Ears', emoji: '👂' }),
    withImageKey({ id: 'feet', label: 'Feet', emoji: '🦶' }),
    withImageKey({ id: 'eyes', label: 'Eyes', emoji: '👀' }),
  ]},
  { q: 'What helps you smell?', answer: 'nose', options: [
    withImageKey({ id: 'nose', label: 'Nose', emoji: '👃' }),
    withImageKey({ id: 'eyes', label: 'Eyes', emoji: '👀' }),
    withImageKey({ id: 'knee', label: 'Knee', emoji: '🦵' }),
    withImageKey({ id: 'hair', label: 'Hair', emoji: '💇' }),
  ]},
] as const;

export function WhatHelpsYouSeeGame({ onBack, onComplete }: Props) {
  const session = useBodyPartsSession('what-helps-you-see', DEFAULT_BODY_ROUNDS);
  const [canPlay, setCanPlay] = useState(false);
  const item = QUESTIONS[(session.round - 1) % QUESTIONS.length];

  useEffect(() => {
    speakBody('What do each body parts help you do?');
    return () => clearBodySpeech();
  }, []);

  useEffect(() => {
    if (!canPlay) return;
    speakBody(item.q);
  }, [session.round, canPlay, item.q]);

  const onPick = (id: string) => {
    if (id === item.answer) {
      hapticBodySuccess();
      speakBody('That is right!');
      setTimeout(() => session.completeRound(), 700);
    } else {
      speakBody('Think about what that part does!');
    }
  };

  return (
    <>
      <BodyPartsShell
        title="What Helps You See?"
        subtitle="Pick the part for each job"
        skills="👀 Function understanding"
        gradient={['#CCFBF1', '#5EEAD4']}
        accent="#0D9488"
        onBack={onBack}
        round={session.round}
        rounds={session.rounds}
        canPlay={canPlay}
        onStart={() => setCanPlay(true)}
        phaseHint={item.q}
      >
        <Text style={styles.prompt}>{item.q}</Text>
        <View style={styles.grid}>
          {item.options.map((o) => (
            <BodyPartButton
              key={o.id}
              label={o.label}
              emoji={o.emoji}
              imageKey={o.imageKey}
              accent="#0D9488"
              onPress={() => onPick(o.id)}
            />
          ))}
        </View>
      </BodyPartsShell>
      <BodyPartsOverlays
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
  prompt: { textAlign: 'center', fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
