/** OT Level 4 · Session 4 · Game 3 — Drum Duo · Theme: "Beat Duo" · Rhythm Stage */
import { DualTapGame } from '@/components/game/occupational/level4/session4/DualTapGame';
import { BEAT_DUO_THEME as T } from '@/components/game/occupational/level4/session4/session4Theme';
import React from 'react';

const DrumDuoGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualTapGame
    {...props}
    mode="drums"
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
    ttsMiss={T.voiceMiss}
    congratsMessage={T.congrats}
    logType="drum-duo"
    skillTags={['rhythm', 'coordination', 'two-hand-tap']}
  />
);

export default DrumDuoGame;
