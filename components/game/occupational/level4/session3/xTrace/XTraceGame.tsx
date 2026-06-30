/** OT Level 4 · Session 3 · Game 2 — X Trace */
import { X_TRACE_CONFIG } from '@/components/game/occupational/level4/session3/xTrace/xTraceTheme';
import { DiagonalXPathGame } from '@/components/game/occupational/level4/session3/shared/DiagonalXPathGame';
import React from 'react';

const XTraceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DiagonalXPathGame {...X_TRACE_CONFIG} {...props} />
);

export default XTraceGame;
