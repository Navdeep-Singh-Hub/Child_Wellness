/** OT Level 4 · Session 2 · Game 3 — Reverse Path · Theme: "Back Track" · Forest Trail */
import { ReversePathDragGame } from '@/components/game/occupational/level4/session2/ReversePathDragGame';
import { BACK_TRACK_THEME as B } from '@/components/game/occupational/level4/session2/session2Theme';
import React from 'react';

const ReversePathGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ReversePathDragGame
    {...props}
    mode="reversePath"
    theme={{
      title: B.title,
      subtitle: B.subtitle,
      emoji: B.emoji,
      gradient: B.gradient,
      accent: B.accent,
      accentDark: B.accentDark,
      pathColor: B.pathColor,
      draggableEmoji: B.draggableEmoji,
      backText: B.backText,
      backBorder: B.backBorder,
      titleColor: B.titleColor,
      subtitleColor: B.subtitleColor,
      statLabel: B.statLabel,
      statValue: B.statValue,
      statBorder: B.statBorder,
      playBorder: B.playBorder,
      playBg: B.playBg,
      sparkleColor: B.sparkleColor,
    }}
    ttsIntro={B.voiceIntro}
    ttsComplete={B.voiceComplete}
    ttsDrag={B.voiceDrag}
    ttsMiss={B.voiceMiss}
    ttsGoal={B.voiceArrived}
    congratsMessage={B.congrats}
    logType="reverse-path"
    skillTags={['cognitive-flexibility', 'drag-right-left']}
  />
);

export default ReversePathGame;
