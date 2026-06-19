export type GauntletChallenge =
  | 'movingTap'
  | 'flashTap'
  | 'goStop'
  | 'distractTap'
  | 'nearFar'
  | 'speedMatch';

export interface GauntletConfig {
  logType: string;
  skillTags: string[];
  challenges: GauntletChallenge[];
  randomPool?: boolean;
}

export const PURSUIT_COMBO_CONFIG: GauntletConfig = {
  logType: 'pursuit-combo',
  skillTags: ['visual-integration', 'pursuit', 'reflex'],
  challenges: ['movingTap', 'flashTap'],
};

export const FOCUS_RELAY_CONFIG: GauntletConfig = {
  logType: 'focus-relay',
  skillTags: ['visual-integration', 'selective-attention', 'inhibition'],
  challenges: ['distractTap', 'goStop'],
};

export const DEPTH_MIX_CONFIG: GauntletConfig = {
  logType: 'depth-mix',
  skillTags: ['visual-integration', 'depth-perception', 'pursuit'],
  challenges: ['nearFar', 'movingTap'],
};

export const REACTION_RELAY_CONFIG: GauntletConfig = {
  logType: 'reaction-relay',
  skillTags: ['visual-integration', 'reaction-time', 'speed-discrimination'],
  challenges: ['flashTap', 'goStop', 'speedMatch'],
};

export const EAGLE_EYE_CONFIG: GauntletConfig = {
  logType: 'eagle-eye-quest',
  skillTags: ['visual-integration', 'multi-skill', 'visual-motor'],
  challenges: ['movingTap', 'flashTap', 'goStop', 'distractTap', 'nearFar', 'speedMatch'],
  randomPool: true,
};

export const L5_SESSION10_GAUNTLET_CONFIGS: Record<string, GauntletConfig> = {
  'pursuit-combo': PURSUIT_COMBO_CONFIG,
  'focus-relay': FOCUS_RELAY_CONFIG,
  'depth-mix': DEPTH_MIX_CONFIG,
  'reaction-relay': REACTION_RELAY_CONFIG,
  'eagle-eye-quest': EAGLE_EYE_CONFIG,
};
