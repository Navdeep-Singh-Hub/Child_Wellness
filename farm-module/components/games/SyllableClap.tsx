'use client';

import { GameLayout } from '../GameLayout';
import { triggerConfetti } from '../Confetti';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const WORDS = [
  { word: 'donkey', syllables: 2, emoji: '🫏' },
  { word: 'chicken', syllables: 2, emoji: '🐔' },
  { word: 'tractor', syllables: 2, emoji: '🚜' },
  { word: 'apple', syllables: 2, emoji: '🍎' },
];

export default function SyllableClap() {
  const { speak } = useAudioPlayer(0.8);
  const [round, setRound] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);

  const current = WORDS[round];

  useEffect(() => {
    speak(current.word);
  }, [round, speak, current.word]);

  const handleClap = useCallback(
    (num: number) => {
      if (current.syllables === num) {
        if (round + 1 >= WORDS.length) {
          setDone(true);
          triggerConfetti();
          speak('Great job!');
        } else {
          setRound((r) => r + 1);
          setWrong(false);
        }
        speak('Correct!');
      } else {
        setWrong(true);
        speak('Try again. Clap the syllables.');
        setTimeout(() => setWrong(false), 800);
      }
    },
    [current, round, speak]
  );

  if (done) {
    return (
      <GameLayout title="Clap It Out" showBack={false}>
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
            href="/farm-session-1/game/4"
            className="rounded-2xl bg-farm-yellow text-gray-900 font-bold text-xl px-8 py-4 shadow-lg"
          >
            Next: Count the Apples →
          </Link>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="Clap It Out"
      instruction="Listen to the word, then tap how many syllables."
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <motion.button
          type="button"
          onClick={() => speak(current.word)}
          className="rounded-2xl bg-farm-sky/90 text-white px-8 py-6 flex items-center gap-4 touch-target border-4 border-white/50"
        >
          <span className="text-4xl">🔊</span>
          <span className="text-2xl font-bold capitalize">{current.word}</span>
        </motion.button>

        <p className="text-lg text-gray-700">Tap the number of claps:</p>
        <div className="flex gap-4">
          {[1, 2, 3].map((n) => (
            <motion.button
              key={n}
              type="button"
              onClick={() => handleClap(n)}
              className={`touch-target rounded-2xl p-6 border-4 font-bold text-2xl min-w-[100px] ${
                wrong ? 'border-red-400 bg-red-50' : 'border-farm-yellow bg-farm-yellow/30'
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
            >
              {'👏 '.repeat(n).trim()}
              <span className="block mt-2">{n}</span>
            </motion.button>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          Word {round + 1} of {WORDS.length}
        </p>
      </div>
    </GameLayout>
  );
}
