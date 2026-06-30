/** OT Level 4 · Session 1 · Game 4 — Color Slide */
import { COLOR_SLIDE_CONFIG } from '@/components/game/occupational/level4/session1/colorSlide/colorSlideTheme';
import { HorizontalDragGame } from '@/components/game/occupational/level4/session1/shared/HorizontalDragGame';
import React from 'react';

const ColorSlideGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <HorizontalDragGame {...COLOR_SLIDE_CONFIG} {...props} />
);

export default ColorSlideGame;
