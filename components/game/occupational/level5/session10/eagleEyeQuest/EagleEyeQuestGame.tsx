import VisualGauntletGame from '@/components/game/occupational/level5/session10/VisualGauntletGame';
import { EAGLE_EYE_QUEST_CONFIG } from '@/components/game/occupational/level5/session10/eagleEyeQuest/eagleEyeQuestTheme';
import React from 'react';

const EagleEyeQuestGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VisualGauntletGame {...props} config={EAGLE_EYE_QUEST_CONFIG} />
);
export default EagleEyeQuestGame;
