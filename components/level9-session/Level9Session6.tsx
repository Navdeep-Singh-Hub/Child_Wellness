/**
 * Level 9 (Clockwise) — Session 6: Visual Puzzle, Vehicles, Pattern, Count 20
 */
import { CLOCKWISE_SESSIONS } from '@/components/level9-session/shared/clockwiseSessionConfigs';
import { ClockwiseSessionFlow } from '@/components/level9-session/shared/ClockwiseSessionFlow';
import React from 'react';
import { VisualPuzzleComplexLevel9Session6Game } from './VisualPuzzleComplexLevel9Session6Game';
import { CategoryRecognitionVehiclesLevel9Session6Game } from './CategoryRecognitionVehiclesLevel9Session6Game';
import { PatternLogicCircleCircleTriangleLevel9Session6Game } from './PatternLogicCircleCircleTriangleLevel9Session6Game';
import { CountingChallenge20Level9Session6Game } from './CountingChallenge20Level9Session6Game';
import { Level9NotebookUploadTriangleCenter } from './Level9NotebookUploadTriangleCenter';

interface Level9Session6Props {
  onExit?: () => void;
}

export function Level9Session6({ onExit }: Level9Session6Props = {}) {
  const config = CLOCKWISE_SESSIONS[6];

  return (
    <ClockwiseSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <VisualPuzzleComplexLevel9Session6Game onComplete={advance} />}
          {step === 2 && <CategoryRecognitionVehiclesLevel9Session6Game onComplete={advance} />}
          {step === 3 && <PatternLogicCircleCircleTriangleLevel9Session6Game onComplete={advance} />}
          {step === 4 && <CountingChallenge20Level9Session6Game onComplete={advance} />}
          {step === 5 && <Level9NotebookUploadTriangleCenter onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
