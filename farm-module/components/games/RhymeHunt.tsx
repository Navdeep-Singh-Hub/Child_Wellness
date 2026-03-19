'use client';

import { GameLayout } from '../GameLayout';
import { triggerConfetti } from '../Confetti';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const ROUNDS = [
  { word: 'wave', choices: ['cave', 'ship', 'star', 'fish'], correct: 'cave' },
  { word: 'fish', choices: ['dish', 'boat', 'shell', 'wave'], correct: 'dish' },
  { word: 'shell', choices: ['bell', 'fish', 'sun', 'boat'], correct: 'bell' },
  { word: 'boat', choices: ['goat', 'ship', 'star', 'crab'], correct: 'goat' },
];

export default function RhymeHunt() {
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
      <GameLayout title="I Spy Rhymes" showBack={false} backHref="/ocean-session-2" theme="ocean">
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <motion.p
            className="text-3xl font-bold text-ocean-green"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            Great Job! ⭐
          </motion.p>
          <Link
            href="/ocean-session-2/game/3"
            className="rounded-2xl bg-ocean-coral text-white font-bold text-xl px-8 py-4 shadow-lg"
          >
            Next: Clap the Ocean Words →
          </Link>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="I Spy Rhymes"
      instruction={`I spy something that rhymes with ${current.word}.`}
      backHref="/ocean-session-2"
      theme="ocean"
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
                  ? 'bg-ocean-green border-emerald-600 text-white'
                  : 'bg-white border-gray-200 hover:border-ocean-blue'
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
