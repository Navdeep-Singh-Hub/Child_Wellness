/** OT Level 4 · Session 2 · Game 5 — Pattern Drag · Theme: "Pattern Run" · Neon Circuit */
import { ReversePathDragGame } from '@/components/game/occupational/level4/session2/ReversePathDragGame';
import { PATTERN_RUN_THEME as P } from '@/components/game/occupational/level4/session2/session2Theme';
import React from 'react';

const PatternDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReversePathDragGame
    {...props}
    mode="patternDrag"
    theme={{
      title: P.title,
      subtitle: P.subtitle,
      emoji: P.emoji,
      gradient: P.gradient,
      accent: P.accent,
      accentDark: P.accentDark,
      pathColor: P.pathColor,
      draggableEmoji: P.draggableEmoji,
      backText: P.backText,
      backBorder: P.backBorder,
      titleColor: P.titleColor,
      subtitleColor: P.subtitleColor,
      statLabel: P.statLabel,
      statValue: P.statValue,
      statBorder: P.statBorder,
      playBorder: P.playBorder,
      playBg: P.playBg,
      sparkleColor: P.sparkleColor,
    }}
    ttsIntro={P.voiceIntro}
    ttsComplete={P.voiceComplete}
    ttsDrag={P.voiceDrag}
    ttsMiss={P.voiceMiss}
    ttsGoal={P.voiceTraced}
    congratsMessage={P.congrats}
    logType="pattern-drag"
    skillTags={['motor-planning', 'drag-right-left']}
  />
);

export default PatternDragGame;
