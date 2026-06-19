/** OT Level 4 · Session 9 · Game 3 — Shape Sort · Theme: "Box Sort" */
import { DualDragGame } from '@/components/game/occupational/level4/session9/DualDragGame';
import { BOX_SORT_THEME as T } from '@/components/game/occupational/level4/session9/session9Theme';
import React from 'react';

const ShapeSortGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualDragGame
    {...props}
    mode="shapeSort"
    theme={{
      title: T.title,
      subtitle: T.subtitle,
      emoji: T.emoji,
      gradient: T.gradient,
      accent: T.accent,
      accentDark: T.accentDark,
      leftColor: T.leftColor,
      rightColor: T.rightColor,
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
      zoneBorder: T.zoneBorder,
    }}
    ttsIntro={T.voiceIntro}
    ttsComplete={T.voiceComplete}
    ttsCue={T.voiceCue}
    ttsSuccess={T.voiceSuccess}
    congratsMessage={T.congrats}
    logType="shape-sort"
    skillTags={['multitasking', 'simultaneous-dragging', 'sorting', 'categorization']}
  />
);

export default ShapeSortGame;
