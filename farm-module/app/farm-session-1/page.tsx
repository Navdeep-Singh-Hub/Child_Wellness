'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const GAME_CARDS = [
  {
    id: 1,
    title: 'Clean It Up',
    subtitle: 'Find the sound',
    emoji: '🧹',
    href: '/farm-session-1/game/1',
    color: 'bg-farm-green',
  },
  {
    id: 2,
    title: 'I Spy',
    subtitle: 'Rhyming Game',
    emoji: '👁️',
    href: '/farm-session-1/game/2',
    color: 'bg-farm-sky',
  },
  {
    id: 3,
    title: 'Clap It Out',
    subtitle: 'Syllables',
    emoji: '👏',
    href: '/farm-session-1/game/3',
    color: 'bg-farm-yellow',
  },
  {
    id: 4,
    title: 'Count the Apples',
    subtitle: 'Drag to count',
    emoji: '🍎',
    href: '/farm-session-1/game/4',
    color: 'bg-orange-400',
  },
];

export default function FarmSessionIntroPage() {
  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-b from-farm-sky/40 via-farm-green/20 to-amber-100/60"
      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234CAF50\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <motion.p
          className="text-sm font-semibold text-farm-green uppercase tracking-wide mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Special Education · Level 2 · Session 1
        </motion.p>
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Help on the Farm
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Let&apos;s help the farmer by playing fun sound and counting games!
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
            href="/farm-session-1/notebook-task"
            className="block w-full text-center rounded-2xl bg-amber-400 py-4 px-6 font-bold text-lg text-gray-900 shadow-lg border-4 border-amber-500/50"
          >
            📓 Notebook Task
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
