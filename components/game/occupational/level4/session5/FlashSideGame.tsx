/** OT Level 4 · Session 5 · Game 3 — Flash Side · Theme: "Flash Pick" · Decision Arena */
import { AlternateTapGame } from '@/components/game/occupational/level4/session5/AlternateTapGame';
import { FLASH_PICK_THEME as T } from '@/components/game/occupational/level4/session5/session5Theme';
import React from 'react';

const FlashSideGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AlternateTapGame
    {...props}
    mode="flash"
    theme={{
      title: T.title,
      subtitle: T.subtitle,
      emoji: T.emoji,
      gradient: T.gradient,
      accent: T.accent,
      accentDark: T.accentDark,
      leftColor: T.leftColor,
      rightColor: T.rightColor,
      leftEmoji: T.leftEmoji,
      rightEmoji: T.rightEmoji,
      targetStyle: 'panel',
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
    }}
    ttsIntro={T.voiceIntro}
    ttsComplete={T.voiceComplete}
    ttsCue={T.voiceCue}
    ttsSuccess={T.voiceSuccess}
    ttsWrong={T.voiceWrong}
    ttsTooSlow={T.voiceTooSlow}
    ttsWatch={T.voiceWatch}
    congratsMessage={T.congrats}
    logType="flash-side"
    skillTags={['decision-making', 'reaction-time', 'hand-selection']}
  />
);

export default FlashSideGame;
