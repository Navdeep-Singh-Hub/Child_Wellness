/** Design system and game constants */

export const COLORS = {
  green: '#4CAF50',
  sky: '#60A5FA',
  yellow: '#FACC15',
} as const;

export const ROUTES = {
  intro: '/farm-session-1',
  game: (id: number) => `/farm-session-1/game/${id}`,
  notebook: '/farm-session-1/notebook-task',
  result: '/farm-session-1/result',
} as const;
