/**
 * Blow Detection Utility
 * Detects sustained blowing by combining mouth open state and jaw protrusion
 */

export interface BlowState {
  isBlowing: boolean;
  intensity: number; // 0-1, combination of ratio and protrusion
  duration: number; // milliseconds
  isSustained: boolean; // true if blow has been sustained for threshold duration
}

export class BlowDetector {
  private blowStartTime: number | null = null;
  private isBlowing: boolean = false;
  private sustainedThreshold: number; // milliseconds (500-1000ms)
  private protrusionThreshold: number; // 0.4
  private lastIntensity: number = 0;
  private intensityHistory: number[] = []; // For smoothing
  private readonly historySize = 5;

  constructor(
    sustainedThreshold: number = 800, // 0.8 seconds
    protrusionThreshold: number = 0.4
  ) {
    this.sustainedThreshold = sustainedThreshold;
    this.protrusionThreshold = protrusionThreshold;
  }

  /**
   * Update blow detection state
   * @param isOpen - Mouth is open
   * @param protrusion - Jaw protrusion (0-1)
   * @param ratio - Mouth opening ratio (0-1)
   * @returns BlowState with current detection status
   */
  update(isOpen: boolean, protrusion: number, ratio: number): BlowState {
    const now = Date.now();
    
    // Calculate blow intensity (combination of ratio and protrusion)
    // Normalize ratio to 0-1 range (assuming max ratio ~0.05)
    const normalizedRatio = Math.min(1, ratio / 0.05);
    const intensity = Math.min(1, (normalizedRatio * 0.4 + protrusion * 0.6));
    
    // Smooth intensity using moving average
    this.intensityHistory.push(intensity);
    if (this.intensityHistory.length > this.historySize) {
      this.intensityHistory.shift();
    }
    const smoothedIntensity = this.intensityHistory.reduce((a, b) => a + b, 0) / this.intensityHistory.length;
    this.lastIntensity = smoothedIntensity;

    // Check if conditions for blowing are met
    const meetsThreshold = isOpen && protrusion >= this.protrusionThreshold;

    if (meetsThreshold && !this.isBlowing) {
      // Start of blow
      this.isBlowing = true;
      this.blowStartTime = now;
    } else if (!meetsThreshold && this.isBlowing) {
      // End of blow
      this.isBlowing = false;
      this.blowStartTime = null;
    }

    // Calculate duration
    const duration = this.blowStartTime ? now - this.blowStartTime : 0;
    const isSustained = duration >= this.sustainedThreshold;

    return {
      isBlowing: this.isBlowing,
      intensity: smoothedIntensity,
      duration,
      isSustained,
    };
  }

  /**
   * Reset detector state
   */
  reset(): void {
    this.isBlowing = false;
    this.blowStartTime = null;
    this.lastIntensity = 0;
    this.intensityHistory = [];
  }

  /**
   * Get current intensity (0-1)
   */
  getIntensity(): number {
    return this.lastIntensity;
  }
}

