/** OT Level 4 · Session 4 · Game 4 — Light Up Targets · Theme: "Flash Tap" */
import { DualTapGame } from '@/components/game/occupational/level4/session4/DualTapGame';
import React from 'react';

const LightUpTargetsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DualTapGame
    {...props}
    mode="lights"
    theme={{
      title: 'Flash Tap', subtitle: 'Tap both targets when they light up', emoji: '💡',
      gradient: ['#FEF2F2', '#FECACA', '#FCA5A5', '#EF4444'],
      accent: '#EF4444', accentDark: '#B91C1C', leftColor: '#3B82F6', rightColor: '#EF4444',
      leftEmoji: '💡', rightEmoji: '💡', targetStyle: 'circle',
      backText: '#991B1B', backBorder: 'rgba(239,68,68,0.25)',
      titleColor: '#7F1D1D', subtitleColor: '#DC2626', statLabel: '#EF4444', statValue: '#7F1D1D',
      statBorder: 'rgba(239,68,68,0.2)', playBorder: 'rgba(239,68,68,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#EF4444',
    }}
    ttsIntro="Watch for the lights, then tap both targets fast!"
    ttsComplete="Lightning fast reactions!"
    ttsCue="Tap both targets now!"
    ttsSuccess="Fast reaction!"
    congratsMessage="Flash Tap Hero!"
    logType="light-up-targets"
    skillTags={['reaction-timing', 'two-hand-tap']}
  />
);

export default LightUpTargetsGame;
