import * as Haptics from 'expo-haptics';

export class RewardManager {
  private stars = 0;

  reset() {
    this.stars = 0;
  }

  onAttempt() {
    /* autism UX: reward trying */
  }

  onHoldProgress(_fraction: number) {
    /* optional gentle feedback — no spam */
  }

  onSuccess(holdMs: number) {
    this.stars += holdMs > 4000 ? 3 : holdMs > 2500 ? 2 : 1;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      /* ignore */
    }
  }

  getStars() {
    return this.stars;
  }
}
