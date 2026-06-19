/** OT Level 4 · Session 5 · Game 4 — Drum Alternate · Theme: "Rhythm Switch" · Jazz Stage */
import { AlternateTapGame } from '@/components/game/occupational/level4/session5/AlternateTapGame';
import { RHYTHM_SWITCH_THEME as T } from '@/components/game/occupational/level4/session5/session5Theme';
import React from 'react';

const DrumAlternateGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AlternateTapGame
    {...props}
    mode="beat"
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
      targetStyle: 'drum',
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
    congratsMessage={T.congrats}
    logType="drum-alternate"
    skillTags={['rhythm-control', 'alternating-hands', 'coordination']}
  />
);

export default DrumAlternateGame;
