/** OT Level 3 · Session 4 · Game 4 — Jump Arrow · Theme: "Arrow Jump" */
import { VerticalGestureGame } from '@/components/game/occupational/level3/session4/VerticalGestureGame';
import React from 'react';

const JumpArrowGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VerticalGestureGame
    {...props}
    mode="arrowMatch"
    theme={{
      title: 'Arrow Jump', subtitle: 'Match your swipe to the arrow direction', emoji: '⬆️',
      gradient: ['#FEFCE8', '#FEF9C3', '#FDE047', '#EAB308'],
      accent: '#EAB308', accentDark: '#A16207', objectEmoji: '🧒',
      objectColors: ['#FCD34D', '#F59E0B'],
      backText: '#854D0E', backBorder: 'rgba(234,179,8,0.25)',
      titleColor: '#713F12', subtitleColor: '#A16207', statLabel: '#EAB308', statValue: '#713F12',
      statBorder: 'rgba(234,179,8,0.2)', playBorder: 'rgba(234,179,8,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EAB308', hintText: 'Follow the arrow!',
    }}
    ttsIntro="When the arrow points up, swipe up! When it points down, swipe down!"
    ttsComplete="Perfect arrow responses!"
    ttsUp="Arrow up — swipe up!"
    ttsDown="Arrow down — swipe down!"
    ttsWrongUp="The arrow points up — swipe up!"
    ttsWrongDown="The arrow points down — swipe down!"
    congratsMessage="Arrow Ace!"
    logType="jump-arrow"
    skillTags={['visual-motor', 'direction-discrimination', 'response-inhibition']}
  />
);

export default JumpArrowGame;
