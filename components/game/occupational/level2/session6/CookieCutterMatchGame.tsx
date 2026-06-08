/** OT Level 2 · Session 6 · Game 3 — Cookie Cutter Match · Theme: "Cookie Cut" */
import { DragShapeMatchGame } from '@/components/game/occupational/level2/session6/DragShapeMatchGame';
import React from 'react';

const CookieCutterMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DragShapeMatchGame
    {...props}
    shapePool={['circle', 'square', 'triangle', 'diamond']}
    outlineMode="cookie"
    theme={{
      title: 'Cookie Cut', subtitle: 'Fit the cutter into the outline', emoji: '🍪',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      shapeFill: '#F59E0B', shapeStroke: '#F97316',
      outlineFill: 'none', outlineStroke: '#D97706',
      backText: '#B45309', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#92400E', subtitleColor: '#B45309', statLabel: '#D97706', statValue: '#92400E',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.4)',
      sparkleColor: '#F59E0B',
      rotateBtnBg: 'rgba(255,255,255,0.7)', rotateBtnBorder: 'rgba(245,158,11,0.3)', rotateBtnText: '#92400E',
      hintText: 'Align the cookie cutter for a perfect fit!',
    }}
    ttsIntro="Fit each cookie cutter into its outline!"
    ttsComplete="Perfect fit!"
    ttsWrong="Align the cutter carefully!"
    congratsMessage="Baker Boss!"
    logType="cookieCutterMatch"
    skillTags={['visual-discrimination', 'motor-accuracy', 'alignment-matching']}
  />
);

export default CookieCutterMatchGame;
