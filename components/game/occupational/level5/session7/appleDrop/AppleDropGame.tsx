import { FALLING_OBJECTS } from '@/components/game/occupational/level5/session7/depthDistanceConfig';
import { AppleDropBackdrop } from '@/components/game/occupational/level5/session7/appleDrop/AppleDropVisuals';
import { APPLE_DROP_COPY, APPLE_DROP_META, APPLE_DROP_THEME } from '@/components/game/occupational/level5/session7/appleDrop/appleDropTheme';
import { createDepthGame } from '@/components/game/occupational/level5/session7/shared/createDepthGame';

export default createDepthGame({
  config: FALLING_OBJECTS,
  theme: APPLE_DROP_THEME,
  copy: APPLE_DROP_COPY,
  ...APPLE_DROP_META,
  chips: [...APPLE_DROP_META.chips],
  backdrop: <AppleDropBackdrop />,
});
