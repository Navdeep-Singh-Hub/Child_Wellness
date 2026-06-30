import { TWO_BALLS_CONFIG } from '@/components/game/occupational/level5/session8/multiTrackConfig';
import { BallDuelBackdrop } from '@/components/game/occupational/level5/session8/ballDuel/BallDuelVisuals';
import { BALL_DUEL_COPY, BALL_DUEL_META, BALL_DUEL_THEME } from '@/components/game/occupational/level5/session8/ballDuel/ballDuelTheme';
import { createTrackGame } from '@/components/game/occupational/level5/session8/shared/createTrackGame';

export { BALL_DUEL_COPY, BALL_DUEL_THEME } from '@/components/game/occupational/level5/session8/ballDuel/ballDuelTheme';

export default createTrackGame({
  config: TWO_BALLS_CONFIG,
  theme: BALL_DUEL_THEME,
  copy: BALL_DUEL_COPY,
  rootBg: BALL_DUEL_META.rootBg,
  chips: [...BALL_DUEL_META.chips],
  startLabel: BALL_DUEL_META.startLabel,
  startColors: BALL_DUEL_META.startColors,
  gameTitle: BALL_DUEL_META.gameTitle,
  roundLabel: BALL_DUEL_META.roundLabel,
  scoreLabel: BALL_DUEL_META.scoreLabel,
  phaseLabel: BALL_DUEL_META.phaseLabel,
  backdrop: <BallDuelBackdrop />,
});
