/** OT Level 9 · Session 3 — Joint Position Awareness themes */

export const ROBOT_SHELL = {
  backText: '#A5F3FC',
  backBorder: 'rgba(165,243,252,0.45)',
  statLabel: '#67E8F9',
  statValue: '#ECFEFF',
  statBorder: 'rgba(103,232,249,0.45)',
  sparkleColor: '#22D3EE',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  academyLabel: 'CIRCUIT FACTORY',
} as const;

export type RobotArmsTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  joint: string;
  panel: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  robots: string[];
  hintText: string;
  positionCue: string;
  previewCue: string;
  matchCue: string;
  raiseCue: string;
  elbowCue: string;
  voiceIntro: string;
  voiceMatch: string;
  voiceCalibrate: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const ROBOT_ARMS_THEME: RobotArmsTheme = {
  title: 'Neon Circuit Factory',
  subtitle: 'Copy each robot arm pose — match shoulder and elbow joints precisely!',
  emoji: '🤖',
  hero: '⚙️',
  accent: '#22D3EE',
  accentDeep: '#0891B2',
  joint: '#67E8F9',
  panel: '#164E63',
  glow: 'rgba(34,211,238,0.5)',
  bgGradient: ['#0C1929', '#164E63', '#0891B2', '#A5F3FC'],
  decor: ['🤖', '⚙️', '🔩', '✨', '💠', '🔧'],
  robots: ['🤖', '🦾', '🤖', '⚙️', '🤖', '🦾', '🤖', '✨'],
  hintText: 'Watch the robot demo, then match your arm joints to the target angles!',
  positionCue: 'Step back so the camera sees your shoulders, elbows, wrists and upper body.',
  previewCue: 'Study the robot arm joints!',
  matchCue: 'Match the robot arms!',
  raiseCue: 'Adjust shoulder height — raise or lower your arm!',
  elbowCue: 'Bend or straighten your elbow to match!',
  voiceIntro:
    'Welcome to Neon Circuit Factory! Copy each robot arm pose and match your shoulder and elbow joints precisely!',
  voiceMatch: 'Match now — copy the robot arm joints!',
  voiceCalibrate: 'Joints locked! Robot calibration complete!',
  voiceComplete: 'Factory complete! You matched every robot arm pose with amazing joint control!',
  congrats: 'Robot Technician!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export const LEGS_SHELL = {
  backText: '#D9F99D',
  backBorder: 'rgba(217,249,157,0.45)',
  statLabel: '#A3E635',
  statValue: '#F7FEE7',
  statBorder: 'rgba(163,230,53,0.45)',
  sparkleColor: '#84CC16',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  academyLabel: 'MECH WALKER DOCK',
} as const;

export type MatchLegsTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  joint: string;
  panel: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  walkers: string[];
  hintText: string;
  positionCue: string;
  previewCue: string;
  matchCue: string;
  liftCue: string;
  kneeCue: string;
  voiceIntro: string;
  voiceMatch: string;
  voiceLock: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const MATCH_LEGS_THEME: MatchLegsTheme = {
  title: 'Mech Walker Dock',
  subtitle: 'Match each mech leg pose — copy knee lift and knee bend on both legs!',
  emoji: '🦿',
  hero: '🦾',
  accent: '#A3E635',
  accentDeep: '#65A30D',
  joint: '#D9F99D',
  panel: '#365314',
  glow: 'rgba(163,230,53,0.5)',
  bgGradient: ['#1A2E05', '#365314', '#65A30D', '#D9F99D'],
  decor: ['🦿', '🦾', '⚡', '✨', '🔋', '🛤️'],
  walkers: ['🦿', '🦾', '🦿', '⚡', '🦿', '🦾', '🦿', '✨'],
  hintText: 'Watch the mech leg demo, then match your knee lift and knee bend!',
  positionCue: 'Step back so the camera sees your hips, knees and ankles clearly.',
  previewCue: 'Study the mech leg joints!',
  matchCue: 'Match the legs!',
  liftCue: 'Lift or lower your knee to match!',
  kneeCue: 'Bend or straighten your knee to match!',
  voiceIntro:
    'Welcome to Mech Walker Dock! Match each mech leg pose — copy knee lift and knee bend on both legs!',
  voiceMatch: 'Match now — copy the mech leg joints!',
  voiceLock: 'Leg joints locked! Mech walker calibrated!',
  voiceComplete: 'Dock complete! You matched every mech leg pose with amazing joint control!',
  congrats: 'Walker Pilot!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export const COPY_SHELL = {
  backText: '#F5D0FE',
  backBorder: 'rgba(245,208,254,0.45)',
  statLabel: '#E879F9',
  statValue: '#FDF4FF',
  statBorder: 'rgba(232,121,249,0.45)',
  sparkleColor: '#F0ABFC',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  academyLabel: 'MIRROR MAZE STUDIO',
} as const;

