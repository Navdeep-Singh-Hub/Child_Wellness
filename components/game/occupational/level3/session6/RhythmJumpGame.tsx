/** OT Level 3 · Session 6 · Game 4 — Beat Jump */
import { JumpTapGame } from '@/components/game/occupational/level3/session6/JumpTapGame';
import { GAME_THEMES, POND_CHARACTERS, POND_SHELL } from '@/components/game/occupational/level3/session6/jumpPondTheme';
import React from 'react';

const G = GAME_THEMES.rhythmJump;

const RhythmJumpGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <JumpTapGame
    {...props}
    mode="rhythmJump"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: ['#FAF5FF', '#F3E8FF', '#D8B4FE', '#9333EA'],
      accent: '#A855F7',
      accentDark: '#7E22CE',
      objectEmoji: POND_CHARACTERS.cricket.emoji,
      backText: '#6B21A8',
      backBorder: 'rgba(168,85,247,0.25)',
      titleColor: '#581C87',
      subtitleColor: '#7E22CE',
      statLabel: '#A855F7',
      statValue: '#581C87',
      statBorder: 'rgba(168,85,247,0.2)',
      playBorder: 'rgba(168,85,247,0.25)',
      playBg: POND_SHELL.playBg,
      sparkleColor: POND_SHELL.sparkleColor,
      hintText: G.hintText,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsRhythmPrompt="Now tap the same tap-tap rhythm!"
    ttsRhythmFail="Try matching the beat!"
    congratsMessage={G.congrats}
    logType="rhythm-jump"
    skillTags={['auditory-motor-timing', 'rhythm-imitation', 'sequencing', 'attention']}
  />
);

export default RhythmJumpGame;
