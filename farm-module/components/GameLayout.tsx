'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';

type Theme = 'farm' | 'ocean' | 'jungle';

interface GameLayoutProps {
  title: string;
  instruction?: string;
  children: ReactNode;
  showBack?: boolean;
  backHref?: string;
  theme?: Theme;
}

const THEME_STYLES: Record<Theme, { bg: string; accent: string }> = {
  farm: { bg: 'bg-gradient-to-b from-farm-sky/30 to-farm-green/20', accent: 'text-farm-green' },
  ocean: { bg: 'bg-gradient-to-b from-ocean-blue/30 to-ocean-green/30', accent: 'text-ocean-blue' },
  jungle: { bg: 'bg-gradient-to-b from-jungle-leaf/40 to-jungle-green/30', accent: 'text-jungle-green' },
};

export function GameLayout({
  title,
  instruction,
  children,
  showBack = true,
  backHref = '/farm-session-1',
  theme = 'farm',
}: GameLayoutProps) {
  const styles = THEME_STYLES[theme];
  return (
    <div className={`min-h-screen flex flex-col ${styles.bg} p-4 md:p-6`}>
      <header className="flex items-center gap-4 mb-4">
        {showBack && (
          <Link
            href={backHref}
            className={`touch-target flex items-center justify-center rounded-2xl bg-white/90 shadow-lg font-bold text-lg px-4 ${styles.accent}`}
          >
            ← Back
          </Link>
        )}
        <div className="flex-1 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h1>
          {instruction && (
            <p className="text-base md:text-lg text-gray-700 mt-1">{instruction}</p>
          )}
        </div>
        {showBack && <div className="w-16" />}
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
