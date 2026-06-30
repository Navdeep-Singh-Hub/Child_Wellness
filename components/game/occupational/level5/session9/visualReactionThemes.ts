/** Backward-compatible re-exports — OT L5 Session 9 reaction themes */
import { LIGHTNING_FLASH_COPY, LIGHTNING_FLASH_THEME } from '@/components/game/occupational/level5/session9/lightningFlash/lightningFlashTheme';
import { POP_ALERT_COPY, POP_ALERT_THEME } from '@/components/game/occupational/level5/session9/popAlert/popAlertTheme';
import type { ReactionCopy, ReactionThemeTokens } from '@/components/game/occupational/level5/session9/reactionTheme';
import { SIGNAL_CONTROL_COPY, SIGNAL_CONTROL_THEME } from '@/components/game/occupational/level5/session9/signalControl/signalControlTheme';
import { SPLIT_SECOND_COPY, SPLIT_SECOND_THEME } from '@/components/game/occupational/level5/session9/splitSecond/splitSecondTheme';
import { SYNESTHESIA_LAB_COPY, SYNESTHESIA_LAB_THEME } from '@/components/game/occupational/level5/session9/synesthesiaLab/synesthesiaLabTheme';

export type { ReactionCopy, ReactionThemeTokens } from '@/components/game/occupational/level5/session9/reactionTheme';

export { LIGHTNING_FLASH_COPY, LIGHTNING_FLASH_THEME } from '@/components/game/occupational/level5/session9/lightningFlash/lightningFlashTheme';
export { SIGNAL_CONTROL_COPY, SIGNAL_CONTROL_THEME } from '@/components/game/occupational/level5/session9/signalControl/signalControlTheme';
export { POP_ALERT_COPY, POP_ALERT_THEME } from '@/components/game/occupational/level5/session9/popAlert/popAlertTheme';
export { SYNESTHESIA_LAB_COPY, SYNESTHESIA_LAB_THEME } from '@/components/game/occupational/level5/session9/synesthesiaLab/synesthesiaLabTheme';
export { SPLIT_SECOND_COPY, SPLIT_SECOND_THEME } from '@/components/game/occupational/level5/session9/splitSecond/splitSecondTheme';

// Legacy aliases
export { LIGHTNING_FLASH_COPY as FLASH_TAP_COPY, LIGHTNING_FLASH_THEME as FLASH_TAP_THEME } from '@/components/game/occupational/level5/session9/lightningFlash/lightningFlashTheme';
export { SIGNAL_CONTROL_COPY as GO_STOP_COPY, SIGNAL_CONTROL_THEME as GO_STOP_THEME } from '@/components/game/occupational/level5/session9/signalControl/signalControlTheme';
export { POP_ALERT_COPY as SURPRISE_POP_COPY, POP_ALERT_THEME as SURPRISE_POP_THEME } from '@/components/game/occupational/level5/session9/popAlert/popAlertTheme';
export { SYNESTHESIA_LAB_COPY as SOUND_LIGHT_COPY, SYNESTHESIA_LAB_THEME as SOUND_LIGHT_THEME } from '@/components/game/occupational/level5/session9/synesthesiaLab/synesthesiaLabTheme';
export { SPLIT_SECOND_COPY as QUICK_CHOICE_COPY, SPLIT_SECOND_THEME as QUICK_CHOICE_THEME } from '@/components/game/occupational/level5/session9/splitSecond/splitSecondTheme';

export type ReactionThemeBundle = { theme: ReactionThemeTokens; copy: ReactionCopy };

export const REACTION_THEMES: Record<string, ReactionThemeBundle> = {
  'flash-tap': { theme: LIGHTNING_FLASH_THEME, copy: LIGHTNING_FLASH_COPY },
  'go-stop': { theme: SIGNAL_CONTROL_THEME, copy: SIGNAL_CONTROL_COPY },
  'surprise-pop': { theme: POP_ALERT_THEME, copy: POP_ALERT_COPY },
  'sound-light': { theme: SYNESTHESIA_LAB_THEME, copy: SYNESTHESIA_LAB_COPY },
  'quick-choice': { theme: SPLIT_SECOND_THEME, copy: SPLIT_SECOND_COPY },
};

export function getReactionTheme(logType: string): ReactionThemeBundle {
  return REACTION_THEMES[logType] ?? REACTION_THEMES['flash-tap']!;
}
