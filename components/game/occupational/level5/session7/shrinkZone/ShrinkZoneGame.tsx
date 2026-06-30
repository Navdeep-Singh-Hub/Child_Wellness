import { DEPTH_SHRINKING_TARGET } from '@/components/game/occupational/level5/session7/depthDistanceConfig';
import { ShrinkZoneBackdrop } from '@/components/game/occupational/level5/session7/shrinkZone/ShrinkZoneVisuals';
import { SHRINK_ZONE_COPY, SHRINK_ZONE_META, SHRINK_ZONE_THEME } from '@/components/game/occupational/level5/session7/shrinkZone/shrinkZoneTheme';
import { createDepthGame } from '@/components/game/occupational/level5/session7/shared/createDepthGame';

export default createDepthGame({
  config: DEPTH_SHRINKING_TARGET,
  theme: SHRINK_ZONE_THEME,
  copy: SHRINK_ZONE_COPY,
  ...SHRINK_ZONE_META,
  chips: [...SHRINK_ZONE_META.chips],
  backdrop: <ShrinkZoneBackdrop />,
});
