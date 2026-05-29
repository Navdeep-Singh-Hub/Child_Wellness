import type { LipRoundGameState } from './lipRoundTypes';

const TRANSITIONS: Record<LipRoundGameState, LipRoundGameState[]> = {
  IDLE: ['DETECTING', 'PAUSED'],
  DETECTING: ['ROUNDED', 'WARNING', 'HELPING', 'PAUSED', 'IDLE'],
  ROUNDED: ['WARNING', 'SUCCESS', 'DETECTING', 'PAUSED'],
  WARNING: ['ROUNDED', 'DETECTING', 'HELPING', 'PAUSED'],
  SUCCESS: ['REWARDING', 'DETECTING'],
  REWARDING: ['DETECTING', 'IDLE'],
  HELPING: ['DETECTING', 'PAUSED'],
  PAUSED: ['DETECTING', 'IDLE'],
};

export class LipRoundStateMachine {
  state: LipRoundGameState = 'IDLE';

  canTransition(next: LipRoundGameState) {
    return TRANSITIONS[this.state].includes(next);
  }

  transition(next: LipRoundGameState): LipRoundGameState {
    if (this.canTransition(next)) {
      this.state = next;
    }
    return this.state;
  }

  reset() {
    this.state = 'IDLE';
  }
}
