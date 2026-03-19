'use client';

import { GameLayout } from '../GameLayout';
import { triggerConfetti } from '../Confetti';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const TARGET_SOUND = '/f/';
const ITEMS = [
  { id: 'fish', label: 'Fish', correct: true, emoji: '🐟' },
  { id: 'frog', label: 'Frog', correct: true, emoji: '🐸' },
  { id: 'flag', label: 'Flag', correct: true, emoji: '🚩' },
  { id: 'crab', label: 'Crab', correct: false, emoji: '🦀' },
  { id: 'whale', label: 'Whale', correct: false, emoji: '🐋' },
  { id: 'shell', label: 'Shell', correct: false, emoji: '🐚' },
].sort(() => Math.random() - 0.5);

const CORRECT_IDS = ITEMS.filter((i) => i.correct).map((i) => i.id);

export default function OceanCleanUp() {
  const { speak } = useAudioPlayer(0.85);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    speak("The beach is messy! Help pick the sea items that start with the " + TARGET_SOUND + " sound.");
  }, [speak]);

  const handleClick = useCallback(
    (item: (typeof ITEMS)[0]) => {
      if (done) return;
      if (item.correct) {
        if (selected.has(item.id)) return;
        setSelected((s) => new Set(s).add(item.id));
        speak('Correct!');
        if (selected.size + 1 === CORRECT_IDS.length) {
          setDone(true);
          triggerConfetti();
          speak('Great job!');
        }
      } else {
        setWrongShake(item.id);
        speak('Try again');
        setTimeout(() => setWrongShake(null), 500);
      }
    },
    [done, selected, speak]
  );

  if (done) {
    return (
      <GameLayout title="Clean the Beach" showBack={false} backHref="/ocean-session-2" theme="ocean">
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
            href="/ocean-session-2/game/2"
            className="rounded-2xl bg-ocean-blue text-white font-bold text-xl px-8 py-4 shadow-lg"
          >
            Next: I Spy Rhymes →
          </Link>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="Clean the Beach"
      instruction="Find things that start with the /f/ sound."
      backHref="/ocean-session-2"
      theme="ocean"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 content-start">
        {ITEMS.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => handleClick(item)}
            className={`touch-target rounded-2xl p-6 text-left border-4 shadow-lg flex flex-col items-center justify-center min-h-[120px] ${
              selected.has(item.id)
                ? 'bg-ocean-green border-emerald-600 text-white ring-4 ring-ocean-green/50'
                : 'bg-white border-gray-200 hover:border-ocean-blue'
            }`}
            animate={
              wrongShake === item.id
                ? { x: [0, -8, 8, -8, 8, 0] }
                : selected.has(item.id)
                ? { scale: [1, 1.05, 1], boxShadow: ['0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 0 0 8px rgba(52, 211, 153, 0.3)', '0 10px 15px -3px rgb(0 0 0 / 0.1)'] }
                : {}
            }
            transition={{ duration: 0.4 }}
          >
            <span className="text-4xl mb-1">{item.emoji}</span>
            <span className="font-bold text-lg">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </GameLayout>
  );
}
