/** OT Level 3 · Session 3 · Game 8 — Speed Match · Theme: "Match the Pace" */
import { SpeedGame } from '@/components/game/occupational/level3/session3/SpeedGame';
import React from 'react';

const SpeedMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SpeedGame
    {...props}
    mode="speedMatch"
    theme={{
      title: 'Match the Pace', subtitle: 'Watch the top turtle — match its speed below', emoji: '🐢',
      gradient: ['#F0FDF4', '#DCFCE7', '#86EFAC', '#22C55E'],
      accent: '#22C55E', accentDark: '#15803D', characterEmoji: '🐢',
      backText: '#166534', backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D', subtitleColor: '#15803D', statLabel: '#22C55E', statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)', playBorder: 'rgba(34,197,94,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#22C55E', hintText: 'Match the top turtle speed!',
      fastColor: '#F59E0B', slowColor: '#3B82F6',
    }}
    ttsIntro="Watch the top turtle and drag the bottom turtle to match its speed!"
    ttsComplete="You matched every speed!"
    ttsFast="Drag fast to match!"
    ttsSlow="Drag slow to match!"
    ttsTooFast="Match the top turtle — drag slower!"
    ttsTooSlow="Match the top turtle — drag faster!"
    congratsMessage="Pace Matcher!"
    logType="speed-match"
    skillTags={['listening', 'movement-sync', 'visual-motor']}
  />
);

export default SpeedMatchGame;
