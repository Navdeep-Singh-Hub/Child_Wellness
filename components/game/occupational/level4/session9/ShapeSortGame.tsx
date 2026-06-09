/** OT Level 4 · Session 9 · Game 3 — Shape Sort · Theme: "Box Sort" */
import { DualDragGame } from '@/components/game/occupational/level4/session9/DualDragGame';
import React from 'react';

const ShapeSortGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualDragGame
    {...props}
    mode="shapeSort"
    theme={{
      title: 'Box Sort', subtitle: 'Circle left, square right — both at once!', emoji: '📦',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', leftColor: '#3B82F6', rightColor: '#10B981',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#6D28D9', statLabel: '#7C3AED', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6', zoneBorder: 'rgba(139,92,246,0.45)',
    }}
    ttsIntro="Sort circle and square into their boxes using both hands!"
    ttsComplete="Great simultaneous sorting!"
    ttsCue="Circle to left box, square to right box!"
    ttsSuccess="Perfect sorting!"
    congratsMessage="Box Sort Star!"
    logType="shape-sort"
    skillTags={['multitasking', 'simultaneous-dragging', 'sorting', 'categorization']}
  />
);

export default ShapeSortGame;
