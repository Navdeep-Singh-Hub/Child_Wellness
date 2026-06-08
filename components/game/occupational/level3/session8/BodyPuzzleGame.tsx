/** OT Level 3 · Session 8 · Game 3 — Body Puzzle · Theme: "Body Build" */
import { BodyMapGame } from '@/components/game/occupational/level3/session8/BodyMapGame';
import React from 'react';

const BodyPuzzleGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyMapGame
    {...props}
    mode="bodyPuzzle"
    theme={{
      title: 'Body Build', subtitle: 'Drag each piece to the right spot', emoji: '🧩',
      gradient: ['#ECFDF5', '#D1FAE5', '#6EE7B7', '#22C55E'],
      accent: '#22C55E', accentDark: '#15803D',
      backText: '#166534', backBorder: 'rgba(34,197,94,0.25)',
      titleColor: '#14532D', subtitleColor: '#16A34A', statLabel: '#22C55E', statValue: '#14532D',
      statBorder: 'rgba(34,197,94,0.2)', playBorder: 'rgba(34,197,94,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#22C55E',
    }}
    ttsIntro="Drag the body parts to match the dotted spots!"
    ttsComplete="Body puzzle complete!"
    ttsPuzzleSnap="Perfect fit!"
    ttsPuzzleMiss="Drag it closer to the matching spot!"
    congratsMessage="Body Build Master!"
    logType="body-puzzle"
    skillTags={['spatial-understanding', 'body-parts', 'puzzle-solving']}
  />
);

export default BodyPuzzleGame;
