/** OT Level 6 · Session 8 · Game 4 — Turtle Crawl */
import { AnimalWalkGame } from '@/components/game/occupational/level6/session8/AnimalWalkGame';
import React from 'react';

const TurtleCrawlGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <AnimalWalkGame {...props} mode="turtleCrawl" />
);

export default TurtleCrawlGame;
