'use client';

import { GameLayout } from '../GameLayout';
import { triggerConfetti } from '../Confetti';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import Link from 'next/link';

const TOTAL_APPLES = 3;

export default function DragToCount() {
  const { speak } = useAudioPlayer(0.75);
  const [inBasket, setInBasket] = useState(0);
  const [done, setDone] = useState(false);

  const handleDrop = useCallback(() => {
    if (inBasket >= TOTAL_APPLES) return;
    const next = inBasket + 1;
    setInBasket(next);
    const words = ['One', 'Two', 'Three'];
    speak(words[next - 1]);
    if (next === TOTAL_APPLES) {
      setDone(true);
      triggerConfetti();
      speak('Great job!');
    }
  }, [inBasket, speak]);

  const handleAppleClick = useCallback(() => {
    handleDrop();
  }, [handleDrop]);

  if (done) {
    return (
      <GameLayout title="Count the Apples" showBack={false}>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <motion.p
            className="text-3xl font-bold text-farm-green"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            Great Job! ⭐
          </motion.p>
          <p className="text-2xl font-bold text-gray-800">You counted 3 apples!</p>
          <Link
            href="/farm-session-1/notebook-task"
            className="rounded-2xl bg-orange-400 text-gray-900 font-bold text-xl px-8 py-4 shadow-lg"
          >
            Next: Notebook Task →
          </Link>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      title="Count the Apples"
      instruction="Tap each apple to put it in the basket. Count with me!"
    >
      <div className="flex-1 flex flex-col">
        <div className="flex justify-center gap-6 flex-wrap py-8">
          {Array.from({ length: TOTAL_APPLES - inBasket }, (_, i) => (
            <motion.button
              key={i}
              type="button"
              onClick={handleAppleClick}
              className="touch-target w-24 h-24 rounded-2xl bg-red-500 border-4 border-red-600 flex items-center justify-center text-5xl shadow-lg"
              whileTap={{ scale: 0.9 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                const threshold = typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400;
                if (info.point.y > threshold) {
                  handleDrop();
                }
              }}
            >
              🍎
            </motion.button>
          ))}
        </div>
        <div className="mt-auto flex flex-col items-center pb-8">
          <div
            className="rounded-2xl bg-amber-200 border-4 border-amber-400 p-6 min-w-[200px] text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop();
            }}
          >
            <span className="text-4xl">🧺</span>
            <p className="font-bold text-xl mt-2">Basket</p>
            {inBasket > 0 && (
              <motion.p
                className="text-3xl font-extrabold text-farm-green mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                {inBasket}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
