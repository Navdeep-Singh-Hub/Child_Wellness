/** OT Level 2 · Session 4 · Game 3 — Don't Touch Grass · Theme: "Grass Guard" */
import { PathFollowGame } from '@/components/game/occupational/level2/session4/PathFollowGame';
import { makeWindingPath } from '@/components/game/occupational/level2/session4/traceUtils';
import React from 'react';

const DontTouchGrassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PathFollowGame
    {...props}
    pathMode="wide"
    theme={{
      title: 'Grass Guard', subtitle: 'Stay on the path — don\'t touch the grass!', emoji: '🚶',
      gradient: ['#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC'],
      trackStroke: '#FBBF24', progressStroke: '#16A34A',
      backText: '#15803D', backBorder: 'rgba(22,163,74,0.25)',
      titleColor: '#15803D', subtitleColor: '#16A34A', statLabel: '#16A34A', statValue: '#15803D',
      statBorder: 'rgba(22,163,74,0.2)', playBorder: 'rgba(22,163,74,0.25)', playBg: 'rgba(255,255,255,0.35)',
      objColors: ['#86EFAC', '#16A34A'], sparkleColor: '#16A34A',
    }}
    generatePoints={makeWindingPath}
    ttsIntro="Stay on the path! Don't touch the grass!"
    ttsComplete="Grass guard complete!"
    ttsRetry="Stay on the path, avoid the grass!"
    congratsMessage="Path Pro!"
    logType="dontTouchGrass"
    skillTags={['boundary-awareness', 'sustained-attention', 'path-discipline']}
  />
);

export default DontTouchGrassGame;
