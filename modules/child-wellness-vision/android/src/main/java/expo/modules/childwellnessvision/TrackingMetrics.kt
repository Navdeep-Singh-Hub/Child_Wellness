package expo.modules.childwellnessvision

import kotlin.math.abs
import kotlin.math.hypot
import kotlin.math.max
import kotlin.math.min

enum class GameEventType(val value: String) {
  HEAD_STABLE("HEAD_STABLE"),
  MOUTH_OPEN("MOUTH_OPEN"),
  PINCH_SUCCESS("PINCH_SUCCESS"),
  HAND_RAISED("HAND_RAISED"),
  BOTH_HANDS_UP("BOTH_HANDS_UP"),
  SMILE_DETECTED("SMILE_DETECTED"),
  CROWN_FALL("CROWN_FALL"),
}

class GameEventEngine {
  private var headStableEmitted = false
  private var mouthOpenEmitted = false
  private var smileEmitted = false
  private var pinchEmitted = false
  private var leftRaisedEmitted = false
  private var rightRaisedEmitted = false
  private var bothHandsEmitted = false
  private var crownFallCooldownUntil = 0L

  fun reset() {
    headStableEmitted = false
    mouthOpenEmitted = false
    smileEmitted = false
    pinchEmitted = false
    leftRaisedEmitted = false
    rightRaisedEmitted = false
    bothHandsEmitted = false
    crownFallCooldownUntil = 0L
  }

  fun evaluate(
    timestampMs: Long,
    stableMs: Long,
    mouthOpenScore: Double,
    smileRatio: Double,
    pinchDistance: Double?,
    leftHandRaised: Boolean,
    rightHandRaised: Boolean,
    crownFall: Boolean,
  ): List<GameEventType> {
    val events = mutableListOf<GameEventType>()

    if (stableMs >= 5000L && !headStableEmitted) {
      headStableEmitted = true
      events.add(GameEventType.HEAD_STABLE)
    }
    if (stableMs < 4500L) headStableEmitted = false

    if (mouthOpenScore >= 0.55 && !mouthOpenEmitted) {
      mouthOpenEmitted = true
      events.add(GameEventType.MOUTH_OPEN)
    }
    if (mouthOpenScore < 0.35) mouthOpenEmitted = false

    if (smileRatio >= 0.6 && !smileEmitted) {
      smileEmitted = true
      events.add(GameEventType.SMILE_DETECTED)
    }
    if (smileRatio < 0.4) smileEmitted = false

    if (pinchDistance != null && pinchDistance < 0.04 && !pinchEmitted) {
      pinchEmitted = true
      events.add(GameEventType.PINCH_SUCCESS)
    }
    if (pinchDistance != null && pinchDistance > 0.07) pinchEmitted = false

    if (leftHandRaised && !leftRaisedEmitted) {
      leftRaisedEmitted = true
      events.add(GameEventType.HAND_RAISED)
    }
    if (!leftHandRaised) leftRaisedEmitted = false

    if (rightHandRaised && !rightRaisedEmitted) {
      rightRaisedEmitted = true
      events.add(GameEventType.HAND_RAISED)
    }
    if (!rightHandRaised) rightRaisedEmitted = false

    if (leftHandRaised && rightHandRaised && !bothHandsEmitted) {
      bothHandsEmitted = true
      events.add(GameEventType.BOTH_HANDS_UP)
    }
    if (!leftHandRaised || !rightHandRaised) bothHandsEmitted = false

    if (crownFall && timestampMs >= crownFallCooldownUntil) {
      crownFallCooldownUntil = timestampMs + 800L
      events.add(GameEventType.CROWN_FALL)
    }

    return events
  }
}