export type CopyPoseTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  mirror: string;
  panel: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  poses: string[];
  hintText: string;
  positionCue: string;
  previewCue: string;
  copyCue: string;
  armsCue: string;
  legsCue: string;
  voiceIntro: string;
  voiceCopy: string;
  voiceMirror: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const COPY_POSE_THEME: CopyPoseTheme = {
  title: 'Mirror Maze Studio',
  subtitle: 'Copy each full-body pose in the mirror — match arms and legs together!',
  emoji: '🪞',
  hero: '✨',
  accent: '#E879F9',
  accentDeep: '#A21CAF',
  mirror: '#F5D0FE',
  panel: '#581C87',
  glow: 'rgba(232,121,249,0.5)',
  bgGradient: ['#2E1065', '#581C87', '#A21CAF', '#F5D0FE'],
  decor: ['🪞', '✨', '💫', '🌟', '🔮', '⭐'],
  poses: ['🪞', '✨', '🧘', '💫', '🪞', '✨', '🌟', '🔮'],
  hintText: 'Study the mirror pose, then copy your whole body — arms and legs together!',
  positionCue: 'Step back so the camera sees your full body from head to ankles.',
  previewCue: 'Study the mirror pose!',
  copyCue: 'Copy the pose!',
  armsCue: 'Adjust your arms to match the mirror!',
  legsCue: 'Adjust your legs to match the mirror!',
  voiceIntro:
    'Welcome to Mirror Maze Studio! Copy each full-body pose in the mirror — match your arms and legs together!',
  voiceCopy: 'Copy now — match the whole body pose!',
  voiceMirror: 'Perfect mirror copy! Pose reflected!',
  voiceComplete: 'Studio complete! You copied every mirror pose with amazing body awareness!',
  congrats: 'Mirror Master!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export const MIRROR_BODY_SHELL = {
  backText: '#A5F3FC',
  backBorder: 'rgba(165,243,252,0.45)',
  statLabel: '#38BDF8',
  statValue: '#F0F9FF',
  statBorder: 'rgba(56,189,248,0.45)',
  sparkleColor: '#7DD3FC',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FBBF24',
  academyLabel: 'CRYSTAL REFLECTION HALL',
} as const;

export type MirrorBodyTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  reflect: string;
  panel: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  reflections: string[];
  hintText: string;
  positionCue: string;
  previewCue: string;
  mirrorCue: string;
  oppositeCue: string;
  armsCue: string;
  legsCue: string;
  voiceIntro: string;
  voiceMirror: string;
  voiceReflect: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const MIRROR_BODY_THEME: MirrorBodyTheme = {
  title: 'Crystal Reflection Hall',
  subtitle: 'Mirror each pose with your opposite side — left becomes right, like a real mirror!',
  emoji: '🪩',
  hero: '💎',
  accent: '#38BDF8',
  accentDeep: '#0369A1',
  reflect: '#A5F3FC',
  panel: '#0C4A6E',
  glow: 'rgba(56,189,248,0.5)',
  bgGradient: ['#0C1929', '#0C4A6E', '#0369A1', '#BAE6FD'],
  decor: ['🪩', '💎', '✨', '🔷', '💠', '🌊'],
  reflections: ['🪩', '💎', '✨', '🔷', '🪩', '💎', '✨', '🔷'],
  hintText: 'Watch the crystal reflection, then move your OPPOSITE arm and leg to match!',
  positionCue: 'Step back so the camera sees your full body from head to ankles.',
  previewCue: 'Study the reflection!',
  mirrorCue: 'Mirror with your opposite side!',
  oppositeCue: 'Use your opposite side — like facing a real mirror!',
  armsCue: 'Switch arms — mirror the opposite side!',
  legsCue: 'Switch legs — mirror the opposite side!',
  voiceIntro:
    'Welcome to Crystal Reflection Hall! Mirror each pose with your opposite side — when the reflection lifts its left arm, you lift your right!',
  voiceMirror: 'Mirror now — use your opposite arm and leg!',
  voiceReflect: 'Perfect reflection! Body mirrored!',
  voiceComplete: 'Hall complete! You mirrored every pose with amazing body awareness!',
  congrats: 'Reflection Champion!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};

export const POSITION_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.45)',
  statLabel: '#FBBF24',
  statValue: '#FFFBEB',
  statBorder: 'rgba(251,191,36,0.45)',
  sparkleColor: '#FCD34D',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#F59E0B',
  academyLabel: 'PRECISION GRID OBSERVATORY',
} as const;

export type PositionMatchTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  grid: string;
  panel: string;
  glow: string;
  bgGradient: [string, string, string, string];
  decor: string[];
  locks: string[];
  hintText: string;
  positionCue: string;
  previewCue: string;
  matchCue: string;
  focusCue: string;
  axisCue: string;
  voiceIntro: string;
  voiceMatch: string;
  voiceLock: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

export const POSITION_MATCH_THEME: PositionMatchTheme = {
  title: 'Precision Grid Observatory',
  subtitle: 'Lock each highlighted joint into the target position on the calibration grid!',
  emoji: '🎯',
  hero: '🔒',
  accent: '#FBBF24',
  accentDeep: '#D97706',
  grid: '#FDE68A',
  panel: '#78350F',
  glow: 'rgba(251,191,36,0.5)',
  bgGradient: ['#1C1917', '#78350F', '#D97706', '#FDE68A'],
  decor: ['🎯', '🔒', '✨', '📐', '⭐', '🔶'],
  locks: ['🎯', '🔒', '✨', '📐', '🎯', '🔒', '✨', '⭐'],
  hintText: 'Study the grid — match only the highlighted joints to their target positions!',
  positionCue: 'Step back so the camera sees your full body from head to ankles.',
  previewCue: 'Study the position grid!',
  matchCue: 'Lock the highlighted joints!',
  focusCue: 'Adjust the glowing joints to hit the target ticks!',
  axisCue: 'Fine-tune your joint position — get closer to the target line!',
  voiceIntro:
    'Welcome to Precision Grid Observatory! Lock each highlighted joint into the exact target position on the calibration grid!',
  voiceMatch: 'Match now — lock the highlighted joints into position!',
  voiceLock: 'Position locked! Grid calibrated!',
  voiceComplete: 'Observatory complete! You matched every joint position with precision control!',
  congrats: 'Grid Master!',
  skillTags: [
    'proprioception',
    'force-grading',
    'body-awareness',
    'motor-planning',
    'effort-regulation',
  ],
};
