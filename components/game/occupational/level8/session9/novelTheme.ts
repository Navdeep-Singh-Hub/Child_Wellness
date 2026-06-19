/**
 * OT Level 8 · Session 9 — "Novel Motor Challenges" (Wild Move Lab)
 *
 * Five camera-tracked adventures with UNFAMILIAR composite body moves the child
 * has not seen in earlier sessions. Some games use a surprise reveal — the move
 * appears only after a "?" beat to test flexible motor planning.
 */
import type { NovelChallenge } from '@/components/game/occupational/level8/session9/novelChallenge';

export type NovelMode = 'alienMoves' | 'robotFactory' | 'mysteryIsland' | 'surpriseActions' | 'challengeQuest';

export const NOVEL_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.4)',
  statLabel: '#FCD34D',
  statValue: '#FEF3C7',
  statBorder: 'rgba(252,211,77,0.4)',
  sparkleColor: '#FEF08A',
} as const;

export type NovelGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  glow: string;
  bgGradient: [string, string, string, string];
  rounds: number;
  challenges: NovelChallenge[];
  /** Hide the move behind "?" before revealing (Surprise Actions / Challenge Quest). */
  surpriseReveal: boolean;
  collectible: string;
  hintText: string;
  positionCue: string;
  voiceIntro: string;
  voicePlan: string;
  voiceSurprise: string;
  voiceComplete: string;
  congrats: string;
  skillTags: string[];
};

const SKILL = ['praxis', 'motor-planning', 'novel-movement', 'body-awareness', 'flexibility'];

const C = (
  id: string,
  name: string,
  icon: string,
  teaser: string,
  kind: NovelChallenge['kind'],
): NovelChallenge => ({ id, name, icon, teaser, kind });

