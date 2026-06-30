import { SPEED_OBJECTS_CONFIG } from '@/components/game/occupational/level5/session8/multiTrackConfig';
import { SpeedStormBackdrop } from '@/components/game/occupational/level5/session8/speedStorm/SpeedStormVisuals';
import { SPEED_STORM_COPY, SPEED_STORM_META, SPEED_STORM_THEME } from '@/components/game/occupational/level5/session8/speedStorm/speedStormTheme';
import { createTrackGame } from '@/components/game/occupational/level5/session8/shared/createTrackGame';

export { SPEED_STORM_COPY, SPEED_STORM_THEME } from '@/components/game/occupational/level5/session8/speedStorm/speedStormTheme';

export default createTrackGame({
  config: SPEED_OBJECTS_CONFIG,
  theme: SPEED_STORM_THEME,
  copy: SPEED_STORM_COPY,
  rootBg: SPEED_STORM_META.rootBg,
  chips: [...SPEED_STORM_META.chips],
  startLabel: SPEED_STORM_META.startLabel,
  startColors: SPEED_STORM_META.startColors,
  gameTitle: SPEED_STORM_META.gameTitle,
  roundLabel: SPEED_STORM_META.roundLabel,
  scoreLabel: SPEED_STORM_META.scoreLabel,
  phaseLabel: SPEED_STORM_META.phaseLabel,
  backdrop: <SpeedStormBackdrop />,
});
