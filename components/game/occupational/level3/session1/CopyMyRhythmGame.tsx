/** OT Level 3 · Session 1 · Game 3 — Copy My Rhythm · Theme: "Rhythm Echo" */
import { RhythmGame } from '@/components/game/occupational/level3/session1/RhythmGame';
import React from 'react';

const CopyMyRhythmGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmGame
    {...props}
    mode="copy"
    theme={{
      title: 'Rhythm Echo', subtitle: 'Listen to the pattern, then tap it back!', emoji: '🔁',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      drumBg: '#2563EB', drumActive: '#1D4ED8', drumText: '#fff',
      loudBtn: '#DC2626', softBtn: '#93C5FD',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6', hintText: 'Listen first, then copy the rhythm!',
      choiceBg: 'rgba(255,255,255,0.85)', choiceBorder: 'rgba(59,130,246,0.3)', choiceText: '#1E3A8A',
    }}
    ttsIntro="Listen to the rhythm pattern, then tap it back!"
    ttsComplete="You copied every pattern!"
    ttsWrong="That pattern didn't match. Try again!"
    congratsMessage="Rhythm Copier!"
    logType="copyMyRhythm"
    skillTags={['rhythm', 'working-memory', 'auditory-motor-integration']}
  />
);

export default CopyMyRhythmGame;
