/** OT Level 4 · Session 10 · Game 1 — Clap Pattern · Theme: "Cross Clap" */
import { RhythmPatternGame } from '@/components/game/occupational/level4/session10/RhythmPatternGame';
import React from 'react';

const ClapPatternGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RhythmPatternGame
    {...props}
    mode="clapCross"
    theme={{
      title: 'Cross Clap', subtitle: 'Listen, then copy cross-body claps!', emoji: '👏',
      gradient: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6'],
      accent: '#3B82F6', accentDark: '#1D4ED8', leftColor: '#3B82F6', rightColor: '#EF4444',
      backText: '#1E40AF', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1E3A8A', subtitleColor: '#2563EB', statLabel: '#3B82F6', statValue: '#1E3A8A',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#3B82F6',
    }}
    ttsIntro="Listen to the cross-body clap pattern, then copy it!"
    ttsComplete="Great cross-body clapping!"
    ttsListen="Listen to the clap pattern!"
    ttsCopy="Now copy the pattern!"
    ttsSuccess="Perfect!"
    ttsFail="Try again!"
    congratsMessage="Cross Clap Star!"
    logType="clap-pattern"
    skillTags={['rhythm', 'midline', 'cross-body-coordination', 'pattern-copying']}
  />
);

export default ClapPatternGame;
