/** OT Level 4 · Session 3 · Game 5 — Diagonal Match · Theme: "Corner Match" */
import { DiagonalDragGame } from '@/components/game/occupational/level4/session3/DiagonalDragGame';
import React from 'react';

const DiagonalMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DiagonalDragGame
    {...props}
    mode="colorMatch"
    theme={{
      title: 'Corner Match', subtitle: 'Drag matching colors to the opposite corner', emoji: '🎯',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', draggableEmoji: '🔴', targetEmoji: '🔴',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#D97706', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B', zoneBorder: 'rgba(245,158,11,0.45)',
    }}
    ttsIntro="Drag the matching color to the opposite corner!"
    ttsComplete="Perfect corner matching!"
    ttsDrag="Match the color at the opposite corner!"
    ttsMiss="Drag to the matching corner!"
    congratsMessage="Corner Match Hero!"
    logType="diagonal-match"
    skillTags={['spatial-awareness', 'diagonal-drag']}
  />
);

export default DiagonalMatchGame;
