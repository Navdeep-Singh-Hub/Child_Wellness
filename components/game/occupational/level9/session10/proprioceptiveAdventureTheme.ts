/** OT Level 9 · Session 10 — Proprioceptive Adventure themes */

export const PROPRIOCEPTIVE_ADVENTURE_SHELL = {
  backText: '#BBF7D0',
  backBorder: 'rgba(187,247,208,0.45)',
  statLabel: '#4ADE80',
  statValue: '#ECFDF5',
  statBorder: 'rgba(34,197,94,0.45)',
  sparkleColor: '#22C55E',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  academyLabel: 'PROPRIOCEPTIVE ADVENTURE',
} as const;

export type JungleWorksiteTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  timber: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  sites: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  previewCue: string;
  haulCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceHaul: string;
  voiceDeliver: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const JUNGLE_WORKSITE_THEME: JungleWorksiteTheme = {
  title: 'Jungle Timber Worksite',
  subtitle: 'Haul each jungle log to the worksite with steady controlled effort — bend your arms and carry with control!',
  emoji: '🌴',
  hero: '🪵',
  accent: '#22C55E',
  accentDeep: '#166534',
  timber: '#84CC16',
  glow: 'rgba(34,197,94,0.55)',
  bgGradient: ['#052E16', '#14532D', '#166534', '#BBF7D0'],
  decor: ['🌴', '🪵', '🌿', '🦎', '🏗️', '✨'],
  sites: ['🌱', '🌿', '🪵', '🌴', '🦎', '🪢', '🏗️', '🏁'],
  hintText: 'Bend your elbows and haul the jungle log at waist height — carry with steady controlled effort in the zone!',
  positionCue: 'Step back so the camera sees your arms, torso and legs clearly.',
  formCue: 'Bend your elbows and hold the log at waist height — steady jungle carry pose!',
  previewCue: 'Log load ahead — check haul weight!',
  haulCue: 'Haul the log!',
  lightCue: 'Haul harder — the log needs more controlled effort!',
  heavyCue: 'Ease off — steady controlled carry in the zone!',
  voiceIntro:
    'Welcome to Jungle Timber Worksite! Haul each jungle log to the worksite with steady controlled effort — bend your arms and carry with control!',
  voiceHaul: 'Haul now — bend your arms and carry the log with steady controlled effort!',
  voiceDeliver: 'Log delivered! Perfect jungle worksite haul!',
  voiceComplete: 'Worksite complete! You hauled every jungle log with amazing effort control!',
  congrats: 'Jungle Worksite Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type SpaceBuilderTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  panel: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  modules: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  stanceCue: string;
  previewCue: string;
  pushCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePush: string;
  voiceLock: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const SPACE_BUILDER_THEME: SpaceBuilderTheme = {
  title: 'Orbital Construction Bay',
  subtitle: 'Push each space module into place with steady bilateral force — extend your arms and install with control!',
  emoji: '🚀',
  hero: '🛸',
  accent: '#38BDF8',
  accentDeep: '#0369A1',
  panel: '#7DD3FC',
  glow: 'rgba(56,189,248,0.55)',
  bgGradient: ['#0F172A', '#1E3A8A', '#0369A1', '#BAE6FD'],
  decor: ['🚀', '🛸', '✨', '🌌', '🔧', '⭐'],
  modules: ['🚀', '🛸', '☀️', '🚪', '🎛️', '📦', '⚙️', '🏁'],
  hintText: 'Extend your arms and push both palms into the module at chest height — hold steady controlled force in the zone!',
  positionCue: 'Step back so the camera sees your arms, chest and shoulders clearly.',
  formCue: 'Straighten your arms and push both palms forward at chest height — like installing a space bulkhead panel!',
  stanceCue: 'Plant your feet and lean into the push — steady orbital builder stance!',
  previewCue: 'Module ahead — check install resistance!',
  pushCue: 'Push the module!',
  lightCue: 'Push harder — the module needs more controlled force!',
  heavyCue: 'Ease off — steady controlled push in the zone!',
  voiceIntro:
    'Welcome to Orbital Construction Bay! Push each space module into place with steady bilateral force — extend your arms and install with control!',
  voicePush: 'Push now — extend your arms and press both palms into the module with steady force!',
  voiceLock: 'Module locked! Perfect space builder control!',
  voiceComplete: 'Station complete! You installed every space module with amazing effort control!',
  congrats: 'Space Builder Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type PirateCargoMissionTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  rope: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  cargo: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  anchorCue: string;
  previewCue: string;
  pullCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePull: string;
  voiceLoad: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const PIRATE_CARGO_MISSION_THEME: PirateCargoMissionTheme = {
  title: 'Smuggler\'s Cargo Deck',
  subtitle: 'Hoist each pirate cargo crate aboard with steady tow-rope pull — anchor your stance and haul with control!',
  emoji: '🏴‍☠️',
  hero: '⚓',
  accent: '#F59E0B',
  accentDeep: '#92400E',
  rope: '#FDE68A',
  glow: 'rgba(245,158,11,0.55)',
  bgGradient: ['#1C1917', '#78350F', '#92400E', '#FDE68A'],
  decor: ['🏴‍☠️', '⚓', '🦜', '🌊', '📦', '💰'],
  cargo: ['📦', '🛢️', '💎', '🍾', '⛓️', '💰', '🗺️', '🏁'],
  hintText: 'Grip the tow ropes at waist height, bend your knees and lean back — pull with steady controlled force in the zone!',
  positionCue: 'Step back so the camera sees your arms, torso and legs clearly.',
  formCue: 'Bend your knees, lean back and pull both ropes at waist height — steady pirate hoist pose!',
  anchorCue: 'Plant your feet wide — anchor your pirate stance before you pull!',
  previewCue: 'Crate on deck — check hoist weight!',
  pullCue: 'Hoist the crate!',
  lightCue: 'Pull harder — the crate needs more controlled tow force!',
  heavyCue: 'Ease off — steady controlled pull in the zone!',
  voiceIntro:
    'Welcome to Smuggler\'s Cargo Deck! Hoist each pirate cargo crate aboard with steady tow-rope pull — anchor your stance and haul with control!',
  voicePull: 'Pull now — grip the ropes, lean back and haul the crate with steady controlled force!',
  voiceLoad: 'Cargo aboard! Perfect pirate hoist control!',
  voiceComplete: 'Voyage loaded! You hoisted every pirate cargo crate with amazing effort control!',
  congrats: 'Pirate Cargo Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type MountainRescueTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  rope: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  rescues: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  stanceCue: string;
  previewCue: string;
  braceCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceBrace: string;
  voiceSave: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const MOUNTAIN_RESCUE_THEME: MountainRescueTheme = {
  title: 'Alpine Rescue Ridge',
  subtitle: 'Brace each rescue rope overhead with steady controlled force — reach up and hold to bring climbers to safety!',
  emoji: '⛰️',
  hero: '🧗',
  accent: '#60A5FA',
  accentDeep: '#1E40AF',
  rope: '#E2E8F0',
  glow: 'rgba(96,165,250,0.55)',
  bgGradient: ['#0F172A', '#334155', '#475569', '#E2E8F0'],
  decor: ['⛰️', '🧗', '❄️', '🦅', '🪢', '☁️'],
  rescues: ['🏕️', '🪨', '🧊', '🦅', '☁️', '⛰️', '🌨️', '🏁'],
  hintText: 'Raise both arms overhead and grip the rescue rope — hold steady controlled brace force in the zone!',
  positionCue: 'Step back so the camera sees your arms, shoulders and torso clearly.',
  formCue: 'Straighten your arms overhead at shoulder width — strong alpine rescue brace pose!',
  stanceCue: 'Plant your feet and stand tall — steady mountain rescue stance!',
  previewCue: 'Climber ahead — check rope resistance!',
  braceCue: 'Brace the rope!',
  lightCue: 'Brace harder — the climber needs more controlled overhead force!',
  heavyCue: 'Ease off — steady controlled brace in the zone!',
  voiceIntro:
    'Welcome to Alpine Rescue Ridge! Brace each rescue rope overhead with steady controlled force — reach up and hold to bring climbers to safety!',
  voiceBrace: 'Brace now — raise both arms overhead and hold the rescue rope with steady force!',
  voiceSave: 'Climber safe! Perfect mountain rescue control!',
  voiceComplete: 'Ridge cleared! You rescued every climber with amazing effort control!',
  congrats: 'Mountain Rescue Star!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type ProprioceptionChampionTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  crown: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  trials: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  stanceCue: string;
  previewCue: string;
  powerCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePower: string;
  voiceCrown: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const PROPRIOCEPTION_CHAMPION_THEME: ProprioceptionChampionTheme = {
  title: 'Champion Power Colosseum',
  subtitle: 'Hold each champion power pose with steady controlled force — raise your arms wide and prove your proprioception mastery!',
  emoji: '🏆',
  hero: '👑',
  accent: '#A855F7',
  accentDeep: '#6D28D9',
  crown: '#FDE68A',
  glow: 'rgba(168,85,247,0.55)',
  bgGradient: ['#1E1B4B', '#581C87', '#7C3AED', '#FDE68A'],
  decor: ['🏆', '👑', '⭐', '💪', '✨', '🎖️'],
  trials: ['🥉', '🥈', '🥇', '💪', '⚡', '🌟', '👑', '🏁'],
  hintText: 'Raise both arms wide at chest height in champion power pose — hold steady controlled force in the zone!',
  positionCue: 'Step back so the camera sees your arms, chest and legs clearly.',
  formCue: 'Raise your arms wide at chest height with bent elbows — strong champion power pose!',
  stanceCue: 'Plant your feet and bend your knees slightly — steady champion power stance!',
  previewCue: 'Trial ahead — check champion resistance!',
  powerCue: 'Hold champion power!',
  lightCue: 'Power harder — the trial needs more controlled champion force!',
  heavyCue: 'Ease off — steady controlled power in the zone!',
  voiceIntro:
    'Welcome to Champion Power Colosseum! Hold each champion power pose with steady controlled force — raise your arms wide and prove your proprioception mastery!',
  voicePower: 'Power now — raise your arms wide and hold the champion pose with steady controlled force!',
  voiceCrown: 'Champion crowned! Perfect proprioception control!',
  voiceComplete: 'Colosseum conquered! You mastered every champion trial with amazing effort control!',
  congrats: 'Proprioception Champion!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};
