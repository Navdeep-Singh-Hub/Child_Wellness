/** OT Level 2 · Session 9 · Game 4 — Stick Design Copy · Theme: "Stroke Studio" */
import { PatternCopyGame } from '@/components/game/occupational/level2/session9/PatternCopyGame';
import { randomStrokePattern } from '@/components/game/occupational/level2/session9/patternUtils';
import React from 'react';

const StickDesignCopyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PatternCopyGame
    {...props}
    mode="stick"
    generatePattern={randomStrokePattern}
    theme={{
      title: 'Stroke Studio', subtitle: 'Copy the pre-writing stroke design', emoji: '✏️',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      targetColor: '#64748B', userColor: '#F59E0B', emptyColor: '#E2E8F0',
      btnBg: 'rgba(255,255,255,0.8)', btnBorder: 'rgba(245,158,11,0.3)', btnText: '#92400E',
      backText: '#B45309', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#92400E', subtitleColor: '#B45309', statLabel: '#D97706', statValue: '#92400E',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.4)',
      sparkleColor: '#F59E0B', hintText: 'Add each stroke type in order!',
      sectionBg: 'rgba(255,255,255,0.5)',
    }}
    ttsIntro="Copy the pre-writing stroke design!"
    ttsComplete="Designs copied!"
    ttsWrong="Check the stroke types!"
    congratsMessage="Stroke Star!"
    logType="stickDesignCopy"
    skillTags={['visual-memory', 'reproduction', 'pattern-copying']}
  />
);

export default StickDesignCopyGame;
