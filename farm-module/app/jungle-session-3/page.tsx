'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const GAME_CARDS = [
  {
    id: 1,
    title: 'Jungle Clean-Up',
    subtitle: 'Find the sound',
    emoji: '🌿',
    href: '/jungle-session-3/game/1',
    color: 'bg-jungle-green',
  },
  {
    id: 2,
    title: 'I Spy Jungle Rhymes',
    subtitle: 'Rhyming search',
    emoji: '👁️',
    href: '/jungle-session-3/game/2',
    color: 'bg-jungle-leaf',
  },
  {
    id: 3,
    title: 'Clap Jungle Words',
    subtitle: 'Syllables',
    emoji: '👏',
    href: '/jungle-session-3/game/3',
    color: 'bg-jungle-yellow',
  },
  {
    id: 4,
    title: 'Monkey Dot Maze',
    subtitle: 'Count the dots',
    emoji: '🐒',
    href: '/jungle-session-3/game/4',
    color: 'bg-amber-500',
  },
];

export default function JungleSessionIntroPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-jungle-green/40 via-jungle-leaf/30 to-jungle-yellow/20">
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <motion.p
          className="text-sm font-semibold text-jungle-green uppercase tracking-wide mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Special Education · Level 2 · Session 3
        </motion.p>
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Jungle Safari
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Explore the jungle and help the animals while learning sounds and counting!
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {GAME_CARDS.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
            >
              <Link
                href={card.href}
                className={`block rounded-2xl ${card.color} p-6 shadow-xl hover:shadow-2xl transition-shadow touch-target border-4 border-white/50`}
              >
                <div className="text-5xl mb-2">{card.emoji}</div>
                <h2 className="text-xl font-bold text-gray-900">{card.title}</h2>
                <p className="text-gray-800/90 text-sm mt-1">{card.subtitle}</p>
                <span className="inline-block mt-4 px-5 py-2 rounded-xl bg-white/90 text-gray-900 font-bold text-lg">
                  Start
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-10 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/jungle-session-3/notebook-task"
            className="block w-full text-center rounded-2xl bg-jungle-green py-4 px-6 font-bold text-lg text-white shadow-lg border-4 border-emerald-600/50"
          >
            📓 Notebook Task
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
