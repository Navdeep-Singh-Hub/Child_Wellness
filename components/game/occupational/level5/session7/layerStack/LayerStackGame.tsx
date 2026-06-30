import { THREE_LAYER_TAP } from '@/components/game/occupational/level5/session7/depthDistanceConfig';
import { LayerStackBackdrop } from '@/components/game/occupational/level5/session7/layerStack/LayerStackVisuals';
import { LAYER_STACK_COPY, LAYER_STACK_META, LAYER_STACK_THEME } from '@/components/game/occupational/level5/session7/layerStack/layerStackTheme';
import { createDepthGame } from '@/components/game/occupational/level5/session7/shared/createDepthGame';

export default createDepthGame({
  config: THREE_LAYER_TAP,
  theme: LAYER_STACK_THEME,
  copy: LAYER_STACK_COPY,
  ...LAYER_STACK_META,
  chips: [...LAYER_STACK_META.chips],
  backdrop: <LayerStackBackdrop />,
});
