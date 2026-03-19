'use client';

import { GameLayout } from '../GameLayout';
import { triggerConfetti } from '../Confetti';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const ROUNDS = [
  { word: 'tree', choices: ['bee', 'lion', 'rock', 'leaf'], correct: 'bee' },
  { word: 'monkey', choices: ['donkey', 'bird', 'snake', 'vine'], correct: 'donkey' },
  { word: 'log', choices: ['frog', 'leaf', 'sun', 'tree'], correct: 'frog' },
  { word: 'snake', choices: ['cake', 'lion', 'bee', 'log'], correct: 'cake' },
];

export default function JungleRhymes() {
  const { speak } = useAudioPlayer(0.85);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(false);
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const current = ROUNDS[round];

  useEffect(() => {
    speak(`I spy something that rhymes with ${current.word}.`);
  }, [round, speak, current.word]);

  const handleClick = useCallback(
    (choice: string) => {
      if (current.correct === choice) {
        setCorrect(true);
        speak('Correct!');
        if (round + 1 >= ROUNDS.length) {
          setDone(true);
          triggerConfetti();
          speak('Great job!');
        } else {
          setTimeout(() => {
            setRound((r) => r + 1);
            setCorrect(false);
          }, 800);
        }
      } else {
        setWrongShake(choice);
        speak('Try again');
        setTimeout(() => setWrongShake(null), 500);
      }
    },
    [current, round, speak]
  );

  if (done) {
    return (
      <GameLayout title="I Spy Jungle Rhymes" showBack={false} backHref="/jungle-session-3" theme="jungle">
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <motion.p
            className="text-3xl font-bold text-jungle-green"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            Great Job! ⭐
          </motion.p>
          <Link
            href="/jungle-session-3/game/3"
            className="rounded-2xl bg-jungle-yellow text-gray-900 font-bold text-xl px-8 py-4 shadow-lg"
          >
            Next: Clap Jungle Words →
          </Link>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="I Spy Jungle Rhymes"
      instruction={`I spy something that rhymes with ${current.word}.`}
      backHref="/jungle-session-3"
      theme="jungle"
    >
      <div className="flex-1 flex flex-col items-center">
        <p className="text-xl font-bold text-gray-800 mb-2 capitalize">Word: {current.word}</p>
        <p className="text-lg text-gray-600 mb-6">Round {round + 1} of {ROUNDS.length}</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {current.choices.map((choice) => (
            <motion.button
              key={choice}
              type="button"
              onClick={() => handleClick(choice)}
              className={`touch-target rounded-2xl p-6 border-4 font-bold text-xl capitalize ${
                correct && choice === current.correct
                  ? 'bg-jungle-green border-emerald-600 text-white'
                  : 'bg-white border-gray-200 hover:border-jungle-leaf'
              }`}
              animate={
                wrongShake === choice
                  ? { x: [0, -6, 6, -6, 6, 0] }
                  : correct && choice === current.correct
                  ? { scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{ duration: 0.35 }}
            >
              {choice}
            </motion.button>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
