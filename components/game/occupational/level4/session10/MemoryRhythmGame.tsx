/** OT Level 4 · Session 10 · Game 4 — Memory Rhythm · Theme: "Rhythm Recall" */
import { RhythmPatternGame } from '@/components/game/occupational/level4/session10/RhythmPatternGame';
import React from 'react';

const MemoryRhythmGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmPatternGame
    {...props}
    mode="memory"
    theme={{
      title: 'Rhythm Recall', subtitle: 'Listen, remember, then repeat!', emoji: '🧠',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', leftColor: '#F59E0B', rightColor: '#EF4444',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#B45309', statLabel: '#D97706', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B',
    }}
    ttsIntro="Listen and remember the rhythm, then repeat it!"
    ttsComplete="Great rhythm memory!"
    ttsListen="Listen and remember the pattern!"
    ttsCopy="Now repeat the pattern!"
    ttsSuccess="Perfect memory!"
    ttsFail="Try again!"
    congratsMessage="Rhythm Recall Star!"
    logType="memory-rhythm"
    skillTags={['working-memory', 'pattern-memory', 'rhythm', 'cross-body-coordination']}
  />
);

export default MemoryRhythmGame;
