/** OT Level 3 · Session 8 · Game 2 — Shoulders Tap · Theme: "Shoulder Pick" */
import { BodyMapGame } from '@/components/game/occupational/level3/session8/BodyMapGame';
import React from 'react';

const ShouldersTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyMapGame
    {...props}
    mode="shouldersTap"
    theme={{
      title: 'Shoulder Pick', subtitle: 'Touch the highlighted shoulder', emoji: '💪',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#D97706', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B',
    }}
    ttsIntro="Touch the shoulder that glows — left or right!"
    ttsComplete="Shoulder master!"
    ttsShoulder="Touch the glowing shoulder!"
    ttsWrongShoulder="Touch the other shoulder!"
    congratsMessage="Shoulder Pick Pro!"
    logType="shoulders-tap"
    skillTags={['body-part-awareness', 'left-right-discrimination']}
  />
);

export default ShouldersTapGame;
