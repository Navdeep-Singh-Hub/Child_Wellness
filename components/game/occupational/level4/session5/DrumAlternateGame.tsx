/** OT Level 4 · Session 5 · Game 3 — Drum Alternate · Theme: "Rhythm Switch" */
import { AlternateTapGame } from '@/components/game/occupational/level4/session5/AlternateTapGame';
import React from 'react';

const DrumAlternateGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AlternateTapGame
    {...props}
    mode="beat"
    theme={{
      title: 'Rhythm Switch', subtitle: 'Alternate left and right drums', emoji: '🥁',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', leftColor: '#F59E0B', rightColor: '#EF4444',
      leftEmoji: '🥁', rightEmoji: '🥁', targetStyle: 'drum',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#D97706', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B',
    }}
    ttsIntro="Tap left drum, then right drum, alternating!"
    ttsComplete="Great rhythm switching!"
    ttsCue="Follow the beat and alternate!"
    ttsSuccess="Perfect rhythm!"
    congratsMessage="Rhythm Switch Master!"
    logType="drum-alternate"
    skillTags={['rhythm-control', 'alternating-hands', 'coordination']}
  />
);

export default DrumAlternateGame;
