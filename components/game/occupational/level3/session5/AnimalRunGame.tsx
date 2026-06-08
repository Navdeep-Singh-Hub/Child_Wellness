/** OT Level 3 · Session 5 · Game 3 — Animal Run · Theme: "Pet Dash" */
import { HorizontalSwipeGame } from '@/components/game/occupational/level3/session5/HorizontalSwipeGame';
import React from 'react';

const AnimalRunGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalSwipeGame
    {...props}
    mode="animalRun"
    theme={{
      title: 'Pet Dash', subtitle: 'Send the animal left or right', emoji: '🐕',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', objectEmoji: '🐕',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#6D28D9', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6', hintText: 'Run the animal!',
    }}
    ttsIntro="Move the animal left or right with your swipe!"
    ttsComplete="The animals ran everywhere!"
    ttsLeft="Move the animal to the left!"
    ttsRight="Move the animal to the right!"
    ttsWrongLeft="Swipe left!"
    ttsWrongRight="Swipe right!"
    congratsMessage="Pet Runner!"
    logType="animal-run"
    skillTags={['bilateral-coordination', 'direction-discrimination', 'lateral-movement']}
  />
);

export default AnimalRunGame;
