/** OT Level 3 · Session 8 · Game 1 — Touch Head · Theme: "Head Tap" */
import { BodyMapGame } from '@/components/game/occupational/level3/session8/BodyMapGame';
import React from 'react';

const TouchHeadGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyMapGame
    {...props}
    mode="touchHead"
    theme={{
      title: 'Head Tap', subtitle: 'Touch the head when it glows', emoji: '👤',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6',
    }}
    ttsIntro="Touch the head when you see it glow!"
    ttsComplete="Great head tapping!"
    ttsHead="Touch the glowing head!"
    congratsMessage="Head Tap Star!"
    logType="touch-head"
    skillTags={['body-part-awareness', 'head-identification']}
  />
);

export default TouchHeadGame;
