/** Lip Spreading System — shared types (Level 5 Session 4). */

export type LipSpreadGameState =
  | 'IDLE'
  | 'DETECTING'
  | 'SPREADING'
  | 'WARNING'
  | 'SUCCESS'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type LipSpreadDifficulty = 'easy' | 'medium' | 'hard';

export type LipSpreadGameId =
  | 'smile-bridge'
  | 'cheese-camera'
  | 'rainbow-smile'
  | 'eee-train'
  | 'lip-mirror-match';

export interface LipSpreadSnapshot {
  lipsSpread: boolean;
  confirmedSpread: boolean;
  spreadScore: number;
  smoothedSpread: number;
  holdDuration: number;
  confidence: number;
  unstable: boolean;
  inGracePeriod: boolean;
}

export interface LipSpreadAnalyticsRecord {
  averageSpread: number;
  holdDuration: number;
  attemptCount: number;
  microBreaks: number;
  fatigueIndicators: number;
  lastUpdated: number;
}
