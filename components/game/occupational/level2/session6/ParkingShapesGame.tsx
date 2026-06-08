/** OT Level 2 · Session 6 · Game 4 — Parking Shapes · Theme: "Park & Turn" */
import { DragShapeMatchGame } from '@/components/game/occupational/level2/session6/DragShapeMatchGame';
import React from 'react';

const ParkingShapesGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DragShapeMatchGame
    {...props}
    shapePool={['rectangle', 'oval', 'arrow', 'heart']}
    outlineMode="stroke"
    requireRotation
    theme={{
      title: 'Park & Turn', subtitle: 'Park with the right orientation', emoji: '🅿️',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#10B981'],
      shapeFill: '#10B981', shapeStroke: '#059669',
      outlineFill: 'none', outlineStroke: '#059669',
      backText: '#047857', backBorder: 'rgba(16,185,129,0.25)',
      titleColor: '#065F46', subtitleColor: '#047857', statLabel: '#059669', statValue: '#065F46',
      statBorder: 'rgba(16,185,129,0.2)', playBorder: 'rgba(16,185,129,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#10B981',
      rotateBtnBg: 'rgba(255,255,255,0.75)', rotateBtnBorder: 'rgba(16,185,129,0.3)', rotateBtnText: '#065F46',
      hintText: 'Drag into the spot and rotate to match!',
    }}
    ttsIntro="Park each shape with the correct orientation!"
    ttsComplete="Parked perfectly!"
    ttsWrong="Check position and rotation!"
    congratsMessage="Parking Pro!"
    logType="parkingShapes"
    skillTags={['visual-discrimination', 'motor-accuracy', 'orientation-matching']}
  />
);

export default ParkingShapesGame;
