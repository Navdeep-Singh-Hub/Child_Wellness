/** OT Level 9 · Session 6 — Body Awareness themes */

export const BODY_AWARENESS_SHELL = {
  backText: '#99F6E4',
  backBorder: 'rgba(153,246,228,0.45)',
  statLabel: '#5EEAD4',
  statValue: '#F0FDFA',
  statBorder: 'rgba(94,234,212,0.45)',
  sparkleColor: '#F9A8D4',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  academyLabel: 'BODY AWARENESS',
} as const;

export type BuildTheBodyTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  segment: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  parts: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  trunkCue: string;
  armsCue: string;
  legsCue: string;
  previewCue: string;
  buildCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceBuild: string;
  voiceSnap: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const BUILD_THE_BODY_THEME: BuildTheBodyTheme = {
  title: 'Body Blueprint Workshop',
  subtitle: 'Build your body piece by piece — match each segment pose and hold steady placement control!',
  emoji: '🧩',
  hero: '🏗️',
  accent: '#2DD4BF',
  accentDeep: '#0F766E',
  segment: '#F9A8D4',
  glow: 'rgba(45,212,191,0.55)',
  bgGradient: ['#042F2E', '#0F766E', '#14B8A6', '#CCFBF1'],
  decor: ['🧩', '🏗️', '🦴', '💪', '🦵', '✨'],
  parts: ['🏗️', '🙂', '💪', '🛡️', '🦵', '🙌', '👣', '🌟'],
  hintText: 'Watch the blueprint, then match your body segment pose — hold steady controlled placement!',
  positionCue: 'Step back so the camera sees your full body — head, arms, legs and torso clearly.',
  formCue: 'Adjust your pose to match the highlighted body segment on the blueprint!',
  trunkCue: 'Stand tall and steady — lock your trunk and head alignment!',
  armsCue: 'Match your arm position — raise, bend and place your arms like the blueprint!',
  legsCue: 'Match your leg position — widen stance, lift or bend your knees!',
  previewCue: 'Study the body blueprint!',
  buildCue: 'Build the segment!',
  lightCue: 'Hold firmer — place the segment with more controlled effort!',
  heavyCue: 'Ease off — hold steady placement in the zone!',
  voiceIntro:
    'Welcome to Body Blueprint Workshop! Build your body piece by piece — match each segment pose with steady, controlled placement!',
  voiceBuild: 'Build now — match the highlighted body segment!',
  voiceSnap: 'Segment snapped! Perfect body placement!',
  voiceComplete: 'Workshop complete! You built every body segment with amazing awareness and control!',
  congrats: 'Body Builder!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type TouchThePartTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glowPart: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  targets: string[];
  hintText: string;
  positionCue: string;
  reachCue: string;
  wrongHandCue: string;
  previewCue: string;
  touchCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceTouch: string;
  voiceGlow: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const TOUCH_THE_PART_THEME: TouchThePartTheme = {
  title: 'Sensory Body Map Lab',
  subtitle: 'Touch each glowing body part with the correct hand — hold steady controlled touch in the zone!',
  emoji: '👆',
  hero: '🗺️',
  accent: '#A78BFA',
  accentDeep: '#6D28D9',
  glowPart: '#F9A8D4',
  glow: 'rgba(167,139,250,0.55)',
  bgGradient: ['#1E1B4B', '#4C1D95', '#7C3AED', '#EDE9FE'],
  decor: ['👆', '🗺️', '✨', '🫳', '💫', '🔮'],
  targets: ['🙂', '💪', '💪', '🫁', '🦵', '🦵', '🦴', '🌟'],
  hintText: 'Reach and touch the glowing body part with the correct hand — hold steady controlled touch!',
  positionCue: 'Step back so the camera sees your full body — head, arms, hands and legs clearly.',
  reachCue: 'Reach toward the highlighted body part — bring your hand close and touch with control!',
  wrongHandCue: 'Use the other hand — cross your body to touch the highlighted part!',
  previewCue: 'Find the glowing body part!',
  touchCue: 'Touch the part!',
  lightCue: 'Press a little firmer — hold controlled touch in the zone!',
  heavyCue: 'Ease off — gentle steady touch in the zone!',
  voiceIntro:
    'Welcome to Sensory Body Map Lab! Touch each glowing body part with the correct hand and hold steady, controlled touch!',
  voiceTouch: 'Touch now — reach and place your hand on the glowing part!',
  voiceGlow: 'Part glowing! Perfect touch control!',
  voiceComplete: 'Lab complete! You touched every body part with amazing awareness and control!',
  congrats: 'Body Touch Explorer!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type BodyMapTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  zone: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  zones: string[];
  hintText: string;
  positionCue: string;
  zoneCue: string;
  previewCue: string;
  scanCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceScan: string;
  voiceIlluminate: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const BODY_MAP_THEME: BodyMapTheme = {
  title: 'Neural Body Atlas',
  subtitle: 'Scan each body map zone top to bottom — hold regional awareness with steady mapping control!',
  emoji: '🗺️',
  hero: '🧠',
  accent: '#38BDF8',
  accentDeep: '#0369A1',
  zone: '#7DD3FC',
  glow: 'rgba(56,189,248,0.55)',
  bgGradient: ['#0C1929', '#0C4A6E', '#0284C7', '#E0F2FE'],
  decor: ['🗺️', '🧠', '✨', '🔵', '💠', '🌐'],
  zones: ['🙂', '💪', '🦾', '🦾', '🫁', '🦵', '🦵', '🌟'],
  hintText: 'Activate the glowing map zone — isolate that body region and hold steady mapping control!',
  positionCue: 'Step back so the camera sees your full body — head, arms, torso and legs clearly.',
  zoneCue: 'Focus on the highlighted zone — adjust your regional body position to activate the map!',
  previewCue: 'Preview the map zone!',
  scanCue: 'Scan the zone!',
  lightCue: 'Hold firmer — activate the zone with more mapping effort!',
  heavyCue: 'Ease off — steady regional awareness in the zone!',
  voiceIntro:
    'Welcome to Neural Body Atlas! Scan each body map zone from head to feet — hold regional awareness with steady, controlled mapping effort!',
  voiceScan: 'Scan now — activate the highlighted body map zone!',
  voiceIlluminate: 'Zone illuminated! Perfect body map control!',
  voiceComplete: 'Atlas complete! You mapped every body zone with amazing awareness and control!',
  congrats: 'Body Map Navigator!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type HeroPoseTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  cape: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  poses: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  armsCue: string;
  legsCue: string;
  previewCue: string;
  poseCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voicePose: string;
  voiceUnleash: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const HERO_POSE_THEME: HeroPoseTheme = {
  title: 'Champion Hero Colosseum',
  subtitle: 'Strike each heroic pose and hold steady power — unleash your champion with controlled effort!',
  emoji: '🦸',
  hero: '⚡',
  accent: '#FBBF24',
  accentDeep: '#B45309',
  cape: '#F97316',
  glow: 'rgba(251,191,36,0.55)',
  bgGradient: ['#1C1917', '#78350F', '#B45309', '#FEF3C7'],
  decor: ['🦸', '⚡', '🏆', '⭐', '💥', '✨'],
  poses: ['🛡️', '💪', '🙌', '🦸', '⬇️', '⚡', '🥷', '🌟'],
  hintText: 'Copy the hero pose and channel steady power — hold controlled heroic effort in the zone!',
  positionCue: 'Step back so the camera sees your full body — head, arms, legs and torso clearly.',
  formCue: 'Match the hero pose — adjust your arms and legs like the champion demo!',
  armsCue: 'Fix your arm position — raise, bend or extend like the hero pose!',
  legsCue: 'Fix your leg stance — widen, lift or bend your knees like the hero pose!',
  previewCue: 'Study the hero pose!',
  poseCue: 'Strike the pose!',
  lightCue: 'Channel more power — hold stronger heroic effort in the zone!',
  heavyCue: 'Ease off — steady controlled hero power in the zone!',
  voiceIntro:
    'Welcome to Champion Hero Colosseum! Strike each heroic pose and hold steady, controlled power to unleash your inner champion!',
  voicePose: 'Strike now — copy the hero pose and channel your power!',
  voiceUnleash: 'Power unleashed! Perfect hero control!',
  voiceComplete: 'Colosseum complete! You mastered every hero pose with amazing awareness and control!',
  congrats: 'Champion Hero!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export type RobotBuilderTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  servo: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  modules: string[];
  hintText: string;
  positionCue: string;
  formCue: string;
  armsCue: string;
  legsCue: string;
  previewCue: string;
  buildCue: string;
  lightCue: string;
  heavyCue: string;
  voiceIntro: string;
  voiceBuild: string;
  voiceActivate: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const ROBOT_BUILDER_THEME: RobotBuilderTheme = {
  title: 'Mech Assembly Factory',
  subtitle: 'Install each robot module with stiff mechanical poses — hold steady assembly torque in the zone!',
  emoji: '🤖',
  hero: '⚙️',
  accent: '#22D3EE',
  accentDeep: '#0E7490',
  servo: '#94A3B8',
  glow: 'rgba(34,211,238,0.55)',
  bgGradient: ['#0F172A', '#164E63', '#0891B2', '#CFFAFE'],
  decor: ['🤖', '⚙️', '🔩', '🔧', '💠', '✨'],
  modules: ['⚡', '🤖', '🦾', '🦾', '🛡️', '🦿', '🦿', '🌟'],
  hintText: 'Lock into the mechanical calibration pose — hold steady controlled assembly torque in the zone!',
  positionCue: 'Step back so the camera sees your full body — head, arms, legs and torso clearly.',
  formCue: 'Match the robot module pose — stiff angular arms and legs like the blueprint!',
  armsCue: 'Fix servo arms — lock elbows and shoulders to the mechanical angle!',
  legsCue: 'Fix leg actuators — stiffen knees and stance like the robot blueprint!',
  previewCue: 'Preview the module!',
  buildCue: 'Install the module!',
  lightCue: 'Apply more torque — hold firmer assembly effort in the zone!',
  heavyCue: 'Ease off — steady controlled assembly torque in the zone!',
  voiceIntro:
    'Welcome to Mech Assembly Factory! Install each robot module with stiff mechanical poses and hold steady, controlled assembly torque!',
  voiceBuild: 'Install now — lock into the mechanical calibration pose!',
  voiceActivate: 'Module activated! Perfect assembly control!',
  voiceComplete: 'Factory complete! You built the full robot with amazing awareness and control!',
  congrats: 'Robot Builder!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};