object MouthExerciseEngine {
  fun mouthMetrics(landmarks: List<Map<String, Double>>): Map<String, Double> {
    fun pt(i: Int): Pair<Double, Double>? {
      if (i < 0 || i >= landmarks.size) return null
      val lm = landmarks[i]
      val x = lm["x"] ?: return null
      val y = lm["y"] ?: return null
      return x to y
    }

    val upper = pt(13) ?: pt(0)
    val lower = pt(14) ?: pt(17)
    val left = pt(61) ?: pt(78)
    val right = pt(291) ?: pt(308)
    if (upper == null || lower == null || left == null || right == null) {
      return mapOf(
        "mouthOpenScore" to 0.0,
        "mouthRoundness" to 0.0,
        "mouthWidthRatio" to 0.0,
        "oooScore" to 0.0,
        "eeeScore" to 0.0,
        "aaaScore" to 0.0,
        "uuuScore" to 0.0,
      )
    }

    val mouthHeight = hypot(upper.first - lower.first, upper.second - lower.second)
    val mouthWidth = max(0.001, hypot(left.first - right.first, left.second - right.second))
    val mouthOpenScore = (mouthHeight / mouthWidth).coerceIn(0.0, 1.0)
    val roundness = (1.0 - abs(mouthWidth - mouthHeight) / mouthWidth).coerceIn(0.0, 1.0)
    val widthRatio = (mouthWidth * 4.0).coerceIn(0.0, 1.0)

    val ooo = (roundness * 0.7 + mouthOpenScore * 0.3).coerceIn(0.0, 1.0)
    val eee = ((1.0 - mouthOpenScore) * 0.6 + (1.0 - roundness) * 0.4).coerceIn(0.0, 1.0)
    val aaa = (mouthOpenScore * 0.75 + (1.0 - roundness) * 0.25).coerceIn(0.0, 1.0)
    val uuu = (roundness * 0.55 + (1.0 - widthRatio) * 0.45).coerceIn(0.0, 1.0)

    return mapOf(
      "mouthOpenScore" to mouthOpenScore,
      "mouthRoundness" to roundness,
      "mouthWidthRatio" to widthRatio,
      "oooScore" to ooo,
      "eeeScore" to eee,
      "aaaScore" to aaa,
      "uuuScore" to uuu,
    )
  }
}

object FaceMetrics {
  fun headAnglesFromMatrix(matrix: FloatArray?): Triple<Double, Double, Double> {
    if (matrix == null || matrix.size < 16) return Triple(0.0, 0.0, 0.0)
    val r00 = matrix[0]
    val r10 = matrix[4]
    val r20 = matrix[8]
    val r21 = matrix[9]
    val r22 = matrix[10]
    val pitch = Math.toDegrees(kotlin.math.asin((-r20.toDouble()).coerceIn(-1.0, 1.0)))
    val yaw = Math.toDegrees(kotlin.math.atan2(r10.toDouble(), r00.toDouble()))
    val roll = Math.toDegrees(kotlin.math.atan2(r21.toDouble(), r22.toDouble()))
    return Triple(yaw, pitch, roll)
  }

  fun eyeOpenRatio(landmarks: List<Map<String, Double>>): Double {
    fun dist(a: Int, b: Int): Double {
      val pa = landmarks.getOrNull(a) ?: return 0.0
      val pb = landmarks.getOrNull(b) ?: return 0.0
      return hypot((pa["x"] ?: 0.0) - (pb["x"] ?: 0.0), (pa["y"] ?: 0.0) - (pb["y"] ?: 0.0))
    }
    val left = dist(159, 145) / max(0.001, dist(33, 133))
    val right = dist(386, 374) / max(0.001, dist(362, 263))
    return ((left + right) / 2.0).coerceIn(0.0, 1.0)
  }

  fun smileRatio(landmarks: List<Map<String, Double>>): Double {
    val left = landmarks.getOrNull(61)
    val right = landmarks.getOrNull(291)
    val top = landmarks.getOrNull(13)
    if (left == null || right == null || top == null) return 0.0
    val mouthWidth = abs((right["x"] ?: 0.0) - (left["x"] ?: 0.0))
    val lift = ((left["y"] ?: 0.0) + (right["y"] ?: 0.0)) / 2.0 - (top["y"] ?: 0.0)
    return ((mouthWidth * 2.5).coerceIn(0.0, 1.0) * 0.5 + (lift * 8.0).coerceIn(0.0, 1.0) * 0.5)
      .coerceIn(0.0, 1.0)
  }
}

object HandMetrics {
  fun pinchDistance(landmarks: List<Map<String, Double>>?): Double? {
    if (landmarks == null || landmarks.size < 9) return null
    val thumb = landmarks[4]
    val index = landmarks[8]
    return hypot((thumb["x"] ?: 0.0) - (index["x"] ?: 0.0), (thumb["y"] ?: 0.0) - (index["y"] ?: 0.0))
  }

  fun openness(landmarks: List<Map<String, Double>>?): Double {
    if (landmarks == null || landmarks.size < 21) return 0.0
    val wrist = landmarks[0]
    val tips = listOf(4, 8, 12, 16, 20)
    var sum = 0.0
    for (tip in tips) {
      val t = landmarks[tip]
      sum += hypot((t["x"] ?: 0.0) - (wrist["x"] ?: 0.0), (t["y"] ?: 0.0) - (wrist["y"] ?: 0.0))
    }
    return (sum / 5.0).coerceIn(0.0, 1.0)
  }

  fun isRaised(landmarks: List<Map<String, Double>>?, noseY: Double): Boolean {
    if (landmarks == null || landmarks.size < 9) return false
    val wristY = landmarks[0]["y"] ?: 1.0
    return wristY < noseY - 0.08
  }
}
