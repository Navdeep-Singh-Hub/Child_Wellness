/** OT Level 4 · Session 6 · Game 4 — Rhythm Pass · Theme: "Beat Pass" · Neon Beat Stage */
import { MidlinePassGame } from '@/components/game/occupational/level4/session6/MidlinePassGame';
import { BEAT_PASS_THEME as T } from '@/components/game/occupational/level4/session6/session6Theme';
import React from 'react';

const RhythmPassGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MidlinePassGame
    {...props}
    mode="rhythmPass"
    theme={{
      title: T.title,
      subtitle: T.subtitle,
      emoji: T.emoji,
      gradient: T.gradient,
      accent: T.accent,
      accentDark: T.accentDark,
      ballEmoji: T.ballEmoji,
      leftColor: T.leftColor,
      rightColor: T.rightColor,
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
    ttsMissBeat={T.voiceMissBeat}
    congratsMessage={T.congrats}
    logType="rhythm-pass"
    skillTags={['timing', 'flow', 'rhythm', 'midline-crossing']}
  />
);

export default RhythmPassGame;
