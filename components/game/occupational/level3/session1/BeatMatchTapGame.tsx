/** OT Level 3 · Session 1 · Game 1 — Beat Sync · Theme: "Musical Jungle" */
import { RhythmGame } from '@/components/game/occupational/level3/session1/RhythmGame';
import { GAME_THEMES, JUNGLE_SHELL } from '@/components/game/occupational/level3/session1/jungleTheme';
import React from 'react';

const G = GAME_THEMES.beatMatch;
const S = JUNGLE_SHELL;

const BeatMatchTapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmGame
    {...props}
    mode="beatMatch"
    theme={{
      title: G.title,
      subtitle: G.subtitle,
      emoji: G.emoji,
      gradient: S.gradient,
      drumBg: G.drumBg,
      drumActive: G.drumActive,
      drumText: '#fff',
      loudBtn: '#DC2626',
      softBtn: '#93C5FD',
      backText: S.backText,
      backBorder: S.backBorder,
      titleColor: S.titleColor,
      subtitleColor: S.subtitleColor,
      statLabel: S.statLabel,
      statValue: S.statValue,
      statBorder: S.statBorder,
      playBorder: S.playBorder,
      playBg: S.playBg,
      sparkleColor: S.sparkleColor,
      hintText: G.hintText,
      choiceBg: 'rgba(255,255,255,0.9)',
      choiceBorder: S.playBorder,
      choiceText: S.titleColor,
    }}
    ttsIntro={G.voiceIntro}
    ttsComplete={G.voiceComplete}
    ttsWrong="Tap right on the beat!"
    congratsMessage={G.congrats}
    logType="beatMatchTap"
    skillTags={['rhythm', 'timing', 'auditory-motor-integration', 'attention']}
  />
);

export default BeatMatchTapGame;
