'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const GAME_CARDS = [
  {
    id: 1,
    title: 'Clean the Beach',
    subtitle: 'Find the sound',
    emoji: '🏖️',
    href: '/ocean-session-2/game/1',
    color: 'bg-ocean-green',
  },
  {
    id: 2,
    title: 'I Spy Rhymes',
    subtitle: 'Rhyming hunt',
    emoji: '👁️',
    href: '/ocean-session-2/game/2',
    color: 'bg-ocean-blue',
  },
  {
    id: 3,
    title: 'Clap the Ocean Words',
    subtitle: 'Syllables',
    emoji: '👏',
    href: '/ocean-session-2/game/3',
    color: 'bg-ocean-coral',
  },
  {
    id: 4,
    title: 'Count the Sea Creatures',
    subtitle: 'Match sets to numbers',
    emoji: '🐚',
    href: '/ocean-session-2/game/4',
    color: 'bg-ocean-blue',
  },
];

export default function OceanSessionIntroPage() {
  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-b from-ocean-blue/50 via-ocean-green/20 to-ocean-coral/20"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40 Q20 30 40 40 T80 40 L80 80 L0 80 Z' fill='%2338BDF8' fill-opacity='0.15'/%3E%3Cpath d='M0 50 Q25 38 50 50 T100 50' fill='none' stroke='%2334D399' stroke-opacity='0.2' stroke-width='2'/%3E%3C/svg%3E")`,
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <motion.p
          className="text-sm font-semibold text-ocean-blue uppercase tracking-wide mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Special Education · Level 2 · Session 2
        </motion.p>
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Ocean Adventure
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Help clean the ocean and learn fun word and counting games!
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
            href="/ocean-session-2/notebook-task"
            className="block w-full text-center rounded-2xl bg-ocean-coral py-4 px-6 font-bold text-lg text-white shadow-lg border-4 border-pink-400/50"
          >
            📓 Notebook Task
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
