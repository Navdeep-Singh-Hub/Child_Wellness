/** OT Level 2 · Session 10 · Game 2 — Butterfly Wings · Theme: "Wing Mirror" */
import { MirrorGame } from '@/components/game/occupational/level2/session10/MirrorGame';
import React from 'react';

const ButterflyWingsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorGame
    {...props}
    mode="butterfly"
    theme={{
      title: 'Wing Mirror', subtitle: 'Draw one wing — the other appears', emoji: '🦋',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      strokeColor: '#8B5CF6', guideStroke: '#CBD5E1', accentColor: '#F59E0B',
      objectColor: '#F59E0B', goalColor: '#10B981', faceStroke: '#FCD34D',
      backText: '#B45309', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#92400E', subtitleColor: '#B45309', statLabel: '#D97706', statValue: '#92400E',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.4)',
      sparkleColor: '#F59E0B', hintText: 'Draw a wing shape on the left!',
    }}
    ttsIntro="Draw one wing on the left, and it will mirror on the right!"
    ttsComplete="Butterflies complete!"
    ttsIncomplete="Draw a wing shape!"
    congratsMessage="Butterfly Boss!"
    logType="butterflyWings"
    skillTags={['bilateral-coordination', 'spatial-awareness', 'mirror-drawing']}
  />
);

export default ButterflyWingsGame;
