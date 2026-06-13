/** OT Level 3 · Session 5 · Game 4 — Flip Side */
import { HorizontalSwipeGame } from '@/components/game/occupational/level3/session5/HorizontalSwipeGame';
import { GAME_THEMES, ROAD_SHELL } from '@/components/game/occupational/level3/session5/roadKingdomTheme';
import React from 'react';

const G = GAME_THEMES.mirrorSwipe;

const MirrorSwipeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalSwipeGame
    {...props}
    mode="mirrorSwipe"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FAF5FF', '#F3E8FF', '#D8B4FE', '#9333EA'],
      accent: '#A855F7',
      accentDark: '#7E22CE',
      objectEmoji: '🪞',
      backText: '#6B21A8',
      backBorder: 'rgba(168,85,247,0.25)',
      titleColor: '#581C87',
      subtitleColor: '#7E22CE',
      statLabel: '#A855F7',
      statValue: '#581C87',
      statBorder: 'rgba(168,85,247,0.2)',
      playBorder: 'rgba(168,85,247,0.25)',
      playBg: ROAD_SHELL.playBg,
      sparkleColor: ROAD_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsLeft="Swipe LEFT!"
    ttsRight="Swipe RIGHT!"
    ttsMirror="Mirror mode! Your swipe flips the direction!"
    congratsMessage={G.congrats}
    logType="mirror-swipe"
    skillTags={['cognitive-flexibility', 'spatial-reasoning', 'directional-awareness']}
  />
);

export default MirrorSwipeGame;
