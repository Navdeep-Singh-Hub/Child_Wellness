/** OT Level 3 · Session 1 · Game 4 — Loud Soft Rhythm · Theme: "Loud & Soft" */
import { RhythmGame } from '@/components/game/occupational/level3/session1/RhythmGame';
import React from 'react';

const LoudSoftRhythmGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmGame
    {...props}
    mode="loudSoft"
    theme={{
      title: 'Loud & Soft', subtitle: 'Match loud beats with big taps, soft with small!', emoji: '🔊',
      gradient: ['#FDF2F8', '#FCE7F3', '#F9A8D4', '#EC4899'],
      drumBg: '#DB2777', drumActive: '#BE185D', drumText: '#fff',
      loudBtn: '#DC2626', softBtn: '#60A5FA',
      backText: '#9D174D', backBorder: 'rgba(236,72,153,0.25)',
      titleColor: '#831843', subtitleColor: '#BE185D', statLabel: '#DB2777', statValue: '#831843',
      statBorder: 'rgba(236,72,153,0.2)', playBorder: 'rgba(236,72,153,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EC4899', hintText: 'Tap LOUD or SOFT to match each beat!',
      choiceBg: 'rgba(255,255,255,0.85)', choiceBorder: 'rgba(236,72,153,0.3)', choiceText: '#831843',
    }}
    ttsIntro="Tap loud for big beats and soft for quiet beats!"
    ttsComplete="Great loud and soft control!"
    ttsWrong="Match the loud or soft beat!"
    congratsMessage="Volume Master!"
    logType="loudSoftRhythm"
    skillTags={['rhythm', 'force-grading', 'auditory-discrimination']}
  />
);

export default LoudSoftRhythmGame;
