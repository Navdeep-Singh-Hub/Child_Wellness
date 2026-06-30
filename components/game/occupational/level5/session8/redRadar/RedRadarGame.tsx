import { FOLLOW_RED_CONFIG } from '@/components/game/occupational/level5/session8/multiTrackConfig';
import { RedRadarBackdrop } from '@/components/game/occupational/level5/session8/redRadar/RedRadarVisuals';
import { RED_RADAR_COPY, RED_RADAR_META, RED_RADAR_THEME } from '@/components/game/occupational/level5/session8/redRadar/redRadarTheme';
import { createTrackGame } from '@/components/game/occupational/level5/session8/shared/createTrackGame';

export { RED_RADAR_COPY, RED_RADAR_THEME } from '@/components/game/occupational/level5/session8/redRadar/redRadarTheme';

export default createTrackGame({
  config: FOLLOW_RED_CONFIG,
  theme: RED_RADAR_THEME,
  copy: RED_RADAR_COPY,
  rootBg: RED_RADAR_META.rootBg,
  chips: [...RED_RADAR_META.chips],
  startLabel: RED_RADAR_META.startLabel,
  startColors: RED_RADAR_META.startColors,
  gameTitle: RED_RADAR_META.gameTitle,
  roundLabel: RED_RADAR_META.roundLabel,
  scoreLabel: RED_RADAR_META.scoreLabel,
  phaseLabel: RED_RADAR_META.phaseLabel,
  backdrop: <RedRadarBackdrop />,
});
