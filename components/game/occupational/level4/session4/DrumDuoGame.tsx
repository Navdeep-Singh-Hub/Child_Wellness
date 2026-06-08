/** OT Level 4 · Session 4 · Game 3 — Drum Duo · Theme: "Beat Duo" */
import { DualTapGame } from '@/components/game/occupational/level4/session4/DualTapGame';
import React from 'react';

const DrumDuoGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualTapGame
    {...props}
    mode="drums"
    theme={{
      title: 'Beat Duo', subtitle: 'Tap both drums on the beat', emoji: '🥁',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', leftColor: '#F59E0B', rightColor: '#EF4444',
      leftEmoji: '🥁', rightEmoji: '🥁', targetStyle: 'drum',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#D97706', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B',
    }}
    ttsIntro="Tap both drums together on the beat!"
    ttsComplete="Great rhythm duo!"
    ttsCue="Tap both drums!"
    congratsMessage="Beat Duo Master!"
    logType="drum-duo"
    skillTags={['rhythm', 'coordination', 'two-hand-tap']}
  />
);

export default DrumDuoGame;
