/** OT Level 2 · Session 10 · Game 5 — Mirror Maze · Theme: "Twin Trek" */
import { MirrorGame } from '@/components/game/occupational/level2/session10/MirrorGame';
import React from 'react';

const MirrorMazeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorGame
    {...props}
    mode="maze"
    theme={{
      title: 'Twin Trek', subtitle: 'Drag left — the right side mirrors', emoji: '🔄',
      gradient: ['#F0FDF4', '#DCFCE7', '#86EFAC', '#22C55E'],
      strokeColor: '#22C55E', guideStroke: '#94A3B8', accentColor: '#22C55E',
      objectColor: '#22C55E', goalColor: '#EF4444', faceStroke: '#FCD34D',
      backText: '#15803D', backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#166534', subtitleColor: '#15803D', statLabel: '#16A34A', statValue: '#166534',
      statBorder: 'rgba(34,197,94,0.2)', playBorder: 'rgba(34,197,94,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#22C55E', hintText: 'Move both dots to the green goals together!',
    }}
    ttsIntro="Move both objects together. Drag on the left, right mirrors!"
    ttsComplete="Maze complete!"
    ttsIncomplete="Reach the goal!"
    congratsMessage="Twin Navigator!"
    logType="mirrorMaze"
    skillTags={['bilateral-coordination', 'spatial-awareness', 'mirror-drawing']}
  />
);

export default MirrorMazeGame;
