/** OT Level 3 · Session 8 · Game 4 — Copy Body */
import { BodyMapGame } from '@/components/game/occupational/level3/session8/BodyMapGame';
import { GAME_THEMES, ROBO_SHELL } from '@/components/game/occupational/level3/session8/roboBodyTheme';
import React from 'react';

const G = GAME_THEMES.followBody;

const FollowTheBodyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyMapGame
    {...props}
    mode="followBody"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FAF5FF', '#F3E8FF', '#D8B4FE', '#9333EA'],
      accent: '#A855F7',
      accentDark: '#7E22CE',
      backText: '#6B21A8',
      backBorder: 'rgba(168,85,247,0.25)',
      titleColor: '#581C87',
      subtitleColor: '#7E22CE',
      statLabel: '#A855F7',
      statValue: '#581C87',
      statBorder: 'rgba(168,85,247,0.2)',
      playBorder: 'rgba(168,85,247,0.25)',
      playBg: ROBO_SHELL.playBg,
      sparkleColor: ROBO_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsFollowDemo="Watch which part Professor Bot touches!"
    ttsFollowCopy="Now touch the same body part!"
    ttsWrongPart="Try the highlighted body part!"
    congratsMessage={G.congrats}
    logType="follow-the-body"
    skillTags={['observation', 'memory', 'body-awareness', 'imitation']}
  />
);

export default FollowTheBodyGame;
