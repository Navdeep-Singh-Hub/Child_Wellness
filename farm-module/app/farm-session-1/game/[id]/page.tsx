'use client';

import CleanItUp from '@/components/games/CleanItUp';
import RhymeGame from '@/components/games/RhymeGame';
import SyllableClap from '@/components/games/SyllableClap';
import DragToCount from '@/components/games/DragToCount';
import { useParams } from 'next/navigation';

const GAMES: Record<string, React.ComponentType> = {
  '1': CleanItUp,
  '2': RhymeGame,
  '3': SyllableClap,
  '4': DragToCount,
};

export default function GamePage() {
  const params = useParams();
  const id = params?.id as string;
  const Game = GAMES[id];

  if (!Game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-xl">Game not found. <a href="/farm-session-1" className="text-farm-green underline">Back to session</a></p>
      </div>
    );
  }

  return <Game />;
}
