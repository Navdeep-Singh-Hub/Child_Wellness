/** OT Level 3 · Session 1 · Game 1 — Beat Match Tap · Theme: "Beat Sync" */
import { RhythmGame } from '@/components/game/occupational/level3/session1/RhythmGame';
import React from 'react';

const BeatMatchTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmGame
    {...props}
    mode="beatMatch"
    theme={{
      title: 'Beat Sync', subtitle: 'Tap in time with the drum — speed ramps up!', emoji: '🥁',
      gradient: ['#FFF7ED', '#FFEDD5', '#FDBA74', '#F97316'],
      drumBg: '#EA580C', drumActive: '#C2410C', drumText: '#fff',
      loudBtn: '#DC2626', softBtn: '#93C5FD',
      backText: '#9A3412', backBorder: 'rgba(249,115,22,0.25)',
      titleColor: '#7C2D12', subtitleColor: '#C2410C', statLabel: '#EA580C', statValue: '#7C2D12',
      statBorder: 'rgba(249,115,22,0.2)', playBorder: 'rgba(249,115,22,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F97316', hintText: 'Watch the circle shrink — tap when it gets small!',
      choiceBg: 'rgba(255,255,255,0.85)', choiceBorder: 'rgba(249,115,22,0.3)', choiceText: '#7C2D12',
    }}
    ttsIntro="Tap the drum in time with each beat!"
    ttsComplete="Great rhythm!"
    ttsWrong="Try to tap with the beat!"
    congratsMessage="Beat Master!"
    logType="beatMatchTap"
    skillTags={['rhythm', 'timing', 'auditory-motor-integration']}
  />
);

export default BeatMatchTapGame;
