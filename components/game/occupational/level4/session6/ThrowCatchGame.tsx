/** OT Level 4 · Session 6 · Game 2 — Throw & Catch · Theme: "Toss & Grab" */
import { MidlinePassGame } from '@/components/game/occupational/level4/session6/MidlinePassGame';
import React from 'react';

const ThrowCatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlinePassGame
    {...props}
    mode="throwCatch"
    theme={{
      title: 'Toss & Grab', subtitle: 'Throw left, catch right across midline', emoji: '🎾',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', ballEmoji: '🎾',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#B45309', statLabel: '#D97706', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B',
    }}
    ttsIntro="Throw with your left hand and catch with your right!"
    ttsComplete="Amazing toss and grab!"
    ttsCue="Tap left to throw, then right to catch!"
    ttsSuccess="Great catch!"
    congratsMessage="Toss & Grab Star!"
    logType="throw-catch"
    skillTags={['hand-coordination', 'timing', 'throw-catch']}
  />
);

export default ThrowCatchGame;
