/** OT Level 4 · Session 3 · Game 5 — Diagonal Match · Theme: "Corner Match" · Prism Vault */
import { DiagonalDragGame } from '@/components/game/occupational/level4/session3/DiagonalDragGame';
import { CORNER_MATCH_THEME as C } from '@/components/game/occupational/level4/session3/session3Theme';
import React from 'react';

const DiagonalMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DiagonalDragGame
    {...props}
    mode="colorMatch"
    theme={{
      title: C.title,
      subtitle: C.subtitle,
      emoji: C.emoji,
      gradient: C.gradient,
      accent: C.accent,
      accentDark: C.accentDark,
      draggableEmoji: '💎',
      targetEmoji: '💎',
      backText: C.backText,
      backBorder: C.backBorder,
      titleColor: C.titleColor,
      subtitleColor: C.subtitleColor,
      statLabel: C.statLabel,
      statValue: C.statValue,
      statBorder: C.statBorder,
      playBorder: C.playBorder,
      playBg: C.playBg,
      sparkleColor: C.sparkleColor,
      zoneBorder: C.zoneBorder,
    }}
    ttsIntro={C.voiceIntro}
    ttsComplete={C.voiceComplete}
    ttsDrag={C.voiceDrag}
    ttsMiss={C.voiceMiss}
    ttsGoal={C.voiceMatched}
    congratsMessage={C.congrats}
    logType="diagonal-match"
    skillTags={['spatial-awareness', 'diagonal-drag']}
  />
);

export default DiagonalMatchGame;
