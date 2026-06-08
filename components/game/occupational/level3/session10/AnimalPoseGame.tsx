/** OT Level 3 · Session 10 · Game 2 — Animal Pose · Theme: "Wild Pose" */
import { PostureGame } from '@/components/game/occupational/level3/session10/PostureGame';
import React from 'react';

const AnimalPoseGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PostureGame
    {...props}
    mode="animalPose"
    theme={{
      title: 'Wild Pose', subtitle: 'Copy tree, dog, and cat poses', emoji: '🐕',
      gradient: ['#FFFBEB', '#FEF3C7', '#FCD34D', '#F59E0B'],
      accent: '#F59E0B', accentDark: '#B45309', confirmBg: '#D97706',
      backText: '#92400E', backBorder: 'rgba(245,158,11,0.25)',
      titleColor: '#78350F', subtitleColor: '#D97706', statLabel: '#F59E0B', statValue: '#78350F',
      statBorder: 'rgba(245,158,11,0.2)', playBorder: 'rgba(245,158,11,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#F59E0B',
    }}
    ttsIntro="Copy each animal yoga pose with your body!"
    ttsComplete="Wild pose master!"
    ttsWatch="Watch the animal pose!"
    ttsConfirm="Copy the pose!"
    confirmLabel="✓ I copied it!"
    congratsMessage="Wild Pose Hero!"
    logType="animal-pose"
    skillTags={['core-muscles', 'posture', 'animal-poses']}
  />
);

export default AnimalPoseGame;
