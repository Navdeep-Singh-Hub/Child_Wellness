import type { LipResistanceGameState } from './lipResistanceTypes';

const TRANSITIONS: Record<LipResistanceGameState, LipResistanceGameState[]> = {
  IDLE: ['DETECTING', 'PAUSED'],
  DETECTING: ['HOLDING', 'WARNING', 'HELPING', 'PAUSED', 'IDLE'],
  HOLDING: ['WARNING', 'SUCCESS', 'DETECTING', 'PAUSED'],
  WARNING: ['HOLDING', 'DETECTING', 'HELPING', 'PAUSED'],
  SUCCESS: ['REWARDING', 'DETECTING'],
  REWARDING: ['DETECTING', 'IDLE'],
  HELPING: ['DETECTING', 'PAUSED'],
  PAUSED: ['DETECTING', 'IDLE'],
};

export class LipResistanceStateMachine {
  state: LipResistanceGameState = 'IDLE';

  canTransition(next: LipResistanceGameState) {
    return TRANSITIONS[this.state].includes(next);
  }

  transition(next: LipResistanceGameState): LipResistanceGameState {
    if (this.canTransition(next)) {
      this.state = next;
    }
    return this.state;
  }

  reset() {
    this.state = 'IDLE';
  }
}
