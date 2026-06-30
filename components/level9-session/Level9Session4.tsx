/**
 * Level 9 (Clockwise) — Session 4: Counting 18, Hexagon, Function Matching, Kitchen/Garden/Bedroom
 */
import { CLOCKWISE_SESSIONS } from '@/components/level9-session/shared/clockwiseSessionConfigs';
import { ClockwiseSessionFlow } from '@/components/level9-session/shared/ClockwiseSessionFlow';
import React from 'react';
import { CountingChallenge18Level9Session4Game } from './CountingChallenge18Level9Session4Game';
import { ShapeRecognitionHexagonLevel9Session4Game } from './ShapeRecognitionHexagonLevel9Session4Game';
import { FunctionMatchingLevel9Session4Game } from './FunctionMatchingLevel9Session4Game';
import { KitchenGardenBedroomSortingLevel9Session4Game } from './KitchenGardenBedroomSortingLevel9Session4Game';
import { Level9NotebookUploadRoundRectangular } from './Level9NotebookUploadRoundRectangular';

interface Level9Session4Props {
  onExit?: () => void;
}

export function Level9Session4({ onExit }: Level9Session4Props = {}) {
  const config = CLOCKWISE_SESSIONS[4];

  return (
    <ClockwiseSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <CountingChallenge18Level9Session4Game onComplete={advance} />}
          {step === 2 && <ShapeRecognitionHexagonLevel9Session4Game onComplete={advance} />}
          {step === 3 && <FunctionMatchingLevel9Session4Game onComplete={advance} />}
          {step === 4 && <KitchenGardenBedroomSortingLevel9Session4Game onComplete={advance} />}
          {step === 5 && <Level9NotebookUploadRoundRectangular onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
