package expo.modules.childwellnessvision

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.util.Log
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.framework.image.MPImage
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicLong
import kotlin.math.hypot

typealias EventEmitter = (String, Map<String, Any?>) -> Unit

class VisionTrackingSession(
  private val context: Context,
  private val emit: EventEmitter,
) {
  private val cameraExecutor: ExecutorService = Executors.newSingleThreadExecutor()
  private val running = AtomicBoolean(false)
  private val lastEmitMs = AtomicLong(0L)
  private val headEngine = HeadStabilityEngine()
  private val gameEvents = GameEventEngine()

  private var faceLandmarker: FaceLandmarker? = null
  private var handLandmarker: HandLandmarker? = null
  private var poseLandmarker: PoseLandmarker? = null
  private var cameraProvider: ProcessCameraProvider? = null

  private var latestFace: Map<String, Any?>? = null
  private var latestHands: Map<String, Any?>? = null
  private var latestPose: Map<String, Any?>? = null

  private var enableFace = true
  private var enableHands = true
  private var enablePose = true
  private var targetFps = 25

  fun setOptions(
    difficulty: DifficultyLevel,
    enableFace: Boolean,
    enableHands: Boolean,
    enablePose: Boolean,
    targetFps: Int,
  ) {
    this.enableFace = enableFace
    this.enableHands = enableHands
    this.enablePose = enablePose
    this.targetFps = targetFps.coerceIn(15, 30)
    headEngine.setDifficulty(difficulty)
  }

  fun setDifficulty(level: DifficultyLevel) {
    headEngine.setDifficulty(level)
  }

  fun resetEngines() {
    headEngine.resetCalibration()
    gameEvents.reset()
  }

  fun bindPreview(previewView: PreviewView, lifecycleOwner: LifecycleOwner) {
    val providerFuture = ProcessCameraProvider.getInstance(context)
    providerFuture.addListener({
      try {
        val provider = providerFuture.get()
        cameraProvider = provider
        provider.unbindAll()

        val preview = Preview.Builder().build().also {
          it.surfaceProvider = previewView.surfaceProvider
        }

        val analysis = ImageAnalysis.Builder()
          .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
          .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
          .build()

        analysis.setAnalyzer(cameraExecutor) { imageProxy ->
          if (!running.get()) {
            imageProxy.close()
            return@setAnalyzer
          }
          processFrame(imageProxy)
        }

        provider.bindToLifecycle(
          lifecycleOwner,
          CameraSelector.DEFAULT_FRONT_CAMERA,
          preview,
          analysis,
        )
      } catch (e: Exception) {
        Log.e(TAG, "Camera bind failed", e)
      }
    }, ContextCompat.getMainExecutor(context))
  }

  fun start() {
    if (running.getAndSet(true)) return
    ensureLandmarkers()
    resetEngines()
  }

  fun stop() {
    running.set(false)
    cameraProvider?.unbindAll()
  }

  fun release() {
    stop()
    faceLandmarker?.close()
    handLandmarker?.close()
    poseLandmarker?.close()
    faceLandmarker = null
    handLandmarker = null
    poseLandmarker = null
    cameraExecutor.shutdown()
  }

  private fun ensureLandmarkers() {
    if (faceLandmarker == null && enableFace) {
      faceLandmarker = FaceLandmarker.createFromOptions(
        context,
        FaceLandmarker.FaceLandmarkerOptions.builder()
          .setBaseOptions(
            BaseOptions.builder()
              .setModelAssetPath("models/face_landmarker.task")
              .setDelegate(Delegate.GPU)
              .build(),
          )
          .setRunningMode(RunningMode.LIVE_STREAM)
          .setNumFaces(1)
          .setResultListener { result, _ -> onFaceResult(result) }
          .setErrorListener { e -> Log.e(TAG, "Face error", e) }
          .build(),
      )
    }

    if (handLandmarker == null && enableHands) {
      handLandmarker = HandLandmarker.createFromOptions(
        context,
        HandLandmarker.HandLandmarkerOptions.builder()
          .setBaseOptions(
            BaseOptions.builder()
              .setModelAssetPath("models/hand_landmarker.task")
              .setDelegate(Delegate.GPU)
              .build(),
          )
          .setRunningMode(RunningMode.LIVE_STREAM)
          .setNumHands(2)
          .setResultListener { result, _ -> onHandResult(result) }
          .setErrorListener { e -> Log.e(TAG, "Hand error", e) }
          .build(),
      )
    }

    if (poseLandmarker == null && enablePose) {
      poseLandmarker = PoseLandmarker.createFromOptions(
        context,
        PoseLandmarker.PoseLandmarkerOptions.builder()
          .setBaseOptions(
            BaseOptions.builder()
              .setModelAssetPath("models/pose_landmarker_lite.task")
              .setDelegate(Delegate.GPU)
              .build(),
          )
          .setRunningMode(RunningMode.LIVE_STREAM)
          .setNumPoses(1)
          .setResultListener { result, _ -> onPoseResult(result) }
          .setErrorListener { e -> Log.e(TAG, "Pose error", e) }
          .build(),
      )
    }
  }

  private fun processFrame(imageProxy: ImageProxy) {
    try {
      val bitmap = imageProxy.toBitmap()
      val matrix = Matrix().apply {
        postRotate(imageProxy.imageInfo.rotationDegrees.toFloat())
        postScale(-1f, 1f, bitmap.width / 2f, bitmap.height / 2f)
      }
      val rotated = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
      if (rotated !== bitmap) bitmap.recycle()

      val mpImage = BitmapImageBuilder(rotated).build()
      val ts = System.currentTimeMillis()
      if (enableFace) faceLandmarker?.detectAsync(mpImage, ts)
      if (enableHands) handLandmarker?.detectAsync(mpImage, ts)
      if (enablePose) poseLandmarker?.detectAsync(mpImage, ts)
      rotated.recycle()
      maybeEmit(ts)
    } catch (e: Exception) {
      Log.e(TAG, "Frame processing failed", e)
    } finally {
      imageProxy.close()
    }
  }

  private fun onFaceResult(result: FaceLandmarkerResult) {
    if (result.faceLandmarks().isEmpty()) return
    val lms = result.faceLandmarks()[0]
    val landmarks = lms.map { lm ->
      mapOf("x" to lm.x().toDouble(), "y" to lm.y().toDouble(), "z" to lm.z().toDouble())
    }

    val matrix = result.facialTransformationMatrixes().orElse(emptyList()).getOrNull(0)
    val (yaw, pitch, roll) = FaceMetrics.headAnglesFromMatrix(matrix)

    val nose = landmarks.getOrNull(1) ?: landmarks.firstOrNull()
    val forehead = landmarks.getOrNull(10) ?: nose
    val leftTemple = landmarks.getOrNull(234) ?: landmarks.getOrNull(127)
    val rightTemple = landmarks.getOrNull(454) ?: landmarks.getOrNull(356)

    val mouth = MouthExerciseEngine.mouthMetrics(landmarks)
    val eyeOpen = FaceMetrics.eyeOpenRatio(landmarks)
    val smile = FaceMetrics.smileRatio(landmarks)

    val upper = landmarks.getOrNull(13)
    val lower = landmarks.getOrNull(14)
    val left = landmarks.getOrNull(61)
    val right = landmarks.getOrNull(291)
    val mouthWidth = if (left != null && right != null) {
      kotlin.math.abs((right["x"] ?: 0.0) - (left["x"] ?: 0.0))
    } else 0.0
    val mouthHeight = if (upper != null && lower != null) {
      hypot((upper["x"] ?: 0.0) - (lower["x"] ?: 0.0), (upper["y"] ?: 0.0) - (lower["y"] ?: 0.0))
    } else 0.0

    val stability = headEngine.update(
      System.currentTimeMillis(),
      yaw,
      pitch,
      roll,
      nose?.get("x") ?: 0.5,
      nose?.get("y") ?: 0.5,
    )

    latestFace = mapOf(
      "headYaw" to yaw,
      "headPitch" to pitch,
      "headRoll" to roll,
      "mouthWidth" to mouthWidth,
      "mouthHeight" to mouthHeight,
      "mouthOpen" to (mouth["mouthOpenScore"] ?: 0.0),
      "mouthRoundness" to (mouth["mouthRoundness"] ?: 0.0),
      "mouthWidthRatio" to (mouth["mouthWidthRatio"] ?: 0.0),
      "smileRatio" to smile,
      "eyeOpenRatio" to eyeOpen,
      "landmarks" to landmarks,
      "nose" to nose,
      "forehead" to forehead,
      "leftTemple" to leftTemple,
      "rightTemple" to rightTemple,
      "stabilityScore" to stability.stabilityScore,
      "movementSpeed" to stability.movementSpeed,
      "rotationAmount" to stability.rotationAmount,
      "stableMs" to stability.stableMs.toDouble(),
      "mouthOpenScore" to (mouth["mouthOpenScore"] ?: 0.0),
      "oooScore" to (mouth["oooScore"] ?: 0.0),
      "eeeScore" to (mouth["eeeScore"] ?: 0.0),
      "aaaScore" to (mouth["aaaScore"] ?: 0.0),
      "uuuScore" to (mouth["uuuScore"] ?: 0.0),
    )

    val leftHand = (latestHands?.get("leftHand") as? List<*>)?.mapNotNull { it as? Map<*, *> }
    val rightHand = (latestHands?.get("rightHand") as? List<*>)?.mapNotNull { it as? Map<*, *> }
    val leftLm = leftHand?.map { mapOf("x" to (it["x"] as? Number)?.toDouble(), "y" to (it["y"] as? Number)?.toDouble()) }
    val rightLm = rightHand?.map { mapOf("x" to (it["x"] as? Number)?.toDouble(), "y" to (it["y"] as? Number)?.toDouble()) }

    val events = gameEvents.evaluate(
      System.currentTimeMillis(),
      stability.stableMs,
      mouth["mouthOpenScore"] ?: 0.0,
      smile,
      HandMetrics.pinchDistance(leftLm?.map { mapOf("x" to (it["x"] ?: 0.0), "y" to (it["y"] ?: 0.0)) } ?: emptyList())
        ?: HandMetrics.pinchDistance(rightLm?.map { mapOf("x" to (it["x"] ?: 0.0), "y" to (it["y"] ?: 0.0)) } ?: emptyList()),
      HandMetrics.isRaised(leftLm?.map { mapOf("x" to (it["x"] ?: 0.0), "y" to (it["y"] ?: 0.0)) }, nose?.get("y") ?: 0.5),
      HandMetrics.isRaised(rightLm?.map { mapOf("x" to (it["x"] ?: 0.0), "y" to (it["y"] ?: 0.0)) }, nose?.get("y") ?: 0.5),
      stability.crownFall,
    )
    for (event in events) {
      emit("onGameEvent", mapOf("type" to event.value, "timestamp" to System.currentTimeMillis()))
    }
  }

  private fun onHandResult(result: HandLandmarkerResult) {
    var left: List<Map<String, Double>>? = null
    var right: List<Map<String, Double>>? = null
    for (i in result.landmarks().indices) {
      val handedness = result.handedness()[i].firstOrNull()?.categoryName()?.lowercase() ?: continue
      val pts = result.landmarks()[i].map { lm ->
        mapOf("x" to lm.x().toDouble(), "y" to lm.y().toDouble(), "z" to lm.z().toDouble())
      }
      if (handedness.contains("left")) left = pts else right = pts
    }
    latestHands = mapOf(
      "leftHand" to (left ?: emptyList<Map<String, Double>>()),
      "rightHand" to (right ?: emptyList<Map<String, Double>>()),
      "leftPinch" to (HandMetrics.pinchDistance(left) ?: -1.0),
      "rightPinch" to (HandMetrics.pinchDistance(right) ?: -1.0),
      "leftOpenness" to HandMetrics.openness(left),
      "rightOpenness" to HandMetrics.openness(right),
    )
  }

  private fun onPoseResult(result: PoseLandmarkerResult) {
    if (result.landmarks().isEmpty()) return
    val lms = result.landmarks()[0]
    fun pt(i: Int): Map<String, Double>? {
      if (i >= lms.size) return null
      val lm = lms[i]
      return mapOf("x" to lm.x().toDouble(), "y" to lm.y().toDouble(), "z" to lm.z().toDouble())
    }
    latestPose = mapOf(
      "shoulders" to mapOf("left" to pt(11), "right" to pt(12)),
      "elbows" to mapOf("left" to pt(13), "right" to pt(14)),
      "wrists" to mapOf("left" to pt(15), "right" to pt(16)),
      "hips" to mapOf("left" to pt(23), "right" to pt(24)),
      "knees" to mapOf("left" to pt(25), "right" to pt(26)),
      "ankles" to mapOf("left" to pt(27), "right" to pt(28)),
    )
  }

  private fun maybeEmit(now: Long) {
    val interval = 1000L / targetFps
    val prev = lastEmitMs.get()
    if (now - prev < interval) return
    if (!lastEmitMs.compareAndSet(prev, now)) return

    latestFace?.let { emit("onFaceData", it) }
    latestHands?.let { emit("onHandData", it) }
    latestPose?.let { emit("onPoseData", it) }
  }

  companion object {
    private const val TAG = "ChildWellnessVision"
  }
}

private fun ImageProxy.toBitmap(): Bitmap {
  val plane = planes[0]
  val buffer = plane.buffer
  val pixelStride = plane.pixelStride
  val rowStride = plane.rowStride
  val rowPadding = rowStride - pixelStride * width
  val bmp = Bitmap.createBitmap(width + rowPadding / pixelStride, height, Bitmap.Config.ARGB_8888)
  bmp.copyPixelsFromBuffer(buffer)
  return if (rowPadding == 0) bmp else Bitmap.createBitmap(bmp, 0, 0, width, height)
}
