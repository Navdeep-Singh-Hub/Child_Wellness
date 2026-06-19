/** OT Level 4 · Session 6 · Game 1 — Hand-to-Hand Pass · Theme: "Hand Swap" · Midline Bridge */
import { MidlinePassGame } from '@/components/game/occupational/level4/session6/MidlinePassGame';
import { HAND_SWAP_THEME as T } from '@/components/game/occupational/level4/session6/session6Theme';
import React from 'react';

const HandToHandPassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlinePassGame
    {...props}
    mode="handPass"
    theme={{
      title: T.title,
      subtitle: T.subtitle,
      emoji: T.emoji,
      gradient: T.gradient,
      accent: T.accent,
      accentDark: T.accentDark,
      ballEmoji: T.ballEmoji,
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
      leftColor: T.leftColor,
      rightColor: T.rightColor,
    }}
    ttsIntro={T.voiceIntro}
    ttsComplete={T.voiceComplete}
    ttsCue={T.voiceCue}
    ttsSuccess={T.voiceSuccess}
    ttsWrong={T.voiceWrong}
    congratsMessage={T.congrats}
    logType="hand-to-hand-pass"
    skillTags={['midline-awareness', 'hand-coordination', 'ball-pass']}
  />
);

export default HandToHandPassGame;
