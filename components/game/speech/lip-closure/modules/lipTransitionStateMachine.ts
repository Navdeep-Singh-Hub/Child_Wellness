import type { LipTransitionGameState } from './lipTransitionTypes';

const TRANSITIONS: Record<LipTransitionGameState, LipTransitionGameState[]> = {
  IDLE: ['DETECTING', 'PAUSED'],
  DETECTING: ['TRANSITIONING', 'WARNING', 'HELPING', 'PAUSED', 'IDLE'],
  TRANSITIONING: ['WARNING', 'SUCCESS', 'DETECTING', 'PAUSED'],
  WARNING: ['TRANSITIONING', 'DETECTING', 'HELPING', 'PAUSED'],
  SUCCESS: ['REWARDING', 'DETECTING'],
  REWARDING: ['DETECTING', 'IDLE'],
  HELPING: ['DETECTING', 'PAUSED'],
  PAUSED: ['DETECTING', 'IDLE'],
};

export class LipTransitionStateMachine {
  state: LipTransitionGameState = 'IDLE';

  canTransition(next: LipTransitionGameState) {
    return TRANSITIONS[this.state].includes(next);
  }

  transition(next: LipTransitionGameState): LipTransitionGameState {
    if (this.canTransition(next)) {
      this.state = next;
    }
    return this.state;
  }

  reset() {
    this.state = 'IDLE';
  }
}
