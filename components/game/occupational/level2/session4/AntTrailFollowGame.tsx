/** OT Level 2 · Session 4 · Game 1 — Ant Trail Follow · Theme: "Trail Trek" */
import { PathFollowGame } from '@/components/game/occupational/level2/session4/PathFollowGame';
import { makeWavyTrail } from '@/components/game/occupational/level2/session4/traceUtils';
import React from 'react';

const AntTrailFollowGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PathFollowGame
    {...props}
    pathMode="dots"
    theme={{
      title: 'Trail Trek', subtitle: 'Follow the dotted ant trail', emoji: '🐜',
      gradient: ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FCD34D'],
      trackStroke: '#92400E', progressStroke: '#B45309',
      backText: '#92400E', backBorder: 'rgba(146,64,14,0.25)',
      titleColor: '#92400E', subtitleColor: '#B45309', statLabel: '#B45309', statValue: '#92400E',
      statBorder: 'rgba(146,64,14,0.2)', playBorder: 'rgba(146,64,14,0.25)', playBg: 'rgba(255,255,255,0.35)',
      objColors: ['#FDE68A', '#D97706'], sparkleColor: '#D97706',
    }}
    generatePoints={makeWavyTrail}
    ttsIntro="Follow the dotted trail from start to finish!"
    ttsComplete="Trail trek complete!"
    ttsRetry="Stay on the dotted trail!"
    congratsMessage="Trail Tracker!"
    logType="antTrailFollow"
    skillTags={['continuous-tracking', 'sustained-attention', 'dotted-trail']}
  />
);

export default AntTrailFollowGame;
