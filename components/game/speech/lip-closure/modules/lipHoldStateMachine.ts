import type { LipHoldGameState } from './lipHoldTypes';

const TRANSITIONS: Record<LipHoldGameState, LipHoldGameState[]> = {
  IDLE: ['DETECTING', 'PAUSED'],
  DETECTING: ['STABLE', 'WARNING', 'HELPING', 'PAUSED', 'IDLE'],
  STABLE: ['WARNING', 'SUCCESS', 'DETECTING', 'PAUSED'],
  WARNING: ['STABLE', 'DETECTING', 'HELPING', 'PAUSED'],
  SUCCESS: ['REWARDING', 'DETECTING'],
  REWARDING: ['DETECTING', 'IDLE'],
  HELPING: ['DETECTING', 'PAUSED'],
  PAUSED: ['DETECTING', 'IDLE'],
};

export class LipHoldStateMachine {
  state: LipHoldGameState = 'IDLE';

  canTransition(next: LipHoldGameState) {
    return TRANSITIONS[this.state].includes(next);
  }

  transition(next: LipHoldGameState): LipHoldGameState {
    if (this.canTransition(next)) {
      this.state = next;
    }
    return this.state;
  }

  reset() {
    this.state = 'IDLE';
  }
}
