/** OT Level 4 · Session 3 · Game 2 — X Path Trace · Theme: "X Trace" */
import { DiagonalXPathGame } from '@/components/game/occupational/level4/session3/DiagonalXPathGame';
import React from 'react';

const XPathTraceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DiagonalXPathGame
    {...props}
    theme={{
      title: 'X Trace', subtitle: 'Trace both diagonals to complete the X', emoji: '❌',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', pathColor: '#8B5CF6', draggableEmoji: '✏️',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#7C3AED', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
    }}
    ttsIntro="Trace the X shape with two diagonal lines!"
    ttsComplete="Perfect X tracing!"
    ttsDrag="Trace both legs of the X!"
    ttsMiss="Complete both diagonals of the X!"
    congratsMessage="X Trace Master!"
    logType="x-path-trace"
    skillTags={['eye-hand-coordination', 'diagonal-drag']}
  />
);

export default XPathTraceGame;
