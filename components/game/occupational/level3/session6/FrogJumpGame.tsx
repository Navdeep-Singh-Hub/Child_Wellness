/** OT Level 3 · Session 6 · Game 1 — Frog Jump · Theme: "Leap Frog" */
import { JumpTapGame } from '@/components/game/occupational/level3/session6/JumpTapGame';
import React from 'react';

const FrogJumpGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <JumpTapGame
    {...props}
    mode="frogJump"
    theme={{
      title: 'Leap Frog', subtitle: 'Tap twice to make the frog jump', emoji: '🐸',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#22C55E'],
      accent: '#22C55E', accentDark: '#15803D', objectEmoji: '🐸',
      backText: '#166534', backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D', subtitleColor: '#16A34A', statLabel: '#22C55E', statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)', playBorder: 'rgba(34,197,94,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#22C55E', hintText: 'Tap tap to jump!',
    }}
    ttsIntro="Tap twice quickly to make the frog jump!"
    ttsComplete="Great jumping!"
    ttsDoubleTap="Tap twice to jump!"
    congratsMessage="Leap Master!"
    logType="frog-jump"
    skillTags={['sequencing', 'motor-imitation', 'bilateral-tapping']}
  />
);

export default FrogJumpGame;
