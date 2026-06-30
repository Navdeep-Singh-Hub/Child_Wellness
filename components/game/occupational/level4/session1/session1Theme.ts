/**
 * Backward-compat barrel — OT Level 4 Session 1 drag themes.
 */
export const SESSION1_SHELL = {
  backText: '#1E3A8A',
  backBorder: 'rgba(59,130,246,0.28)',
  titleColor: '#0F172A',
  subtitleColor: '#475569',
  statLabel: '#64748B',
  statValue: '#0F172A',
  statBorder: 'rgba(15,23,42,0.12)',
} as const;

export { GOAL_PASS_THEME } from '@/components/game/occupational/level4/session1/goalPass/goalPassTheme';
export {
  MONSTER_FOOD_ITEMS,
  MONSTER_FEED_THEME,
  MONSTER_MUNCH_THEME,
} from '@/components/game/occupational/level4/session1/monsterMunch/monsterMunchTheme';
export { LANE_CROSS_CARS, LANE_CROSS_THEME } from '@/components/game/occupational/level4/session1/laneCross/laneCrossTheme';
export { COLOR_SLIDE_THEME } from '@/components/game/occupational/level4/session1/colorSlide/colorSlideTheme';
export { QUICK_DRAG_THEME } from '@/components/game/occupational/level4/session1/quickDrag/quickDragTheme';
