/** OT Level 4 · Session 9 · Game 4 — Rope Pull · Theme: "Tug Rope" */
import { DualPullGame } from '@/components/game/occupational/level4/session9/DualPullGame';
import React from 'react';

const RopePullGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualPullGame
    {...props}
    theme={{
      title: 'Tug Rope', subtitle: 'Pull both handles outward together!', emoji: '🪢',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', leftColor: '#F59E0B', rightColor: '#EF4444',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#B45309', statLabel: '#D97706', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B',
    }}
    ttsIntro="Pull both rope handles outward at the same time!"
    ttsComplete="Great rope pulling!"
    ttsCue="Pull both handles outward!"
    ttsSuccess="Perfect pull!"
    congratsMessage="Tug Rope Star!"
    logType="rope-pull"
    skillTags={['upper-body-integration', 'simultaneous-pulling', 'bilateral-coordination']}
  />
);

export default RopePullGame;
