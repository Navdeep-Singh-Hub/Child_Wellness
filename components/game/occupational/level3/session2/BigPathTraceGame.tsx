/** OT Level 3 · Session 2 · Game 5 — Big Path Trace · Theme: "Road Trace" */
import { ScaleMoveGame } from '@/components/game/occupational/level3/session2/ScaleMoveGame';
import React from 'react';

const BigPathTraceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ScaleMoveGame
    {...props}
    mode="path"
    theme={{
      title: 'Road Trace', subtitle: 'Trace the wide road or the thin road', emoji: '🛤️',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', bigColor: '#7C3AED', smallColor: '#A78BFA',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#6D28D9', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6', hintText: 'Stay on the road from green to red!',
    }}
    ttsIntro="Trace the wide road or the thin road with your finger!"
    ttsComplete="Great path tracing!"
    ttsBig="Trace the wide road!"
    ttsSmall="Trace the thin road!"
    congratsMessage="Road Ranger!"
    logType="bigPathTrace"
    skillTags={['fine-motor', 'visual-motor', 'movement-scaling']}
  />
);

export default BigPathTraceGame;
