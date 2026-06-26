package expo.modules.childwellnessvision

import android.content.Context
import androidx.camera.view.PreviewView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

class ChildWellnessVisionView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  val previewView = PreviewView(context).also {
    it.scaleType = PreviewView.ScaleType.FILL_CENTER
    addView(it, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  private var session: VisionTrackingSession? = null

  fun attachSession(session: VisionTrackingSession) {
    this.session = session
    val activity = appContext.activityProvider?.currentActivity
    val owner = activity as? androidx.lifecycle.LifecycleOwner
    if (owner != null) {
      session.bindPreview(previewView, owner)
    } else {
      post {
        val retryOwner = appContext.activityProvider?.currentActivity as? androidx.lifecycle.LifecycleOwner
        if (retryOwner != null) session.bindPreview(previewView, retryOwner)
      }
    }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    ChildWellnessVisionModule.sharedSession?.let { attachSession(it) }
  }

  fun setActive(active: Boolean) {
    if (active) session?.start() else session?.stop()
  }
}
