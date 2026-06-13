/** OT Level 3 · Session 7 · Game 2 — Vine Swing */
import { SwingMotionGame } from '@/components/game/occupational/level3/session7/SwingMotionGame';
import { GAME_THEMES, JUNGLE_CHARACTERS, JUNGLE_SHELL } from '@/components/game/occupational/level3/session7/jungleSwingTheme';
import React from 'react';

const G = GAME_THEMES.monkeySwing;

const MonkeySwingGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SwingMotionGame
    {...props}
    mode="monkeySwing"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FFFBEB', '#FEF3C7', '#FDE047', '#CA8A04'],
      accent: '#EAB308',
      accentDark: '#A16207',
      objectEmoji: JUNGLE_CHARACTERS.milo.emoji,
      backText: '#854D0E',
      backBorder: 'rgba(234,179,8,0.25)',
      titleColor: '#713F12',
      subtitleColor: '#A16207',
      statLabel: '#CA8A04',
      statValue: '#713F12',
      statBorder: 'rgba(202,138,4,0.2)',
      playBorder: 'rgba(202,138,4,0.25)',
      playBg: JUNGLE_SHELL.playBg,
      sparkleColor: JUNGLE_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsSwingMore="One more vine swing!"
    ttsSwipeMore="Swipe bigger on the vine!"
    congratsMessage={G.congrats}
    logType="monkey-swing"
    skillTags={['diagonal-motion', 'timing', 'motor-planning', 'bilateral-coordination']}
  />
);

export default MonkeySwingGame;
