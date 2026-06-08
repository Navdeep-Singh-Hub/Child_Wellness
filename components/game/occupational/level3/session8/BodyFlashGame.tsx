/** OT Level 3 · Session 8 · Game 5 — Body Flash · Theme: "Quick Part" */
import { BodyMapGame } from '@/components/game/occupational/level3/session8/BodyMapGame';
import React from 'react';

const BodyFlashGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyMapGame
    {...props}
    mode="bodyFlash"
    theme={{
      title: 'Quick Part', subtitle: 'Tap each flashing body part fast', emoji: '⚡',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#DC2626', statLabel: '#EF4444', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444',
    }}
    ttsIntro="Body parts flash quickly — tap each one while you see it!"
    ttsComplete="Lightning fast!"
    ttsFlash="Tap the flashing part quickly!"
    ttsFlashMiss="Tap it while you see it!"
    congratsMessage="Quick Part Hero!"
    logType="body-flash"
    skillTags={['fast-recognition', 'body-parts', 'reaction-time']}
  />
);

export default BodyFlashGame;
