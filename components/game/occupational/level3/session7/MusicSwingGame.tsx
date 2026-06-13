/** OT Level 3 · Session 7 · Game 5 — Beat Swing */
import { SwingMotionGame } from '@/components/game/occupational/level3/session7/SwingMotionGame';
import { GAME_THEMES, JUNGLE_CHARACTERS, JUNGLE_SHELL } from '@/components/game/occupational/level3/session7/jungleSwingTheme';
import React from 'react';

const G = GAME_THEMES.musicSwing;

const MusicSwingGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SwingMotionGame
    {...props}
    mode="musicSwing"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FAF5FF', '#F3E8FF', '#D8B4FE', '#9333EA'],
      accent: '#A855F7',
      accentDark: '#7E22CE',
      objectEmoji: JUNGLE_CHARACTERS.sammy.emoji,
      backText: '#6B21A8',
      backBorder: 'rgba(168,85,247,0.25)',
      titleColor: '#581C87',
      subtitleColor: '#7E22CE',
      statLabel: '#A855F7',
      statValue: '#581C87',
      statBorder: 'rgba(168,85,247,0.2)',
      playBorder: 'rgba(168,85,247,0.25)',
      playBg: JUNGLE_SHELL.playBg,
      sparkleColor: JUNGLE_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsMusicPrompt="Now swing left and right on each beat!"
    ttsBeatMiss="Swing on the beat!"
    ttsSwipeMore="Swing farther on the beat!"
    congratsMessage={G.congrats}
    logType="music-swing"
    skillTags={['rhythm-synchronization', 'motor-timing', 'auditory-processing', 'bilateral-coordination']}
  />
);

export default MusicSwingGame;
