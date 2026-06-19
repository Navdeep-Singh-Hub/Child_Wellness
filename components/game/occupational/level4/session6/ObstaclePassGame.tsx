/** OT Level 4 · Session 6 · Game 5 — Obstacle Pass · Theme: "Detour Pass" · Construction Site */
import { MidlineDragPassGame } from '@/components/game/occupational/level4/session6/MidlineDragPassGame';
import { DETOUR_PASS_THEME as T } from '@/components/game/occupational/level4/session6/session6Theme';
import React from 'react';

const ObstaclePassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlineDragPassGame
    {...props}
    mode="obstaclePass"
    theme={{
      title: T.title,
      subtitle: T.subtitle,
      emoji: T.emoji,
      gradient: T.gradient,
      accent: T.accent,
      accentDark: T.accentDark,
      ballEmoji: T.ballEmoji,
      targetEmoji: T.targetEmoji,
      obstacleEmoji: T.obstacleEmoji,
      backText: T.backText,
      backBorder: T.backBorder,
      titleColor: T.titleColor,
      subtitleColor: T.subtitleColor,
      statLabel: T.statLabel,
      statValue: T.statValue,
      statBorder: T.statBorder,
      playBorder: T.playBorder,
      playBg: T.playBg,
      sparkleColor: T.sparkleColor,
      midlineColor: T.midlineColor,
    }}
    ttsIntro={T.voiceIntro}
    ttsComplete={T.voiceComplete}
    ttsDrag={T.voiceDrag}
    ttsMiss={T.voiceMiss}
    ttsObstacle={T.voiceObstacle}
    ttsDetourCross={T.voiceDetourCross}
    ttsSuccess={T.voiceSuccess}
    congratsMessage={T.congrats}
    logType="obstacle-pass"
    skillTags={['planning-skill', 'obstacle-avoidance', 'midline-crossing']}
  />
);

export default ObstaclePassGame;
