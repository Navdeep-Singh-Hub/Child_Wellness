/** Backward-compat barrel — OT L5 Session 10 gauntlet themes */
export type {
  GauntletBackdropId,
  GauntletChallenge,
  GauntletConfig,
  GauntletCopy,
  GauntletThemeBundle,
} from '@/components/game/occupational/level5/session10/gauntletTheme';
export { CHALLENGE_HINTS, CHALLENGE_TTS } from '@/components/game/occupational/level5/session10/gauntletTheme';

export {
  COMET_CHASE_COPY,
  COMET_CHASE_CONFIG,
  COMET_CHASE_THEME,
  PURSUIT_COMBO_CONFIG,
  PURSUIT_COPY,
  PURSUIT_THEME,
} from '@/components/game/occupational/level5/session10/cometChase/cometChaseTheme';
export {
  FOCUS_COPY,
  FOCUS_FORTRESS_COPY,
  FOCUS_FORTRESS_CONFIG,
  FOCUS_FORTRESS_THEME,
  FOCUS_RELAY_CONFIG,
  FOCUS_THEME,
} from '@/components/game/occupational/level5/session10/focusFortress/focusFortressTheme';
export {
  CANYON_RALLY_COPY,
  CANYON_RALLY_CONFIG,
  CANYON_RALLY_THEME,
  DEPTH_COPY,
  DEPTH_MIX_CONFIG,
  DEPTH_THEME,
} from '@/components/game/occupational/level5/session10/canyonRally/canyonRallyTheme';
export {
  REACTION_COPY,
  REACTION_RELAY_CONFIG,
  REACTION_THEME,
  STORM_RELAY_COPY,
  STORM_RELAY_CONFIG,
  STORM_RELAY_THEME,
} from '@/components/game/occupational/level5/session10/stormRelay/stormRelayTheme';
export {
  EAGLE_COPY,
  EAGLE_EYE_CONFIG,
  EAGLE_EYE_QUEST_COPY,
  EAGLE_EYE_QUEST_CONFIG,
  EAGLE_EYE_QUEST_THEME,
  EAGLE_THEME,
} from '@/components/game/occupational/level5/session10/eagleEyeQuest/eagleEyeQuestTheme';

import type { GauntletThemeBundle } from '@/components/game/occupational/level5/session10/gauntletTheme';
import { COMET_CHASE_COPY, COMET_CHASE_THEME } from '@/components/game/occupational/level5/session10/cometChase/cometChaseTheme';
import { FOCUS_FORTRESS_COPY, FOCUS_FORTRESS_THEME } from '@/components/game/occupational/level5/session10/focusFortress/focusFortressTheme';
import { CANYON_RALLY_COPY, CANYON_RALLY_THEME } from '@/components/game/occupational/level5/session10/canyonRally/canyonRallyTheme';
import { STORM_RELAY_COPY, STORM_RELAY_THEME } from '@/components/game/occupational/level5/session10/stormRelay/stormRelayTheme';
import { EAGLE_EYE_QUEST_COPY, EAGLE_EYE_QUEST_THEME } from '@/components/game/occupational/level5/session10/eagleEyeQuest/eagleEyeQuestTheme';

export const GAUNTLET_THEMES: Record<string, GauntletThemeBundle> = {
  'pursuit-combo': { theme: COMET_CHASE_THEME, copy: COMET_CHASE_COPY },
  'focus-relay': { theme: FOCUS_FORTRESS_THEME, copy: FOCUS_FORTRESS_COPY },
  'depth-mix': { theme: CANYON_RALLY_THEME, copy: CANYON_RALLY_COPY },
  'reaction-relay': { theme: STORM_RELAY_THEME, copy: STORM_RELAY_COPY },
  'eagle-eye-quest': { theme: EAGLE_EYE_QUEST_THEME, copy: EAGLE_EYE_QUEST_COPY },
};

export function getGauntletTheme(logType: string): GauntletThemeBundle {
  return GAUNTLET_THEMES[logType] ?? GAUNTLET_THEMES['eagle-eye-quest']!;
}
