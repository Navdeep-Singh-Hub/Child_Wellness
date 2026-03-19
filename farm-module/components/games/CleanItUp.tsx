'use client';

import { GameLayout } from '../GameLayout';
import { triggerConfetti } from '../Confetti';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const TARGET_SOUND = '/c/';
const ITEMS = [
  { id: 'cow', label: 'Cow', correct: true, emoji: '🐄' },
  { id: 'cat', label: 'Cat', correct: true, emoji: '🐱' },
  { id: 'carrot', label: 'Carrot', correct: true, emoji: '🥕' },
  { id: 'dog', label: 'Dog', correct: false, emoji: '🐕' },
  { id: 'pig', label: 'Pig', correct: false, emoji: '🐷' },
  { id: 'barn', label: 'Barn', correct: false, emoji: '🏠' },
].sort(() => Math.random() - 0.5);

const CORRECT_IDS = ITEMS.filter((i) => i.correct).map((i) => i.id);

export default function CleanItUp() {
  const { speak } = useAudioPlayer(0.85);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    speak("Find things that start with the " + TARGET_SOUND + " sound.");
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
      <GameLayout title="Clean It Up" showBack={false}>
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
            href="/farm-session-1/game/2"
            className="rounded-2xl bg-farm-green text-white font-bold text-xl px-8 py-4 shadow-lg"
          >
            Next: I Spy Rhyming →
          </Link>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="Clean It Up"
      instruction={`Find things that start with the ${TARGET_SOUND} sound.`}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1 content-start">
        <AnimatePresence>
          {ITEMS.map((item) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className={`touch-target rounded-2xl p-6 text-left border-4 shadow-lg flex flex-col items-center justify-center min-h-[120px] ${
                selected.has(item.id)
                  ? 'bg-farm-green border-green-700 text-white'
                  : 'bg-white border-gray-200 hover:border-farm-green'
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
        </AnimatePresence>
      </div>
    </GameLayout>
  );
}
