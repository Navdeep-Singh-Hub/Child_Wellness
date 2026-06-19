/** OT Level 4 · Session 8 · Game 2 — Ping-Pong Tap · Theme: "Rally Tap" */
import { SidePingPongGame } from '@/components/game/occupational/level4/session8/SidePingPongGame';
import { RALLY_TAP_THEME as T } from '@/components/game/occupational/level4/session8/session8Theme';
import React from 'react';

const PingPongTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SidePingPongGame
    {...props}
    theme={{
      title: T.title,
      subtitle: T.subtitle,
      emoji: T.emoji,
      gradient: T.gradient,
      accent: T.accent,
      accentDark: T.accentDark,
      leftColor: T.leftColor,
      rightColor: T.rightColor,
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
    }}
    ttsIntro={T.voiceIntro}
    ttsComplete={T.voiceComplete}
    ttsCue={T.voiceCue}
    ttsSuccess={T.voiceSuccess}
    ttsMiss={T.voiceMiss}
    ttsEarly={T.voiceEarly}
    ttsRetry={T.voiceRetry}
    congratsMessage={T.congrats}
    logType="ping-pong-tap"
    skillTags={['focus', 'alternating-sides', 'timing', 'visual-motor']}
  />
);

export default PingPongTapGame;
