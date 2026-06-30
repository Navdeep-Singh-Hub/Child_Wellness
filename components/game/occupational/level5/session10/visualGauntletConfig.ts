/** Backward-compat barrel — OT L5 Session 10 gauntlet configs */
export type { GauntletChallenge, GauntletConfig } from '@/components/game/occupational/level5/session10/gauntletTheme';

export {
  COMET_CHASE_CONFIG,
  PURSUIT_COMBO_CONFIG,
} from '@/components/game/occupational/level5/session10/cometChase/cometChaseTheme';
export {
  FOCUS_FORTRESS_CONFIG,
  FOCUS_RELAY_CONFIG,
} from '@/components/game/occupational/level5/session10/focusFortress/focusFortressTheme';
export {
  CANYON_RALLY_CONFIG,
  DEPTH_MIX_CONFIG,
} from '@/components/game/occupational/level5/session10/canyonRally/canyonRallyTheme';
export {
  REACTION_RELAY_CONFIG,
  STORM_RELAY_CONFIG,
} from '@/components/game/occupational/level5/session10/stormRelay/stormRelayTheme';
export {
  EAGLE_EYE_CONFIG,
  EAGLE_EYE_QUEST_CONFIG,
} from '@/components/game/occupational/level5/session10/eagleEyeQuest/eagleEyeQuestTheme';

import type { GauntletConfig } from '@/components/game/occupational/level5/session10/gauntletTheme';
import { COMET_CHASE_CONFIG } from '@/components/game/occupational/level5/session10/cometChase/cometChaseTheme';
import { FOCUS_FORTRESS_CONFIG } from '@/components/game/occupational/level5/session10/focusFortress/focusFortressTheme';
import { CANYON_RALLY_CONFIG } from '@/components/game/occupational/level5/session10/canyonRally/canyonRallyTheme';
import { STORM_RELAY_CONFIG } from '@/components/game/occupational/level5/session10/stormRelay/stormRelayTheme';
import { EAGLE_EYE_QUEST_CONFIG } from '@/components/game/occupational/level5/session10/eagleEyeQuest/eagleEyeQuestTheme';

export const L5_SESSION10_GAUNTLET_CONFIGS: Record<string, GauntletConfig> = {
  'pursuit-combo': COMET_CHASE_CONFIG,
  'focus-relay': FOCUS_FORTRESS_CONFIG,
  'depth-mix': CANYON_RALLY_CONFIG,
  'reaction-relay': STORM_RELAY_CONFIG,
  'eagle-eye-quest': EAGLE_EYE_QUEST_CONFIG,
};
