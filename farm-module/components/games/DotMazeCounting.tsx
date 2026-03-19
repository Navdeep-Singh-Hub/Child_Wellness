'use client';

import { GameLayout } from '../GameLayout';
import { triggerConfetti } from '../Confetti';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const ROUNDS = [3, 6, 2, 5, 1, 4]; // 1-6 dots per round

export default function DotMazeCounting() {
  const { speak } = useAudioPlayer(0.75);
  const [round, setRound] = useState(0);
  const [monkeyStep, setMonkeyStep] = useState(0);
  const [wrongNum, setWrongNum] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const count = ROUNDS[round];

  useEffect(() => {
    speak('Count the dots and move the monkey.');
  }, [round, speak]);

  const handleNumber = useCallback(
    (num: number) => {
      if (num === count) {
        setMonkeyStep(count);
        speak('Correct!');
        triggerConfetti();
        if (round + 1 >= ROUNDS.length) {
          setDone(true);
          speak('Great job!');
        } else {
          setTimeout(() => {
            setRound((r) => r + 1);
            setMonkeyStep(0);
          }, 1200);
        }
      } else {
        setWrongNum(num);
        speak('Try again');
        setTimeout(() => setWrongNum(null), 500);
      }
    },
    [count, round, speak]
  );

  if (done) {
    return (
      <GameLayout title="Monkey Dot Maze" showBack={false} backHref="/jungle-session-3" theme="jungle">
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
            href="/jungle-session-3/notebook-task"
            className="rounded-2xl bg-jungle-green text-white font-bold text-xl px-8 py-4 shadow-lg"
          >
            Next: Notebook Task →
          </Link>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="Monkey Dot Maze"
      instruction="Count the dots and tap the correct number."
      backHref="/jungle-session-3"
      theme="jungle"
    >
      <div className="flex-1 flex flex-col items-center gap-6 py-4">
        {/* Vine path with dots */}
        <div className="w-full max-w-md flex flex-col items-center gap-2">
          <div className="w-full flex items-center justify-between px-1">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <motion.span
                  className="w-8 h-8 rounded-full bg-jungle-yellow border-2 border-amber-600 flex items-center justify-center text-sm font-bold"
                  initial={false}
                  animate={{ scale: i < count ? 1 : 0.3, opacity: i < count ? 1 : 0.4 }}
                  transition={{ duration: 0.3 }}
                >
                  {i < count ? '•' : ''}
                </motion.span>
                <div className="w-full h-2 bg-amber-800/80 rounded mt-1" />
              </div>
            ))}
          </div>
          <div className="w-full relative h-14">
            <motion.span
              className="text-5xl absolute -top-1"
              initial={false}
              animate={{
                left: `${(monkeyStep / 6) * 100}%`,
                x: '-50%',
              }}
              transition={{ type: 'spring', stiffness: 150, damping: 20 }}
              style={{ width: 48 }}
            >
              🐒
            </motion.span>
          </div>
        </div>

        <p className="text-lg text-gray-700">How many dots? Tap the number:</p>
        <div className="flex gap-3 flex-wrap justify-center">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <motion.button
              key={num}
              type="button"
              onClick={() => handleNumber(num)}
              className={`rounded-2xl w-14 h-14 flex items-center justify-center border-4 font-bold text-xl touch-target ${
                wrongNum === num
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : 'border-jungle-green bg-jungle-leaf/30 text-gray-900'
              }`}
              animate={wrongNum === num ? { x: [0, -4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {num}
            </motion.button>
          ))}
        </div>
        <p className="text-sm text-gray-500">Round {round + 1} of {ROUNDS.length}</p>
      </div>
    </GameLayout>
  );
}
