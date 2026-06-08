/** OT Level 3 · Session 7 · Game 2 — Monkey Swing · Theme: "Vine Swing" */
import { SwingMotionGame } from '@/components/game/occupational/level3/session7/SwingMotionGame';
import React from 'react';

const MonkeySwingGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SwingMotionGame
    {...props}
    mode="monkeySwing"
    theme={{
      title: 'Vine Swing', subtitle: 'Swipe diagonally to swing the monkey twice', emoji: '🐵',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', objectEmoji: '🐵',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#D97706', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B',
    }}
    ttsIntro="Swing the monkey on the vine! Make two big diagonal swipes!"
    ttsComplete="Amazing vine swinging!"
    ttsSwingMore="One more swing!"
    ttsSwipeMore="Swing farther on the vine!"
    congratsMessage="Vine Swing Hero!"
    logType="monkey-swing"
    skillTags={['diagonal-movement', 'swinging-motion', 'bilateral-coordination']}
  />
);

export default MonkeySwingGame;
