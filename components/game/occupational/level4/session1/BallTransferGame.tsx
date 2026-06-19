/** OT Level 4 · Session 1 · Game 1 — Ball Transfer · Theme: "Goal Pass" · Stadium Striker */
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/HorizontalDragGame';
import { GOAL_PASS_THEME as G } from '@/components/game/occupational/level4/session1/session1Theme';
import React from 'react';

const BallTransferGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame
    {...props}
    mode="ballTransfer"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: G.gradient,
      accent: G.accent,
      accentDark: G.accentDark,
      draggableEmoji: G.draggableEmoji,
      targetEmoji: G.targetEmoji,
      backText: '#E2E8F0',
      backBorder: 'rgba(255,255,255,0.22)',
      titleColor: '#F8FAFC',
      subtitleColor: 'rgba(226,232,240,0.88)',
      statLabel: 'rgba(226,232,240,0.75)',
      statValue: '#FFFFFF',
      statBorder: 'rgba(255,255,255,0.22)',
      playBorder: G.playBorder,
      playBg: G.playBg,
      sparkleColor: G.sparkleColor,
      zoneBorder: G.zoneBorder,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsDrag={G.voiceDrag}
    ttsMiss={G.voiceMiss}
    ttsGoal={G.voiceGoal}
    congratsMessage={G.congrats}
    logType="ball-transfer"
    skillTags={['midline-crossing', 'brain-hemispheres', 'drag-left-right']}
  />
);

export default BallTransferGame;
