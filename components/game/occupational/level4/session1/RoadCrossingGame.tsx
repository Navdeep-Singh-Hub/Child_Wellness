/** OT Level 4 · Session 1 · Game 3 — Road Crossing · Theme: "Lane Cross" · Neon Highway */
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/HorizontalDragGame';
import { LANE_CROSS_THEME as L } from '@/components/game/occupational/level4/session1/session1Theme';
import React from 'react';

const RoadCrossingGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame
    {...props}
    mode="roadCrossing"
    theme={{
      title: L.title,
      subtitle: L.subtitle,
      emoji: L.emoji,
      gradient: L.gradient,
      accent: L.accent,
      accentDark: L.accentDark,
      draggableEmoji: L.draggableEmoji,
      targetEmoji: L.targetEmoji,
      backText: '#E0F2FE',
      backBorder: 'rgba(34,211,238,0.35)',
      titleColor: '#F0F9FF',
      subtitleColor: 'rgba(186,230,253,0.9)',
      statLabel: 'rgba(186,230,253,0.75)',
      statValue: '#FFFFFF',
      statBorder: 'rgba(34,211,238,0.3)',
      playBorder: L.playBorder,
      playBg: L.playBg,
      sparkleColor: L.sparkleColor,
      zoneBorder: L.zoneBorder,
    }}
    ttsIntro={L.voiceIntro}
    ttsComplete={L.voiceComplete}
    ttsDrag={L.voiceDrag}
    ttsMiss={L.voiceMiss}
    ttsGoal={L.voiceSafe}
    congratsMessage={L.congrats}
    logType="road-crossing"
    skillTags={['spatial-planning', 'drag-left-right']}
  />
);

export default RoadCrossingGame;
