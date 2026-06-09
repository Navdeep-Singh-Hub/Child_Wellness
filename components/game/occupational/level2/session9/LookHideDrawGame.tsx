/** OT Level 2 · Session 9 · Game 5 — Look–Hide–Draw · Theme: "Memory Sketch" */
import { MemoryPatternGame } from '@/components/game/occupational/level2/session9/MemoryPatternGame';
import React from 'react';

const LookHideDrawGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MemoryPatternGame
    {...props}
    theme={{
      title: 'Memory Sketch', subtitle: 'Remember the pattern when it disappears', emoji: '👁️',
      gradient: ['#FDF2F8', '#FCE7F3', '#F9A8D4', '#EC4899'],
      shapeStroke: '#64748B', selectedBorder: '#EC4899',
      backText: '#BE185D', backBorder: 'rgba(236,72,153,0.25)',
      titleColor: '#9D174D', subtitleColor: '#BE185D', statLabel: '#DB2777', statValue: '#9D174D',
      statBorder: 'rgba(236,72,153,0.2)', playBorder: 'rgba(236,72,153,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EC4899', phaseText: '#BE185D', hintText: 'Watch the shape, then pick it from memory!',
      btnBg: 'rgba(255,255,255,0.85)', btnBorder: 'rgba(236,72,153,0.3)',
    }}
    ttsIntro="Look at the pattern carefully!"
    ttsHidden="Pattern is hidden. Remember it!"
    ttsSelect="Now select the pattern you saw!"
    ttsComplete="Memory sketch complete!"
    ttsWrong="Try again — remember the shape!"
    congratsMessage="Memory Master!"
    logType="lookHideDraw"
    skillTags={['visual-memory', 'reproduction', 'pattern-copying']}
  />
);

export default LookHideDrawGame;
