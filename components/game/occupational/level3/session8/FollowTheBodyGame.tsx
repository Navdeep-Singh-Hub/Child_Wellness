/** OT Level 3 · Session 8 · Game 4 — Follow the Body · Theme: "Copy Body" */
import { BodyMapGame } from '@/components/game/occupational/level3/session8/BodyMapGame';
import React from 'react';

const FollowTheBodyGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyMapGame
    {...props}
    mode="followBody"
    theme={{
      title: 'Copy Body', subtitle: 'Watch the demo, then touch the same part', emoji: '👥',
      gradient: ['#F5F3FF', '#EDE9FE', '#C4B5FD', '#8B5CF6'],
      accent: '#8B5CF6', accentDark: '#6D28D9',
      backText: '#5B21B6', backBorder: 'rgba(139,92,246,0.25)',
      titleColor: '#4C1D95', subtitleColor: '#7C3AED', statLabel: '#8B5CF6', statValue: '#4C1D95',
      statBorder: 'rgba(139,92,246,0.2)', playBorder: 'rgba(139,92,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      sparkleColor: '#8B5CF6',
    }}
    ttsIntro="Watch which body part lights up, then copy it!"
    ttsComplete="Great body copying!"
    ttsFollowDemo="Watch which part is touched!"
    ttsFollowCopy="Now touch the same body part!"
    ttsWrongPart="Try the part from the demo!"
    congratsMessage="Copy Body Star!"
    logType="follow-the-body"
    skillTags={['imitation-skills', 'body-parts', 'following-instructions']}
  />
);

export default FollowTheBodyGame;
