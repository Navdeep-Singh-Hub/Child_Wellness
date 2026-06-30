/**
 * Builder Session 5 — Game 2: Count Objects
 * Count apples and choose the number. Reuses ObjectCountGame with 3 apples.
 */
import React from 'react';
import { ObjectCountGame } from '@/components/explorer-session/ObjectCountGame';

export interface CountObjectsGameProps {
  onComplete: () => void;
}

export function CountObjectsGame({ onComplete }: CountObjectsGameProps) {
  return (
    <ObjectCountGame
      onComplete={onComplete}
      objectDisplay="🍎🍎🍎"
      objectLabel="apples"
      icon="🍎"
      options={['2', '3', '4']}
      correct="3"
    />
  );
}
