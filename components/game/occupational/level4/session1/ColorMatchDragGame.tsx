/** OT Level 4 · Session 1 · Game 4 — Color Match Drag · Theme: "Color Slide" · Paint Studio */
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/HorizontalDragGame';
import { COLOR_SLIDE_THEME as C } from '@/components/game/occupational/level4/session1/session1Theme';
import React from 'react';

const ColorMatchDragGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame
    {...props}
    mode="colorMatch"
    theme={{
      title: C.title,
      subtitle: C.subtitle,
      emoji: C.emoji,
      gradient: C.gradient,
      accent: C.accent,
      accentDark: C.accentDark,
      draggableEmoji: C.draggableEmoji,
      targetEmoji: C.targetEmoji,
      backText: '#831843',
      backBorder: 'rgba(236,72,153,0.35)',
      titleColor: '#500724',
      subtitleColor: '#9D174D',
      statLabel: '#BE185D',
      statValue: '#500724',
      statBorder: 'rgba(236,72,153,0.25)',
      playBorder: C.playBorder,
      playBg: C.playBg,
      sparkleColor: C.sparkleColor,
      zoneBorder: C.zoneBorder,
    }}
    ttsIntro={C.voiceIntro}
    ttsComplete={C.voiceComplete}
    ttsDrag={C.voiceDrag}
    ttsMiss={C.voiceMiss}
    ttsColorWrong={C.voiceWrong}
    ttsGoal={C.voiceMatch}
    congratsMessage={C.congrats}
    logType="color-match-drag"
    skillTags={['visual-matching', 'motor', 'drag-left-right']}
  />
);

export default ColorMatchDragGame;
