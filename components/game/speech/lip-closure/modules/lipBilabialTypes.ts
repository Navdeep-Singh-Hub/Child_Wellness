/** Bilabial Preparation System — shared types (Level 5 Session 7). */

export type BilabialPrepGameState =
  | 'IDLE'
  | 'WAITING_FOR_CLOSURE'
  | 'WAITING_FOR_SOUND'
  | 'SUCCESS'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type BilabialPrepGameId =
  | 'lip-pop-bubble'
  | 'lip-mama-drum'
  | 'lip-balloon-burst'
  | 'lip-box-push'
  | 'lip-beat-race';

export interface BilabialEvent {
  at: number;
  timingMs: number;
}

export interface BilabialPrepSnapshot {
  lipsClosed: boolean;
  audioLevel: number;
  audioSpike: boolean;
  state: BilabialPrepGameState;
  lastEvent: BilabialEvent | null;
  confidence: number;
  unstable: boolean;
}

export interface BilabialPrepAnalyticsRecord {
  bilabialAttempts: number;
  successfulEvents: number;
  averageTiming: number;
  microBreaks: number;
  fatigueIndicators: number;
  lastUpdated: number;
}
