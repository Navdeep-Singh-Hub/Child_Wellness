/** OT Level 3 · Session 7 · Game 1 — Copy Swing */
import { SwingMotionGame } from '@/components/game/occupational/level3/session7/SwingMotionGame';
import { GAME_THEMES, JUNGLE_CHARACTERS, JUNGLE_GRADIENT, JUNGLE_SHELL } from '@/components/game/occupational/level3/session7/jungleSwingTheme';
import React from 'react';

const G = GAME_THEMES.pendulumCopy;

const PendulumCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SwingMotionGame
    {...props}
    mode="pendulumCopy"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#2563EB'],
      accent: '#3B82F6',
      accentDark: '#1D4ED8',
      objectEmoji: '⚪',
      demoEmoji: JUNGLE_CHARACTERS.captain.emoji,
      backText: '#1E3A8A',
      backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A',
      subtitleColor: '#2563EB',
      statLabel: '#3B82F6',
      statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)',
      playBorder: 'rgba(59,130,246,0.25)',
      playBg: JUNGLE_SHELL.playBg,
      sparkleColor: JUNGLE_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsCopyPrompt="Now copy the side-to-side swing!"
    congratsMessage={G.congrats}
    logType="pendulum-copy"
    skillTags={['motion-imitation', 'rhythm', 'spatial-awareness', 'visual-tracking']}
  />
);

export default PendulumCopyGame;
