/** OT Level 4 · Session 3 · Game 2 — X Path Trace · Theme: "X Trace" · Sigil Chamber */
import { DiagonalXPathGame } from '@/components/game/occupational/level4/session3/DiagonalXPathGame';
import { X_TRACE_THEME as X } from '@/components/game/occupational/level4/session3/session3Theme';
import React from 'react';

const XPathTraceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DiagonalXPathGame
    {...props}
    theme={{
      title: X.title,
      subtitle: X.subtitle,
      emoji: X.emoji,
      gradient: X.gradient,
      accent: X.accent,
      accentDark: X.accentDark,
      pathColor: X.pathColor,
      draggableEmoji: X.draggableEmoji,
      backText: X.backText,
      backBorder: X.backBorder,
      titleColor: X.titleColor,
      subtitleColor: X.subtitleColor,
      statLabel: X.statLabel,
      statValue: X.statValue,
      statBorder: X.statBorder,
      playBorder: X.playBorder,
      playBg: X.playBg,
      sparkleColor: X.sparkleColor,
    }}
    ttsIntro={X.voiceIntro}
    ttsComplete={X.voiceComplete}
    ttsDrag={X.voiceDrag}
    ttsMiss={X.voiceMiss}
    ttsGoal={X.voiceTraced}
    ttsLeg1={X.voiceLeg1}
    congratsMessage={X.congrats}
    logType="x-path-trace"
    skillTags={['eye-hand-coordination', 'diagonal-drag']}
  />
);

export default XPathTraceGame;
