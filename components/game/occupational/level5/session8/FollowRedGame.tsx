import MultiTrackGame from '@/components/game/occupational/level5/session8/MultiTrackGame';
import { FOLLOW_RED_CONFIG } from '@/components/game/occupational/level5/session8/multiTrackConfig';
import React from 'react';

const FollowRedGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = ({ onBack, onComplete }) => (
  <MultiTrackGame config={FOLLOW_RED_CONFIG} onBack={onBack} onComplete={onComplete} />
);

export default FollowRedGame;
