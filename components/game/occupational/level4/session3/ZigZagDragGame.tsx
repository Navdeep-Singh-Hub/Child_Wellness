/** OT Level 4 · Session 3 · Game 4 — Zig-Zag Drag · Theme: "Zigzag Run" · Lightning Canyon */
import { DiagonalPathDragGame } from '@/components/game/occupational/level4/session3/DiagonalPathDragGame';
import { ZIGZAG_RUN_THEME as Z } from '@/components/game/occupational/level4/session3/session3Theme';
import React from 'react';

const ZigZagDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DiagonalPathDragGame
    {...props}
    theme={{
      title: Z.title,
      subtitle: Z.subtitle,
      emoji: Z.emoji,
      gradient: Z.gradient,
      accent: Z.accent,
      accentDark: Z.accentDark,
      pathColor: Z.pathColor,
      draggableEmoji: Z.draggableEmoji,
      backText: Z.backText,
      backBorder: Z.backBorder,
      titleColor: Z.titleColor,
      subtitleColor: Z.subtitleColor,
      statLabel: Z.statLabel,
      statValue: Z.statValue,
      statBorder: Z.statBorder,
      playBorder: Z.playBorder,
      playBg: Z.playBg,
      sparkleColor: Z.sparkleColor,
    }}
    ttsIntro={Z.voiceIntro}
    ttsComplete={Z.voiceComplete}
    ttsDrag={Z.voiceDrag}
    ttsMiss={Z.voiceMiss}
    ttsGoal={Z.voiceZapped}
    congratsMessage={Z.congrats}
    logType="zigzag-drag"
    skillTags={['direction-switching', 'diagonal-drag']}
  />
);

export default ZigZagDragGame;
