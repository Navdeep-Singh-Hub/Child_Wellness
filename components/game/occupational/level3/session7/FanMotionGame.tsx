/** OT Level 3 · Session 7 · Game 3 — Spin Flow */
import { SwingMotionGame } from '@/components/game/occupational/level3/session7/SwingMotionGame';
import { GAME_THEMES, JUNGLE_CHARACTERS, JUNGLE_SHELL } from '@/components/game/occupational/level3/session7/jungleSwingTheme';
import React from 'react';

const G = GAME_THEMES.fanMotion;

const FanMotionGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SwingMotionGame
    {...props}
    mode="fanMotion"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#F0FDF4', '#DCFCE7', '#86EFAC', '#16A34A'],
      accent: '#22C55E',
      accentDark: '#15803D',
      objectEmoji: JUNGLE_CHARACTERS.wizard.emoji,
      backText: '#166534',
      backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D',
      subtitleColor: '#15803D',
      statLabel: '#22C55E',
      statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)',
      playBorder: 'rgba(34,197,94,0.25)',
      playBg: JUNGLE_SHELL.playBg,
      sparkleColor: JUNGLE_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsCircleMore="Trace a full smooth circle!"
    congratsMessage={G.congrats}
    logType="fan-motion"
    skillTags={['wrist-rotation', 'circular-tracing', 'fine-motor-control', 'gesture-smoothness']}
  />
);

export default FanMotionGame;
