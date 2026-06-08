/** OT Level 2 · Session 9 · Game 1 — Copy the Line Pattern · Theme: "Line Copy" */
import { PatternCopyGame } from '@/components/game/occupational/level2/session9/PatternCopyGame';
import { randomLinePattern } from '@/components/game/occupational/level2/session9/patternUtils';
import React from 'react';

const CopyTheLinePatternGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PatternCopyGame
    {...props}
    mode="line"
    generatePattern={randomLinePattern}
    theme={{
      title: 'Line Copy', subtitle: 'Tap vertical or horizontal lines in order', emoji: '📋',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      targetColor: '#64748B', userColor: '#8B5CF6', emptyColor: '#E2E8F0',
      btnBg: 'rgba(255,255,255,0.8)', btnBorder: 'rgba(139,92,246,0.3)', btnText: '#5B21B6',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#5B21B6', subtitleColor: '#6D28D9', statLabel: '#7C3AED', statValue: '#5B21B6',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6', hintText: 'Match each line direction in order!',
      sectionBg: 'rgba(255,255,255,0.5)',
    }}
    ttsIntro="Copy the pattern by tapping vertical or horizontal lines!"
    ttsComplete="Patterns copied!"
    ttsWrong="Check the line directions!"
    congratsMessage="Line Copier!"
    logType="copyLinePattern"
    skillTags={['visual-memory', 'reproduction', 'pattern-copying']}
  />
);

export default CopyTheLinePatternGame;
