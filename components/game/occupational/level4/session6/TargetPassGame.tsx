/** OT Level 4 · Session 6 · Game 3 — Target Pass · Theme: "Aim Pass" · Archery Lane */
import { MidlineDragPassGame } from '@/components/game/occupational/level4/session6/MidlineDragPassGame';
import { AIM_PASS_THEME as T } from '@/components/game/occupational/level4/session6/session6Theme';
import React from 'react';

const TargetPassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlineDragPassGame
    {...props}
    mode="targetPass"
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
    ttsCross={T.voiceCross}
    ttsSuccess={T.voiceSuccess}
    congratsMessage={T.congrats}
    logType="target-pass"
    skillTags={['accuracy', 'midline-crossing', 'target-aiming']}
  />
);

export default TargetPassGame;
