/** OT Level 4 · Session 3 · Game 4 — Zig-Zag Drag · Theme: "Zigzag Run" */
import { DiagonalPathDragGame } from '@/components/game/occupational/level4/session3/DiagonalPathDragGame';
import React from 'react';

const ZigZagDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DiagonalPathDragGame
    {...props}
    theme={{
      title: 'Zigzag Run', subtitle: 'Follow the diagonal zigzag path', emoji: '⚡',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      accent: '#10B981', accentDark: '#047857', pathColor: '#10B981', draggableEmoji: '📦',
      backText: '#065F46', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#064E3B', subtitleColor: '#059669', statLabel: '#10B981', statValue: '#064E3B',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981',
    }}
    ttsIntro="Follow the diagonal zigzag path across the screen!"
    ttsComplete="Great zigzag running!"
    ttsDrag="Follow the zigzag to the corner!"
    ttsMiss="Follow the zigzag path to the end!"
    congratsMessage="Zigzag Run Pro!"
    logType="zigzag-drag"
    skillTags={['direction-switching', 'diagonal-drag']}
  />
);

export default ZigZagDragGame;
