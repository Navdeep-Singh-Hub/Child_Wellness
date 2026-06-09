/** OT Level 4 · Session 10 · Game 5 — Speed Rhythm · Theme: "Fast Beat" */
import { RhythmPatternGame } from '@/components/game/occupational/level4/session10/RhythmPatternGame';
import React from 'react';

const SpeedRhythmGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmPatternGame
    {...props}
    mode="speed"
    theme={{
      title: 'Fast Beat', subtitle: 'Rhythm gets faster each round!', emoji: '⚡',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', leftColor: '#EF4444', rightColor: '#3B82F6',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#B91C1C', statLabel: '#DC2626', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444',
    }}
    ttsIntro="Copy the rhythm — it speeds up each round!"
    ttsComplete="Lightning fast rhythm skills!"
    ttsListen="Listen to the rhythm!"
    ttsCopy="Now copy!"
    ttsSuccess="Perfect!"
    ttsFail="Try again!"
    congratsMessage="Fast Beat Star!"
    logType="speed-rhythm"
    skillTags={['control', 'flexibility', 'speed-regulation', 'rhythm', 'cross-body-coordination']}
  />
);

export default SpeedRhythmGame;
