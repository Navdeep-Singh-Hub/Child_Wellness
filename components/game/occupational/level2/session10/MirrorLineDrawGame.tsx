/** OT Level 2 · Session 10 · Game 1 — Mirror Line Draw · Theme: "Mirror Sketch" */
import { MirrorGame } from '@/components/game/occupational/level2/session10/MirrorGame';
import React from 'react';

const MirrorLineDrawGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MirrorGame
    {...props}
    mode="line"
    theme={{
      title: 'Mirror Sketch', subtitle: 'Draw on the left — it mirrors on the right', emoji: '🪞',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      strokeColor: '#8B5CF6', guideStroke: '#CBD5E1', accentColor: '#8B5CF6',
      objectColor: '#8B5CF6', goalColor: '#10B981', faceStroke: '#FCD34D',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#5B21B6', subtitleColor: '#6D28D9', statLabel: '#7C3AED', statValue: '#5B21B6',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6', hintText: 'Draw freely on the left side!',
    }}
    ttsIntro="Draw on the left side, and it will mirror on the right!"
    ttsComplete="Mirror drawing complete!"
    ttsIncomplete="Draw more on the left side!"
    congratsMessage="Mirror Artist!"
    logType="mirrorLineDraw"
    skillTags={['bilateral-coordination', 'spatial-awareness', 'mirror-drawing']}
  />
);

export default MirrorLineDrawGame;
