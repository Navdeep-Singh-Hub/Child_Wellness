/** OT Level 3 · Session 3 · Game 7 — Fast Rabbit Run · Theme: "Quick Hop" */
import { SpeedGame } from '@/components/game/occupational/level3/session3/SpeedGame';
import React from 'react';

const FastRabbitRunGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SpeedGame
    {...props}
    mode="dragFast"
    theme={{
      title: 'Quick Hop', subtitle: 'Drag the rabbit quickly to the finish', emoji: '🐰',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', characterEmoji: '🐰',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#B45309', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B', hintText: 'Drag fast to the finish!',
      fastColor: '#F59E0B', slowColor: '#3B82F6',
    }}
    ttsIntro="Drag the rabbit quickly to the finish line!"
    ttsComplete="Super fast running!"
    ttsFast="Drag the rabbit quickly!"
    ttsSlow="Go slow!"
    ttsTooSlow="Drag the rabbit faster!"
    congratsMessage="Speed Rabbit!"
    logType="fast-rabbit-run"
    skillTags={['speed-coordination', 'energy-control', 'motor-planning']}
  />
);

export default FastRabbitRunGame;
