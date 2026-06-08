/** OT Level 4 · Session 5 · Game 5 — Speed Alternate · Theme: "Speed Switch" */
import { AlternateTapGame } from '@/components/game/occupational/level4/session5/AlternateTapGame';
import React from 'react';

const SpeedAlternateGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AlternateTapGame
    {...props}
    mode="speed"
    theme={{
      title: 'Speed Switch', subtitle: 'Start slow, then speed up', emoji: '⚡',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', leftColor: '#3B82F6', rightColor: '#EF4444',
      leftEmoji: '👈', rightEmoji: '👉', targetStyle: 'circle',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#7C3AED', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
    }}
    ttsIntro="Start slow, then speed up as you alternate!"
    ttsComplete="Amazing speed control!"
    ttsCue="Start slow — speed up!"
    ttsSuccess="Perfect speed!"
    congratsMessage="Speed Switch Pro!"
    logType="speed-alternate"
    skillTags={['motor-speed-control', 'alternating-hands', 'speed-progression']}
  />
);

export default SpeedAlternateGame;
