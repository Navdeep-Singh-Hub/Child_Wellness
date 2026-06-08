/** OT Level 2 · Session 10 · Game 3 — Face Symmetry Draw · Theme: "Smile Mirror" */
import { MirrorGame } from '@/components/game/occupational/level2/session10/MirrorGame';
import React from 'react';

const FaceSymmetryDrawGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorGame
    {...props}
    mode="face"
    theme={{
      title: 'Smile Mirror', subtitle: 'Place features that mirror symmetrically', emoji: '😊',
      gradient: ['#FFFBEB', '#FEF9C3', '#FDE047', '#FACC15'],
      strokeColor: '#0F172A', guideStroke: '#CBD5E1', accentColor: '#FACC15',
      objectColor: '#FACC15', goalColor: '#10B981', faceStroke: '#F59E0B',
      backText: '#A16207', backBorder: 'rgba(250,204,21,0.35)',
      titleColor: '#854D0E', subtitleColor: '#A16207', statLabel: '#CA8A04', statValue: '#854D0E',
      statBorder: 'rgba(250,204,21,0.3)', playBorder: 'rgba(250,204,21,0.35)', playBg: 'rgba(255,255,255,0.45)',
      sparkleColor: '#FACC15', hintText: 'Tap to place the left eye — right will mirror!',
    }}
    ttsIntro="Tap to place the left eye — the right will mirror!"
    ttsComplete="Face complete!"
    ttsIncomplete="Tap in the right spot!"
    congratsMessage="Symmetry Star!"
    logType="faceSymmetryDraw"
    skillTags={['bilateral-coordination', 'spatial-awareness', 'mirror-drawing']}
  />
);

export default FaceSymmetryDrawGame;
