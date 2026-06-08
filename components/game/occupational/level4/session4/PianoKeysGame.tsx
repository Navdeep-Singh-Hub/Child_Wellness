/** OT Level 4 · Session 4 · Game 2 — Piano Keys · Theme: "Duo Keys" */
import { DualTapGame } from '@/components/game/occupational/level4/session4/DualTapGame';
import React from 'react';

const PianoKeysGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualTapGame
    {...props}
    mode="keys"
    theme={{
      title: 'Duo Keys', subtitle: 'Press both keys before time runs out', emoji: '🎹',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9', leftColor: '#8B5CF6', rightColor: '#8B5CF6',
      leftEmoji: '⬅️', rightEmoji: '➡️', targetStyle: 'key',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#7C3AED', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
    }}
    ttsIntro="Tap both piano keys together before time runs out!"
    ttsComplete="Perfect key sync!"
    ttsCue="Tap both keys together!"
    ttsMiss="Tap both keys before time runs out!"
    congratsMessage="Duo Keys Pro!"
    logType="piano-keys"
    skillTags={['hand-synchronization', 'two-hand-tap']}
  />
);

export default PianoKeysGame;
