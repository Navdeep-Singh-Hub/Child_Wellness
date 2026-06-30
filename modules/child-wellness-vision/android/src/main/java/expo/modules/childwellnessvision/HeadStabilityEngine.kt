package expo.modules.childwellnessvision

import kotlin.math.abs
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

enum class DifficultyLevel(val maxDegrees: Double) {
  EASY(15.0),
  MEDIUM(8.0),
  HARD(4.0);

  companion object {
    fun from(value: String?): DifficultyLevel = when (value?.lowercase()) {
      "medium" -> MEDIUM
      "hard" -> HARD
      else -> EASY
    }
  }
}

data class HeadStabilitySnapshot(
  val stabilityScore: Double,
  val movementSpeed: Double,
  val rotationAmount: Double,
  val headYaw: Double,
  val headPitch: Double,
  val headRoll: Double,
  val stableMs: Long,
  val crownFall: Boolean,
)

class HeadStabilityEngine(private var difficulty: DifficultyLevel = DifficultyLevel.EASY) {
  private var baselineYaw = 0.0
  private var baselinePitch = 0.0
  private var baselineRoll = 0.0
  private var calibrated = false
  private var stableAccumMs = 0L
  private var lastTimestampMs = 0L
  private var score = 50.0
  private var prevNoseX = 0.0
  private var prevNoseY = 0.0
  private var hasPrevNose = false
  private var crownFallCooldownUntil = 0L

  fun setDifficulty(level: DifficultyLevel) {
    difficulty = level
  }

  fun resetCalibration() {
    calibrated = false
    stableAccumMs = 0L
    score = 50.0
    hasPrevNose = false
    lastTimestampMs = 0L
  }

  fun calibrate(yaw: Double, pitch: Double, roll: Double) {
    baselineYaw = yaw
    baselinePitch = pitch
    baselineRoll = roll
    calibrated = true
    stableAccumMs = 0L
    score = 50.0
    hasPrevNose = false
  }

  fun update(
    timestampMs: Long,
    yaw: Double,
    pitch: Double,
    roll: Double,
    noseX: Double,
    noseY: Double,
  ): HeadStabilitySnapshot {
    if (!calibrated) {
      calibrate(yaw, pitch, roll)
    }

    val dt = if (lastTimestampMs > 0L) max(1L, timestampMs - lastTimestampMs) else 33L
    lastTimestampMs = timestampMs

    val dYaw = abs(yaw - baselineYaw)
    val dPitch = abs(pitch - baselinePitch)
    val dRoll = abs(roll - baselineRoll)
    val rotationAmount = max(dYaw, max(dPitch, dRoll))

    var movementSpeed = 0.0
    if (hasPrevNose) {
      movementSpeed = hypot(noseX - prevNoseX, noseY - prevNoseY) / (dt / 1000.0)
    }
    prevNoseX = noseX
    prevNoseY = noseY
    hasPrevNose = true

    val withinThreshold = rotationAmount <= difficulty.maxDegrees
    if (withinThreshold) {
      stableAccumMs += dt
      if (stableAccumMs >= 5000L) {
        score = min(100.0, score + (dt / 1000.0) * 4.0)
        stableAccumMs = 5000L
      }
    } else {
      stableAccumMs = 0L
      score = max(0.0, score - (dt / 1000.0) * 8.0)
    }

    val rotPenalty = (rotationAmount / difficulty.maxDegrees).coerceIn(0.0, 1.5)
    val movePenalty = (movementSpeed / 0.35).coerceIn(0.0, 1.0)
    val instantStability = (1.0 - rotPenalty * 0.75 - movePenalty * 0.25).coerceIn(0.0, 1.0)
    val stabilityScore = (score * 0.55 + instantStability * 100.0 * 0.45).coerceIn(0.0, 100.0)

    val crownFall = !withinThreshold && timestampMs >= crownFallCooldownUntil
    if (crownFall) {
      crownFallCooldownUntil = timestampMs + 900L
      score = max(0.0, score - 12.0)
    }

    return HeadStabilitySnapshot(
      stabilityScore = stabilityScore,
      movementSpeed = movementSpeed,
      rotationAmount = rotationAmount,
      headYaw = yaw,
      headPitch = pitch,
      headRoll = roll,
      stableMs = stableAccumMs,
      crownFall = crownFall,
    )
  }
}
