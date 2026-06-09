/** OT Level 4 · Session 7 · Game 3 — Moving Arrows · Theme: "Drift Tap" */
import { CrossBodyArrowGame } from '@/components/game/occupational/level4/session7/CrossBodyArrowGame';
import React from 'react';

const MovingArrowsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <CrossBodyArrowGame
    {...props}
    mode="moving"
    theme={{
      title: 'Drift Tap', subtitle: 'Track the moving arrow — tap fast!', emoji: '➡️',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', leftColor: '#8B5CF6', rightColor: '#EF4444',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#6D28D9', statLabel: '#7C3AED', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
    }}
    ttsIntro="Track the moving arrow and tap with the opposite hand!"
    ttsComplete="Great tracking and tapping!"
    ttsCue="Catch the arrow before it drifts away!"
    ttsSuccess="Caught it!"
    congratsMessage="Drift Tap Star!"
    logType="moving-arrows"
    skillTags={['tracking-skills', 'cross-body-coordination', 'visual-motor']}
  />
);

export default MovingArrowsGame;
