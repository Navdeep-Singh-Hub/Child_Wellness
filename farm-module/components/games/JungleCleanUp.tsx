'use client';

import { GameLayout } from '../GameLayout';
import { triggerConfetti } from '../Confetti';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const TARGET_SOUND = '/l/';
const ITEMS = [
  { id: 'lion', label: 'Lion', correct: true, emoji: '🦁' },
  { id: 'leaf', label: 'Leaf', correct: true, emoji: '🍃' },
  { id: 'log', label: 'Log', correct: true, emoji: '🪵' },
  { id: 'tiger', label: 'Tiger', correct: false, emoji: '🐯' },
  { id: 'banana', label: 'Banana', correct: false, emoji: '🍌' },
  { id: 'snake', label: 'Snake', correct: false, emoji: '🐍' },
].sort(() => Math.random() - 0.5);

const CORRECT_IDS = ITEMS.filter((i) => i.correct).map((i) => i.id);

export default function JungleCleanUp() {
  const { speak } = useAudioPlayer(0.85);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    speak("The jungle needs help! Find objects that start with the " + TARGET_SOUND + " sound.");
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
      <GameLayout title="Jungle Clean-Up" showBack={false} backHref="/jungle-session-3" theme="jungle">
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
            href="/jungle-session-3/game/2"
            className="rounded-2xl bg-jungle-leaf text-gray-900 font-bold text-xl px-8 py-4 shadow-lg"
          >
            Next: I Spy Jungle Rhymes →
          </Link>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="Jungle Clean-Up"
      instruction="Find objects that start with the /l/ sound."
      backHref="/jungle-session-3"
      theme="jungle"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 content-start">
        {ITEMS.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => handleClick(item)}
            className={`touch-target rounded-2xl p-6 text-left border-4 shadow-lg flex flex-col items-center justify-center min-h-[120px] ${
              selected.has(item.id)
                ? 'bg-jungle-green border-emerald-700 text-white ring-4 ring-jungle-green/50'
                : 'bg-white border-gray-200 hover:border-jungle-green'
            }`}
            animate={
              wrongShake === item.id
                ? { x: [0, -8, 8, -8, 8, 0] }
                : selected.has(item.id)
                ? { scale: [1, 1.05, 1] }
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
