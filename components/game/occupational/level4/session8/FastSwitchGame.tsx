/** OT Level 4 · Session 8 · Game 5 — Fast Switch · Theme: "Quick Switch" */
import { SideTapGame } from '@/components/game/occupational/level4/session8/SideTapGame';
import React from 'react';

const FastSwitchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SideTapGame
    {...props}
    mode="fast"
    theme={{
      title: 'Quick Switch', subtitle: 'Sides flash faster each round!', emoji: '⚡',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', leftColor: '#F59E0B', rightColor: '#EF4444',
      leftIcon: '⚡', rightIcon: '⚡',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#B45309', statLabel: '#D97706', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B',
    }}
    ttsIntro="Tap the active side — it gets faster each round!"
    ttsComplete="Lightning fast switching!"
    ttsCue="Switch sides quickly!"
    ttsSuccess="Fast!"
    ttsMiss="Too slow!"
    congratsMessage="Quick Switch Star!"
    logType="fast-switch"
    skillTags={['brain-speed', 'rapid-switching', 'alternating-sides', 'reaction-time']}
  />
);

export default FastSwitchGame;
