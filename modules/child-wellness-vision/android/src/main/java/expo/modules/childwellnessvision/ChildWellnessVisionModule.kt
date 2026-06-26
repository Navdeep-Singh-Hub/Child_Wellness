package expo.modules.childwellnessvision

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ChildWellnessVisionModule : Module() {
  companion object {
    @JvmStatic
    var sharedSession: VisionTrackingSession? = null
  }

  private var session: VisionTrackingSession? = null

  private fun ensureSession(): VisionTrackingSession {
    if (session != null) return session!!
    val ctx = appContext.reactContext
      ?: throw IllegalStateException("React context unavailable")
    session = VisionTrackingSession(ctx) { event, payload ->
      sendEvent(event, payload)
    }
    sharedSession = session
    return session!!
  }

  override fun definition() = ModuleDefinition {
    Name("ChildWellnessVision")

    Events("onFaceData", "onHandData", "onPoseData", "onGameEvent")

    View(ChildWellnessVisionView::class) {
      Prop("active") { view: ChildWellnessVisionView, active: Boolean ->
        view.setActive(active)
      }
    }

    OnCreate {
      // Warm up session when module loads on Android.
      try {
        ensureSession()
      } catch (_: Exception) {
        // React context may not be ready yet.
      }
    }

    AsyncFunction("startTracking") { options: Map<String, Any?>? ->
      val difficulty = DifficultyLevel.from(options?.get("difficulty") as? String)
      val enableFace = options?.get("enableFace") as? Boolean ?: true
      val enableHands = options?.get("enableHands") as? Boolean ?: true
      val enablePose = options?.get("enablePose") as? Boolean ?: true
      val targetFps = (options?.get("targetFps") as? Number)?.toInt() ?: 25

      val tracking = ensureSession()
      tracking.setOptions(difficulty, enableFace, enableHands, enablePose, targetFps)
      tracking.start()
      true
    }

    AsyncFunction("stopTracking") {
      session?.stop()
      true
    }

    AsyncFunction("resetCalibration") {
      session?.resetEngines()
      true
    }

    AsyncFunction("setDifficulty") { level: String ->
      ensureSession().setDifficulty(DifficultyLevel.from(level))
      true
    }

    AsyncFunction("attachPreview") {
      // No-op placeholder — preview binds through VisionTrackingView mount.
      true
    }

    OnDestroy {
      session?.release()
      session = null
      sharedSession = null
    }
  }
}
