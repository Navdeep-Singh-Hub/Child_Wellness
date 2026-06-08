/** OT Level 4 · Session 4 · Game 1 — Double Circle Tap · Theme: "Twin Tap" */
import { DualTapGame } from '@/components/game/occupational/level4/session4/DualTapGame';
import React from 'react';

const DoubleCircleTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualTapGame
    {...props}
    mode="circles"
    theme={{
      title: 'Twin Tap', subtitle: 'Tap both circles at the same time', emoji: '⭕',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', leftColor: '#3B82F6', rightColor: '#EF4444',
      leftEmoji: '👈', rightEmoji: '👉', targetStyle: 'circle',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6',
    }}
    ttsIntro="Tap both circles with both hands at the same time!"
    ttsComplete="Great twin tapping!"
    ttsCue="Tap both circles together!"
    congratsMessage="Twin Tap Star!"
    logType="double-circle-tap"
    skillTags={['bilateral-coordination', 'two-hand-tap']}
  />
);

export default DoubleCircleTapGame;
