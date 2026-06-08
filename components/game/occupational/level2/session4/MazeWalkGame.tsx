/** OT Level 2 · Session 4 · Game 4 — Maze Walk · Theme: "Maze Master" */
import { PathFollowGame } from '@/components/game/occupational/level2/session4/PathFollowGame';
import { makeMazePath } from '@/components/game/occupational/level2/session4/traceUtils';
import React from 'react';

const MazeWalkGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PathFollowGame
    {...props}
    pathMode="wide"
    theme={{
      title: 'Maze Master', subtitle: 'Follow the clear path through the maze', emoji: '🧩',
      gradient: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD'],
      trackStroke: 'rgba(107,114,128,0.4)', progressStroke: '#10B981',
      backText: '#6D28D9', backBorder: 'rgba(109,40,217,0.25)',
      titleColor: '#6D28D9', subtitleColor: '#7C3AED', statLabel: '#7C3AED', statValue: '#6D28D9',
      statBorder: 'rgba(109,40,217,0.2)', playBorder: 'rgba(109,40,217,0.25)', playBg: 'rgba(255,255,255,0.35)',
      objColors: ['#A78BFA', '#7C3AED'], sparkleColor: '#7C3AED',
    }}
    generatePoints={makeMazePath}
    ttsIntro="Follow the clear path through the maze!"
    ttsComplete="Maze master complete!"
    ttsRetry="Stay on the maze path!"
    congratsMessage="Maze Navigator!"
    logType="mazeWalk"
    skillTags={['spatial-planning', 'sustained-attention', 'path-navigation']}
  />
);

export default MazeWalkGame;
