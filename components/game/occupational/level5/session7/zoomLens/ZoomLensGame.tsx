import { ZOOM_TOUCH } from '@/components/game/occupational/level5/session7/depthDistanceConfig';
import { ZoomLensBackdrop } from '@/components/game/occupational/level5/session7/zoomLens/ZoomLensVisuals';
import { ZOOM_LENS_COPY, ZOOM_LENS_META, ZOOM_LENS_THEME } from '@/components/game/occupational/level5/session7/zoomLens/zoomLensTheme';
import { createDepthGame } from '@/components/game/occupational/level5/session7/shared/createDepthGame';

export default createDepthGame({
  config: ZOOM_TOUCH,
  theme: ZOOM_LENS_THEME,
  copy: ZOOM_LENS_COPY,
  ...ZOOM_LENS_META,
  chips: [...ZOOM_LENS_META.chips],
  backdrop: <ZoomLensBackdrop />,
});