export const NOVEL_GAME_THEMES: Record<NovelMode, NovelGameTheme> = {
  alienMoves: {
    title: 'Alien Moves',
    subtitle: 'Copy the weird alien body moves — they are brand new!',
    emoji: '👽',
    hero: '🛸',
    accent: '#84CC16',
    glow: 'rgba(132,204,22,0.55)',
    bgGradient: ['#14532D', '#3F6212', '#65A30D', '#BEF264'],
    rounds: 6,
    surpriseReveal: false,
    challenges: [
      C('a-ant', 'Alien Antenna', '👽', 'Arms up AND lean to the side!', 'alienAntenna'),
      C('a-float', 'Alien Float', '🛸', 'Wings out while crouching low!', 'alienFloat'),
      C('a-wig', 'Alien Wiggle', '🌌', 'One arm out, one arm up!', 'alienWiggle'),
      C('a-flam', 'Space Flamingo', '🦩', 'One arm up, one arm down!', 'islandFlamingo'),
    ],
    collectible: '👽',
    hintText: 'Try the weird new move and hold it!',
    positionCue: 'Stand back so the camera sees your whole body!',
    voiceIntro: 'Greetings, earthling! Copy each brand-new alien move!',
    voicePlan: 'Study the alien move…',
    voiceSurprise: 'Surprise alien move incoming!',
    voiceComplete: 'The aliens are impressed! You learned every move!',
    congrats: 'Alien Moves Master!',
    skillTags: SKILL,
  },
  robotFactory: {
    title: 'Robot Factory',
    subtitle: 'Build robots with strange factory moves!',
    emoji: '🏭',
    hero: '⚙️',
    accent: '#94A3B8',
    glow: 'rgba(148,163,184,0.55)',
    bgGradient: ['#0F172A', '#334155', '#64748B', '#CBD5E1'],
    rounds: 6,
    surpriseReveal: false,
    challenges: [
      C('r-build', 'Power Build', '🔋', 'Launch both arms to power up!', 'robotBuild'),
      C('r-fold', 'Fold Mode', '📦', 'Crouch low with arms wide!', 'robotFold'),
      C('r-spin', 'Spinner Arms', '🌀', 'Turn sideways with wings out!', 'robotSpin'),
      C('r-clap', 'Power Clap', '👏', 'Clap with one arm raised!', 'questPowerClap'),
    ],
    collectible: '⚙️',
    hintText: 'Perform each factory move and hold it!',
    positionCue: 'Stand facing the camera with room to turn and crouch!',
    voiceIntro: 'Welcome to the robot factory! Perform each strange build move!',
    voicePlan: 'Get ready to build…',
    voiceSurprise: 'New factory move loading!',
    voiceComplete: 'Factory complete! Every robot move mastered!',
    congrats: 'Robot Factory Expert!',
    skillTags: SKILL,
  },
  mysteryIsland: {
    title: 'Mystery Island',
    subtitle: 'Discover secret island moves nobody has seen before!',
    emoji: '🏝️',
    hero: '🌺',
    accent: '#F59E0B',
    glow: 'rgba(245,158,11,0.55)',
    bgGradient: ['#451A03', '#B45309', '#D97706', '#FDE68A'],
    rounds: 6,
    surpriseReveal: false,
    challenges: [
      C('m-flam', 'Flamingo Pose', '🦩', 'One arm up, one arm down!', 'islandFlamingo'),
      C('m-crab', 'Crab Scuttle', '🦀', 'Wings out while staying low!', 'islandCrab'),
      C('m-wave', 'Palm Wave', '🌴', 'Mix of up, out and lean!', 'islandWave'),
      C('m-asy', 'Island Combo', '🌺', 'Left up, right out!', 'questAsymmetric'),
    ],
    collectible: '🌺',
    hintText: 'Discover and hold each secret island move!',
    positionCue: 'Stand back with room to crouch and reach!',
    voiceIntro: 'Mystery island! Discover each secret move hidden on the island!',
    voicePlan: 'Discover the secret move…',
    voiceSurprise: 'A mystery move appears!',
    voiceComplete: 'You discovered every secret! Island champion!',
    congrats: 'Mystery Island Explorer!',
    skillTags: SKILL,
  },
  surpriseActions: {
    title: 'Surprise Actions',
    subtitle: 'Wait for the surprise — then do the mystery move FAST!',
    emoji: '🎁',
    hero: '❓',
    accent: '#EC4899',
    glow: 'rgba(236,72,153,0.55)',
    bgGradient: ['#500724', '#9D174D', '#DB2777', '#FBCFE8'],
    rounds: 7,
    surpriseReveal: true,
    challenges: [
      C('s-jump', 'Surprise Jump', '🦘', 'Jump when you see it!', 'surpriseJump'),
      C('s-freeze', 'Surprise Freeze', '🧊', 'Freeze like a statue!', 'surpriseFreeze'),
      C('s-cross', 'Surprise Cross Clap', '✖️', 'Cross clap across your body!', 'surpriseCross'),
      C('s-ant', 'Surprise Antenna', '👽', 'Arms up and lean!', 'alienAntenna'),
      C('s-spin', 'Surprise Spin', '🌀', 'Turn with wings out!', 'robotSpin'),
    ],
    collectible: '🎁',
    hintText: 'Wait for the reveal, then do the surprise move quickly!',
    positionCue: 'Stay ready — the move will pop up as a surprise!',
    voiceIntro: 'Surprise time! Wait for each mystery move to appear, then do it fast!',
    voicePlan: 'Get ready…',
    voiceSurprise: 'Surprise! Do this move!',
    voiceComplete: 'You handled every surprise! Amazing flexibility!',
    congrats: 'Surprise Actions Star!',
    skillTags: [...SKILL, 'reaction-flexibility'],
  },
  challengeQuest: {
    title: 'Challenge Quest',
    subtitle: 'The ultimate novel move quest — surprise combos await!',
    emoji: '🏆',
    hero: '🏆',
    accent: '#8B5CF6',
    glow: 'rgba(139,92,246,0.55)',
    bgGradient: ['#2E1065', '#5B21B6', '#7C3AED', '#DDD6FE'],
    rounds: 7,
    surpriseReveal: true,
    challenges: [
      C('q-asy', 'Asymmetric Quest', '⚡', 'Left up, right out!', 'questAsymmetric'),
      C('q-lt', 'Low Turn Quest', '🌀', 'Turn while reaching low!', 'questLowTurn'),
      C('q-pc', 'Power Clap Quest', '👏', 'Clap with an arm raised!', 'questPowerClap'),
      C('q-float', 'Float Quest', '🛸', 'Float low with wings out!', 'alienFloat'),
      C('q-wave', 'Wave Quest', '🌊', 'Up, out and lean combo!', 'islandWave'),
      C('q-jump', 'Leap Quest', '🦘', 'Surprise jump!', 'surpriseJump'),
    ],
    collectible: '🏆',
    hintText: 'Face each surprise challenge and nail the novel move!',
    positionCue: 'Stand ready for anything — novel moves incoming!',
    voiceIntro: 'Challenge quest! Face surprise novel moves and conquer them all!',
    voicePlan: 'Prepare for the challenge…',
    voiceSurprise: 'Challenge revealed! Go!',
    voiceComplete: 'Quest complete! You are a novel-move champion!',
    congrats: 'Challenge Quest Legend!',
    skillTags: SKILL,
  },
};
