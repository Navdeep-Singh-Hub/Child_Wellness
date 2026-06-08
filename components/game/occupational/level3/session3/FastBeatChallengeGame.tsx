/** OT Level 3 · Session 3 · Game 4 — Fast Beat Challenge · Theme: "Beat Sprint" */
import { DrumTapGame } from '@/components/game/occupational/level3/session3/DrumTapGame';
import React from 'react';

const FastBeatChallengeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DrumTapGame
    {...props}
    mode="fastBeat"
    theme={{
      title: 'Beat Sprint', subtitle: 'Fast beats — tap each one quickly!', emoji: '⚡',
      gradient: ['#FEF2F2', '#FECACA', '#F87171', '#DC2626'],
      drumBg: '#DC2626', drumActive: '#B91C1C',
      backText: '#991B1B', backBorder: 'rgba(220,38,38,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#B91C1C', statLabel: '#DC2626', statValue: '#7F1D1D',
      statBorder: 'rgba(220,38,38,0.2)', playBorder: 'rgba(220,38,38,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#DC2626', hintText: 'Keep up with the fast beats!',
    }}
    ttsIntro="Tap quickly for every fast drum beat!"
    ttsComplete="You kept up with every fast beat!"
    congratsMessage="Speed Drummer!"
    logType="fast-beat-challenge"
    skillTags={['reaction-speed', 'motor-planning', 'rhythm']}
  />
);

export default FastBeatChallengeGame;
