'use client';

import { GameLayout } from '../GameLayout';
import { triggerConfetti } from '../Confetti';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';

const ROUNDS = [
  { emoji: '🐚', count: 4, label: 'shells' },
  { emoji: '⭐', count: 5, label: 'starfish' },
  { emoji: '🐟', count: 3, label: 'fish' },
  { emoji: '🦀', count: 2, label: 'crabs' },
  { emoji: '🐢', count: 1, label: 'turtle' },
];

const NUMBERS = [1, 2, 3, 4, 5];

export default function MatchSetsToNumbers() {
  const { speak } = useAudioPlayer(0.75);
  const [round, setRound] = useState(0);
  const [matched, setMatched] = useState(false);
  const [wrongTarget, setWrongTarget] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const numberRefs = useRef<Record<number, HTMLElement | null>>({});

  const current = ROUNDS[round];

  const handleDrop = useCallback(
    (num: number) => {
      if (num === current.count) {
        setMatched(true);
        speak('Correct!');
        triggerConfetti();
        if (round + 1 >= ROUNDS.length) {
          setDone(true);
          speak('Great job!');
        } else {
          setTimeout(() => {
            setRound((r) => r + 1);
            setMatched(false);
          }, 1000);
        }
      } else {
        setWrongTarget(num);
        speak('Try again');
        setTimeout(() => setWrongTarget(null), 600);
      }
    },
    [current, round, speak]
  );

  const checkDropTarget = useCallback(
    (clientX: number, clientY: number) => {
      for (const num of NUMBERS) {
        const el = numberRefs.current[num];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
          handleDrop(num);
          return;
        }
      }
    },
    [handleDrop]
  );

  if (done) {
    return (
      <GameLayout title="Count the Sea Creatures" showBack={false} backHref="/ocean-session-2" theme="ocean">
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
            href="/ocean-session-2/notebook-task"
            className="rounded-2xl bg-ocean-coral text-white font-bold text-xl px-8 py-4 shadow-lg"
          >
            Next: Notebook Task →
          </Link>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="Count the Sea Creatures"
      instruction="Drag the group to the correct number."
      backHref="/ocean-session-2"
      theme="ocean"
    >
      <div className="flex-1 flex flex-col items-center gap-8 py-6">
        <p className="text-lg text-gray-700">How many? Drag to the number.</p>

        <motion.div
          className="flex gap-2 flex-wrap justify-center p-6 rounded-2xl bg-white/80 border-4 border-ocean-blue min-h-[100px] items-center cursor-grab active:cursor-grabbing touch-target"
          drag
          dragConstraints={{ left: -200, right: 200, top: -100, bottom: 100 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            checkDropTarget(info.point.x, info.point.y);
          }}
          animate={matched ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {Array.from({ length: current.count }, (_, i) => (
            <span key={i} className="text-4xl">
              {current.emoji}
            </span>
          ))}
        </motion.div>

        <div className="flex gap-3 flex-wrap justify-center">
          {NUMBERS.map((num) => (
            <motion.button
              key={num}
              type="button"
              ref={(el) => { numberRefs.current[num] = el; }}
              data-number={num}
              onClick={() => handleDrop(num)}
              className={`rounded-2xl w-16 h-16 flex items-center justify-center border-4 font-bold text-2xl touch-target ${
                wrongTarget === num
                  ? 'border-red-400 bg-red-50 text-red-600'
                  : 'border-ocean-green bg-ocean-green/20 text-gray-900'
              }`}
              animate={wrongTarget === num ? { x: [0, -4, 4, -4, 4, 0] } : {}}
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
