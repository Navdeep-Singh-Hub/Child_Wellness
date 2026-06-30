import { NEAR_VS_FAR } from '@/components/game/occupational/level5/session7/depthDistanceConfig';
import { DistanceDashBackdrop } from '@/components/game/occupational/level5/session7/distanceDash/DistanceDashVisuals';
import { DISTANCE_DASH_COPY, DISTANCE_DASH_META, DISTANCE_DASH_THEME } from '@/components/game/occupational/level5/session7/distanceDash/distanceDashTheme';
import { createDepthGame } from '@/components/game/occupational/level5/session7/shared/createDepthGame';

export default createDepthGame({
  config: NEAR_VS_FAR,
  theme: DISTANCE_DASH_THEME,
  copy: DISTANCE_DASH_COPY,
  ...DISTANCE_DASH_META,
  chips: [...DISTANCE_DASH_META.chips],
  backdrop: <DistanceDashBackdrop />,
});
