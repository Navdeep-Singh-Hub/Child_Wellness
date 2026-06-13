/** OT Level 3 · Session 7 · Game 4 — Peak Swipe */
import { SwingMotionGame } from '@/components/game/occupational/level3/session7/SwingMotionGame';
import { GAME_THEMES, JUNGLE_CHARACTERS, JUNGLE_SHELL } from '@/components/game/occupational/level3/session7/jungleSwingTheme';
import React from 'react';

const G = GAME_THEMES.ropeTiming;

const RopeSwingTimingGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <SwingMotionGame
    {...props}
    mode="ropeTiming"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444',
      accentDark: '#B91C1C',
      objectEmoji: JUNGLE_CHARACTERS.polly.emoji,
      backText: '#991B1B',
      backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D',
      subtitleColor: '#DC2626',
      statLabel: '#EF4444',
      statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)',
      playBorder: 'rgba(239,68,68,0.25)',
      playBg: JUNGLE_SHELL.playBg,
      sparkleColor: JUNGLE_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsTimingMiss="Swipe when the rope is at the peak!"
    ttsSwipeMore="Swipe at the top of the swing!"
    congratsMessage={G.congrats}
    logType="rope-swing-timing"
    skillTags={['timing-control', 'visual-tracking', 'anticipation', 'motor-planning']}
  />
);

export default RopeSwingTimingGame;
