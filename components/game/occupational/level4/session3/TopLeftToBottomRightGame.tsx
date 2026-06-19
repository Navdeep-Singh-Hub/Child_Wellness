/** OT Level 4 · Session 3 · Game 1 — Top-Left to Bottom-Right · Theme: "Diagonal Dash" · Mountain Trail */
import { DiagonalDragGame } from '@/components/game/occupational/level4/session3/DiagonalDragGame';
import { DIAGONAL_DASH_THEME as D } from '@/components/game/occupational/level4/session3/session3Theme';
import React from 'react';

const TopLeftToBottomRightGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DiagonalDragGame
    {...props}
    mode="cornerDrag"
    theme={{
      title: D.title,
      subtitle: D.subtitle,
      emoji: D.emoji,
      gradient: D.gradient,
      accent: D.accent,
      accentDark: D.accentDark,
      draggableEmoji: D.draggableEmoji,
      targetEmoji: D.targetEmoji,
      backText: '#E0F2FE',
      backBorder: 'rgba(56,189,248,0.38)',
      titleColor: '#F0F9FF',
      subtitleColor: 'rgba(186,230,253,0.9)',
      statLabel: 'rgba(186,230,253,0.75)',
      statValue: '#FFFFFF',
      statBorder: 'rgba(56,189,248,0.32)',
      playBorder: D.playBorder,
      playBg: D.playBg,
      sparkleColor: D.sparkleColor,
      zoneBorder: D.zoneBorder,
    }}
    ttsIntro={D.voiceIntro}
    ttsComplete={D.voiceComplete}
    ttsDrag={D.voiceDrag}
    ttsMiss={D.voiceMiss}
    ttsGoal={D.voiceLanded}
    congratsMessage={D.congrats}
    logType="top-left-bottom-right"
    skillTags={['midline-crossing', 'reading-prep', 'diagonal-drag']}
  />
);

export default TopLeftToBottomRightGame;
