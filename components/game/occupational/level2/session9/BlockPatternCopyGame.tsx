/** OT Level 2 · Session 9 · Game 2 — Block Pattern Copy · Theme: "Block Builder" */
import { PatternCopyGame } from '@/components/game/occupational/level2/session9/PatternCopyGame';
import { randomBlockPattern } from '@/components/game/occupational/level2/session9/patternUtils';
import React from 'react';

const BlockPatternCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PatternCopyGame
    {...props}
    mode="block"
    generatePattern={randomBlockPattern}
    theme={{
      title: 'Block Builder', subtitle: 'Tap squares and circles in order', emoji: '⬜',
      gradient: ['#EEF2FF', '#E0E7FF', '#A5B4FC', '#6366F1'],
      targetColor: '#64748B', userColor: '#6366F1', emptyColor: '#E2E8F0',
      btnBg: 'rgba(255,255,255,0.8)', btnBorder: 'rgba(99,102,241,0.3)', btnText: '#3730A3',
      backText: '#4338CA', backBorder: 'rgba(99,102,241,0.25)',
      titleColor: '#3730A3', subtitleColor: '#4338CA', statLabel: '#4F46E5', statValue: '#3730A3',
      statBorder: 'rgba(99,102,241,0.2)', playBorder: 'rgba(99,102,241,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#6366F1', hintText: 'Copy each block shape in order!',
      sectionBg: 'rgba(255,255,255,0.5)',
    }}
    ttsIntro="Copy the pattern by tapping square or circle blocks!"
    ttsComplete="Blocks copied!"
    ttsWrong="Check the block shapes!"
    congratsMessage="Block Star!"
    logType="blockPatternCopy"
    skillTags={['visual-memory', 'reproduction', 'pattern-copying']}
  />
);

export default BlockPatternCopyGame;
