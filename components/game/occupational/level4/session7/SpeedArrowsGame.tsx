/** OT Level 4 · Session 7 · Game 5 — Speed Arrows · Theme: "Flash Cross" */
import { CrossBodyArrowGame } from '@/components/game/occupational/level4/session7/CrossBodyArrowGame';
import React from 'react';

const SpeedArrowsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <CrossBodyArrowGame
    {...props}
    mode="speed"
    theme={{
      title: 'Flash Cross', subtitle: 'React fast — arrows get quicker!', emoji: '⚡',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', leftColor: '#F59E0B', rightColor: '#EF4444',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#B45309', statLabel: '#D97706', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B',
    }}
    ttsIntro="Arrows flash faster each round — use the opposite hand!"
    ttsComplete="Lightning fast cross-body skills!"
    ttsCue="React quickly with the opposite hand!"
    ttsSuccess="Fast and correct!"
    congratsMessage="Flash Cross Star!"
    logType="speed-arrows"
    skillTags={['reaction-speed', 'cross-body-coordination', 'visual-motor']}
  />
);

export default SpeedArrowsGame;
