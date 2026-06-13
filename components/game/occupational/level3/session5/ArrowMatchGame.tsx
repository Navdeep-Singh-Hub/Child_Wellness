/** OT Level 3 · Session 5 · Game 2 — Arrow Sync */
import { HorizontalSwipeGame } from '@/components/game/occupational/level3/session5/HorizontalSwipeGame';
import { GAME_THEMES, ROAD_CHARACTERS, ROAD_SHELL } from '@/components/game/occupational/level3/session5/roadKingdomTheme';
import React from 'react';

const G = GAME_THEMES.arrowMatch;

const ArrowMatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalSwipeGame
    {...props}
    mode="arrowMatch"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#2563EB'],
      accent: '#3B82F6',
      accentDark: '#1D4ED8',
      objectEmoji: '⬅️',
      backText: ROAD_SHELL.backText,
      backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A',
      subtitleColor: '#2563EB',
      statLabel: '#3B82F6',
      statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)',
      playBorder: 'rgba(59,130,246,0.25)',
      playBg: ROAD_SHELL.playBg,
      sparkleColor: ROAD_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsLeft="Swipe LEFT!"
    ttsRight="Swipe RIGHT!"
    congratsMessage={G.congrats}
    logType="arrow-match"
    skillTags={['reaction-speed', 'direction-recognition', 'visual-processing']}
  />
);

export default ArrowMatchGame;
