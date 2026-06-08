/** OT Level 2 · Session 4 · Game 5 — River Boat Guide · Theme: "River Run" */
import { PathFollowGame } from '@/components/game/occupational/level2/session4/PathFollowGame';
import { makeRiverPath } from '@/components/game/occupational/level2/session4/traceUtils';
import React from 'react';

const RiverBoatGuideGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <PathFollowGame
    {...props}
    pathMode="river"
    theme={{
      title: 'River Run', subtitle: 'Guide the boat along the curvy river', emoji: '🛶',
      gradient: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD'],
      trackStroke: '#3B82F6', progressStroke: '#1D4ED8',
      backText: '#1D4ED8', backBorder: 'rgba(59,130,246,0.25)',
      titleColor: '#1D4ED8', subtitleColor: '#2563EB', statLabel: '#2563EB', statValue: '#1D4ED8',
      statBorder: 'rgba(59,130,246,0.2)', playBorder: 'rgba(59,130,246,0.25)', playBg: 'rgba(255,255,255,0.35)',
      objColors: ['#60A5FA', '#2563EB'], sparkleColor: '#2563EB',
    }}
    generatePoints={makeRiverPath}
    ttsIntro="Keep the boat in the river and follow the curvy path!"
    ttsComplete="River run complete!"
    ttsRetry="Keep the boat in the river!"
    congratsMessage="River Captain!"
    logType="riverBoatGuide"
    skillTags={['continuous-tracking', 'curved-path-following', 'sustained-attention']}
  />
);

export default RiverBoatGuideGame;
