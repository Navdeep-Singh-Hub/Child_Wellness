import type { LipSpreadGameState } from './lipSpreadTypes';

const TRANSITIONS: Record<LipSpreadGameState, LipSpreadGameState[]> = {
  IDLE: ['DETECTING', 'PAUSED'],
  DETECTING: ['SPREADING', 'WARNING', 'HELPING', 'PAUSED', 'IDLE'],
  SPREADING: ['WARNING', 'SUCCESS', 'DETECTING', 'PAUSED'],
  WARNING: ['SPREADING', 'DETECTING', 'HELPING', 'PAUSED'],
  SUCCESS: ['REWARDING', 'DETECTING'],
  REWARDING: ['DETECTING', 'IDLE'],
  HELPING: ['DETECTING', 'PAUSED'],
  PAUSED: ['DETECTING', 'IDLE'],
};

export class LipSpreadStateMachine {
  state: LipSpreadGameState = 'IDLE';

  canTransition(next: LipSpreadGameState) {
    return TRANSITIONS[this.state].includes(next);
  }

  transition(next: LipSpreadGameState): LipSpreadGameState {
    if (this.canTransition(next)) {
      this.state = next;
    }
    return this.state;
  }

  reset() {
    this.state = 'IDLE';
  }
}
