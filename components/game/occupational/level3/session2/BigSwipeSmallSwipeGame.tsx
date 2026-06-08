/** OT Level 3 · Session 2 · Game 2 — Big Swipe vs Small Swipe · Theme: "Swipe Scale" */
import { ScaleMoveGame } from '@/components/game/occupational/level3/session2/ScaleMoveGame';
import React from 'react';

const BigSwipeSmallSwipeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ScaleMoveGame
    {...props}
    mode="swipe"
    theme={{
      title: 'Swipe Scale', subtitle: 'Long swipe for BIG, short swipe for SMALL', emoji: '↔️',
      gradient: ['#F0FDF4', '#DCFCE7', '#86EFAC', '#22C55E'],
      accent: '#22C55E', accentDark: '#15803D', bigColor: '#16A34A', smallColor: '#F59E0B',
      backText: '#166534', backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D', subtitleColor: '#15803D', statLabel: '#22C55E', statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)', playBorder: 'rgba(34,197,94,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#22C55E', hintText: 'Match your swipe length to the cue!',
    }}
    ttsIntro="Make a long swipe for BIG and a short swipe for SMALL!"
    ttsComplete="Great swipe control!"
    ttsBig="Fill the big bar!"
    ttsSmall="Fill the small bar!"
    congratsMessage="Swipe Master!"
    logType="bigSwipeSmallSwipe"
    skillTags={['gross-motor', 'force-grading', 'movement-scaling']}
  />
);

export default BigSwipeSmallSwipeGame;
