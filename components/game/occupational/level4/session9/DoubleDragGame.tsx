/** OT Level 4 · Session 9 · Game 1 — Double Drag · Theme: "Twin Drag" */
import { DualDragGame } from '@/components/game/occupational/level4/session9/DualDragGame';
import React from 'react';

const DoubleDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualDragGame
    {...props}
    mode="dualTarget"
    theme={{
      title: 'Twin Drag', subtitle: 'Drag both objects to their targets!', emoji: '🤲',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', leftColor: '#3B82F6', rightColor: '#EF4444',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6', zoneBorder: 'rgba(59,130,246,0.45)',
    }}
    ttsIntro="Use both hands to drag both objects at the same time!"
    ttsComplete="Great twin dragging!"
    ttsCue="Drag left and right objects to their targets!"
    ttsSuccess="Both objects placed!"
    congratsMessage="Twin Drag Star!"
    logType="double-drag"
    skillTags={['bilateral-strength', 'simultaneous-dragging', 'coordination']}
  />
);

export default DoubleDragGame;
