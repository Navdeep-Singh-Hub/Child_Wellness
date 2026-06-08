/** OT Level 2 · Session 9 · Game 3 — Color Pattern Match · Theme: "Hue Sequence" */
import { PatternCopyGame } from '@/components/game/occupational/level2/session9/PatternCopyGame';
import { randomColorPattern } from '@/components/game/occupational/level2/session9/patternUtils';
import React from 'react';

const ColorPatternMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PatternCopyGame
    {...props}
    mode="color"
    generatePattern={randomColorPattern}
    theme={{
      title: 'Hue Sequence', subtitle: 'Tap colors in the same order', emoji: '🎨',
      gradient: ['#FEF2F2', '#FECACA', '#F87171', '#EF4444'],
      targetColor: '#64748B', userColor: '#EF4444', emptyColor: '#E2E8F0',
      btnBg: 'rgba(255,255,255,0.8)', btnBorder: 'rgba(239,68,68,0.3)', btnText: '#991B1B',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#991B1B', subtitleColor: '#B91C1C', statLabel: '#DC2626', statValue: '#991B1B',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444', hintText: 'Match the color sequence exactly!',
      sectionBg: 'rgba(255,255,255,0.5)',
    }}
    ttsIntro="Copy the color pattern by tapping colors in order!"
    ttsComplete="Patterns matched!"
    ttsWrong="Check the color order!"
    congratsMessage="Hue Hero!"
    logType="colorPatternMatch"
    skillTags={['visual-memory', 'reproduction', 'pattern-copying']}
  />
);

export default ColorPatternMatchGame;
