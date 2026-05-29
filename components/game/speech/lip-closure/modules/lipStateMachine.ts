import type { LipGameState } from './types';

const TRANSITIONS: Record<LipGameState, LipGameState[]> = {
  IDLE: ['DETECTING', 'PAUSED'],
  DETECTING: ['SUCCESS', 'HELPING', 'PAUSED', 'IDLE'],
  HELPING: ['DETECTING', 'PAUSED'],
  SUCCESS: ['REWARDING', 'DETECTING'],
  REWARDING: ['DETECTING', 'IDLE'],
  PAUSED: ['DETECTING', 'IDLE'],
};

export class LipStateMachine {
  state: LipGameState = 'IDLE';

  canTransition(next: LipGameState) {
    return TRANSITIONS[this.state].includes(next);
  }

  transition(next: LipGameState): LipGameState {
    if (this.canTransition(next)) {
      this.state = next;
    }
    return this.state;
  }

  reset() {
    this.state = 'IDLE';
  }
}
