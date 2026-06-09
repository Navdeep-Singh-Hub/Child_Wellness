/** OT Level 4 · Session 9 · Game 5 — Balance Drag · Theme: "Even Pull" */
import { BalanceDualDragGame } from '@/components/game/occupational/level4/session9/BalanceDualDragGame';
import React from 'react';

const BalanceDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BalanceDualDragGame
    {...props}
    theme={{
      title: 'Even Pull', subtitle: 'Drag both down at the same speed!', emoji: '⚖️',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', leftColor: '#EF4444', rightColor: '#3B82F6',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#B91C1C', statLabel: '#DC2626', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444',
    }}
    ttsIntro="Drag both objects down to the balance line at the same pace!"
    ttsComplete="Great balanced dragging!"
    ttsCue="Keep both hands moving at the same speed!"
    ttsSuccess="Perfect balance!"
    congratsMessage="Even Pull Star!"
    logType="balance-drag"
    skillTags={['speed-regulation', 'balanced-pace', 'simultaneous-dragging', 'coordination']}
  />
);

export default BalanceDragGame;
