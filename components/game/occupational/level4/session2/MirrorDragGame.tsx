/** OT Level 4 · Session 2 · Game 3 — Mirror Drag · Theme: "Cross Reach" */
import { ReverseHorizontalDragGame } from '@/components/game/occupational/level4/session2/ReverseHorizontalDragGame';
import React from 'react';

const MirrorDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReverseHorizontalDragGame
    {...props}
    mode="mirrorDrag"
    theme={{
      title: 'Cross Reach', subtitle: 'Use your right hand to drag to the left', emoji: '👋',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      accent: '#10B981', accentDark: '#047857', draggableEmoji: '👉', targetEmoji: '🎯',
      backText: '#065F46', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#064E3B', subtitleColor: '#059669', statLabel: '#10B981', statValue: '#064E3B',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981', zoneBorder: 'rgba(16,185,129,0.45)',
    }}
    ttsIntro="Use your right hand to drag from right to the left target!"
    ttsComplete="Perfect cross-body reaching!"
    ttsDrag="Reach across to the left target!"
    ttsMiss="Drag to the left target!"
    congratsMessage="Cross Reach Pro!"
    logType="mirror-drag"
    skillTags={['brain-hand-sync', 'drag-right-left']}
  />
);

export default MirrorDragGame;
