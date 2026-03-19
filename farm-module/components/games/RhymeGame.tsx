'use client';

import { GameLayout } from '../GameLayout';
import { triggerConfetti } from '../Confetti';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const ROUNDS = [
  { word: 'hen', choices: ['pen', 'hen', 'dog', 'sun'], correct: ['hen', 'pen'] },
  { word: 'pig', choices: ['dig', 'pig', 'cat', 'sun'], correct: ['pig', 'dig'] },
  { word: 'cat', choices: ['hat', 'cat', 'dog', 'run'], correct: ['cat', 'hat'] },
  { word: 'sun', choices: ['bun', 'sun', 'pen', 'dog'], correct: ['sun', 'bun'] },
];

export default function RhymeGame() {
  const { speak } = useAudioPlayer(0.85);
  const [round, setRound] = useState(0);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const current = ROUNDS[round];
  const allFound = current.correct.every((c) => found.has(c));

  useEffect(() => {
    speak(`I spy something that rhymes with ${current.word}.`);
  }, [round, speak, current.word]);

  const handleClick = useCallback(
    (choice: string) => {
      if (current.correct.includes(choice)) {
        if (found.has(choice)) return;
        setFound((s) => new Set(s).add(choice));
        speak('Correct!');
        if (found.size + 1 === current.correct.length) {
          if (round + 1 >= ROUNDS.length) {
            setDone(true);
            triggerConfetti();
            speak('Great job!');
          } else {
            setRound((r) => r + 1);
            setFound(new Set());
          }
        }
      } else {
        setWrongShake(choice);
        speak('Try again');
        setTimeout(() => setWrongShake(null), 500);
      }
    },
    [current, found, round, speak]
  );

  if (done) {
    return (
      <GameLayout title="I Spy Rhyming" showBack={false}>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <motion.p
            className="text-3xl font-bold text-farm-green"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            Great Job! ⭐
          </motion.p>
          <Link
            href="/farm-session-1/game/3"
            className="rounded-2xl bg-farm-sky text-white font-bold text-xl px-8 py-4 shadow-lg"
          >
            Next: Clap It Out →
          </Link>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="I Spy Rhyming"
      instruction={`I spy something that rhymes with ${current.word}.`}
    >
      <div className="flex-1 flex flex-col items-center">
        <p className="text-xl font-bold text-gray-800 mb-6">
          Round {round + 1} of {ROUNDS.length}
        </p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {current.choices.map((choice) => (
            <motion.button
              key={choice}
              type="button"
              onClick={() => handleClick(choice)}
              className={`touch-target rounded-2xl p-6 border-4 font-bold text-xl capitalize ${
                found.has(choice)
                  ? 'bg-farm-green border-green-700 text-white'
                  : 'bg-white border-gray-200 hover:border-farm-sky'
              }`}
              animate={
                wrongShake === choice
                  ? { x: [0, -6, 6, -6, 6, 0] }
                  : found.has(choice)
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
