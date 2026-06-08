/** OT Level 2 · Session 6 · Game 1 — Puzzle Drop Shapes · Theme: "Shape Slot" */
import { DragShapeMatchGame } from '@/components/game/occupational/level2/session6/DragShapeMatchGame';
import React from 'react';

const PuzzleDropShapesGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DragShapeMatchGame
    {...props}
    shapePool={['circle', 'square', 'triangle', 'star']}
    outlineMode="puzzle"
    theme={{
      title: 'Shape Slot', subtitle: 'Drag each shape into its outline', emoji: '🧩',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      shapeFill: '#8B5CF6', shapeStroke: '#7C3AED',
      outlineFill: 'none', outlineStroke: '#6D28D9',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#5B21B6', subtitleColor: '#6D28D9', statLabel: '#7C3AED', statValue: '#5B21B6',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
      rotateBtnBg: 'rgba(255,255,255,0.7)', rotateBtnBorder: 'rgba(139,92,246,0.3)', rotateBtnText: '#5B21B6',
      hintText: 'Drop the shape into the matching slot!',
    }}
    ttsIntro="Drag each shape into its outline!"
    ttsComplete="All shapes slotted!"
    ttsWrong="Try the matching slot!"
    congratsMessage="Puzzle Pro!"
    logType="puzzleDropShapes"
    skillTags={['visual-discrimination', 'motor-accuracy', 'shape-matching']}
  />
);

export default PuzzleDropShapesGame;
