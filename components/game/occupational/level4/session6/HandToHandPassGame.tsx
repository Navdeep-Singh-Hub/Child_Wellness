/** OT Level 4 · Session 6 · Game 1 — Hand-to-Hand Pass · Theme: "Hand Swap" */
import { MidlinePassGame } from '@/components/game/occupational/level4/session6/MidlinePassGame';
import React from 'react';

const HandToHandPassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlinePassGame
    {...props}
    mode="handPass"
    theme={{
      title: 'Hand Swap', subtitle: 'Pass the ball left ↔ right across midline', emoji: '🤲',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', ballEmoji: '⚽',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6',
    }}
    ttsIntro="Pass the ball from left hand to right hand, then back!"
    ttsComplete="Great hand swapping!"
    ttsCue="Tap the hand with the ball to pass across your body!"
    ttsSuccess="Perfect pass!"
    congratsMessage="Hand Swap Star!"
    logType="hand-to-hand-pass"
    skillTags={['midline-awareness', 'hand-coordination', 'ball-pass']}
  />
);

export default HandToHandPassGame;
