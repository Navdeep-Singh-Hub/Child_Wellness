'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ConfettiOnMount } from '@/components/Confetti';

export default function JungleResultPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-jungle-leaf/40 to-jungle-green/30 p-6">
      <ConfettiOnMount />
      <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-white p-8 shadow-2xl border-4 border-jungle-yellow"
        >
          <p className="text-5xl mb-4">🏅</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Jungle Explorer Badge
          </h1>
          <p className="text-xl text-gray-700 mt-4">
            Great job exploring the jungle!
          </p>
          <p className="text-gray-600 mt-2">
            You played sound games, rhyming, syllables, dot maze counting, and your notebook task.
          </p>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-col gap-4 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/jungle-session-3"
            className="block w-full text-center rounded-2xl bg-jungle-green text-white font-bold text-xl py-4 shadow-lg"
          >
            Play again
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
