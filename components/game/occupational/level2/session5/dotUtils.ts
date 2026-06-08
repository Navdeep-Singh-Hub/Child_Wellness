export type DotDef = { x: number; y: number; number: number };

export type DotRound = {
  dots: DotDef[];
  revealPath?: string;
};

export const makeRandomGlowShape = (): DotRound => {
  const n = 4 + Math.floor(Math.random() * 3);
  const dots: DotDef[] = [];
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n;
    const r = 25 + Math.random() * 10;
    dots.push({ x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle), number: i + 1 });
  }
  return { dots };
};

export const makeAnimalShape = (): DotRound => {
  const triangle = Math.random() > 0.5;
  if (triangle) {
    return {
      dots: [
        { x: 50, y: 30, number: 1 },
        { x: 30, y: 70, number: 2 },
        { x: 70, y: 70, number: 3 },
      ],
    };
  }
  return {
    dots: [
      { x: 40, y: 40, number: 1 },
      { x: 60, y: 40, number: 2 },
      { x: 60, y: 60, number: 3 },
      { x: 40, y: 60, number: 4 },
    ],
  };
};

export const makeStarShape = (): DotRound => {
  const cx = 50; const cy = 50;
  const outer = 30; const inner = 15;
  const dots: DotDef[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    dots.push({ x: cx + outer * Math.cos(angle), y: cy + outer * Math.sin(angle), number: i * 2 + 1 });
    const innerAngle = angle + Math.PI / 5;
    dots.push({ x: cx + inner * Math.cos(innerAngle), y: cy + inner * Math.sin(innerAngle), number: i * 2 + 2 });
  }
  return { dots };
};

export const makeHouseShape = (): DotRound => ({
  dots: [
    { x: 40, y: 60, number: 1 },
    { x: 60, y: 60, number: 2 },
    { x: 60, y: 40, number: 3 },
    { x: 40, y: 40, number: 4 },
    { x: 50, y: 25, number: 5 },
  ],
});

export const makeHiddenShape = (): DotRound => {
  const heart: DotRound = {
    dots: [
      { x: 50, y: 60, number: 1 }, { x: 45, y: 55, number: 2 }, { x: 40, y: 50, number: 3 },
      { x: 45, y: 45, number: 4 }, { x: 50, y: 40, number: 5 }, { x: 55, y: 45, number: 6 },
      { x: 60, y: 50, number: 7 }, { x: 55, y: 55, number: 8 },
    ],
    revealPath: 'M 50 60 L 45 55 L 40 50 L 45 45 L 50 40 L 55 45 L 60 50 L 55 55 Z',
  };
  const diamond: DotRound = {
    dots: [
      { x: 50, y: 70, number: 1 }, { x: 60, y: 50, number: 2 },
      { x: 50, y: 30, number: 3 }, { x: 40, y: 50, number: 4 },
    ],
    revealPath: 'M 50 70 L 60 50 L 50 30 L 40 50 Z',
  };
  return Math.random() > 0.5 ? heart : diamond;
};
