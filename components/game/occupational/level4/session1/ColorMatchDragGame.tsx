/** OT Level 4 · Session 1 · Game 4 — Color Match Drag · Theme: "Color Slide" */
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/HorizontalDragGame';
import React from 'react';

const ColorMatchDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame
    {...props}
    mode="colorMatch"
    theme={{
      title: 'Color Slide', subtitle: 'Drag the color to its matching zone', emoji: '🎨',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#22C55E'],
      accent: '#22C55E', accentDark: '#15803D', draggableEmoji: '🔴', targetEmoji: '🎯',
      backText: '#166534', backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D', subtitleColor: '#16A34A', statLabel: '#22C55E', statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)', playBorder: 'rgba(34,197,94,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#22C55E', zoneBorder: 'rgba(34,197,94,0.45)',
    }}
    ttsIntro="Match the color on the left to the same color on the right!"
    ttsComplete="Color matching master!"
    ttsDrag="Slide to the matching color!"
    ttsColorWrong="Match the same color!"
    congratsMessage="Color Slide Star!"
    logType="color-match-drag"
    skillTags={['visual-matching', 'motor', 'drag-left-right']}
  />
);

export default ColorMatchDragGame;
