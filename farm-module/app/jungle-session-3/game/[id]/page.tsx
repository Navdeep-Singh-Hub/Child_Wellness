'use client';

import JungleCleanUp from '@/components/games/JungleCleanUp';
import JungleRhymes from '@/components/games/JungleRhymes';
import SyllableClapJungle from '@/components/games/SyllableClapJungle';
import DotMazeCounting from '@/components/games/DotMazeCounting';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const GAMES: Record<string, React.ComponentType> = {
  '1': JungleCleanUp,
  '2': JungleRhymes,
  '3': SyllableClapJungle,
  '4': DotMazeCounting,
};

export default function JungleGamePage() {
  const params = useParams();
  const id = params?.id as string;
  const Game = GAMES[id];

  if (!Game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-jungle-leaf/20">
        <p className="text-xl">
          Game not found.{' '}
          <Link href="/jungle-session-3" className="text-jungle-green underline">
            Back to session
          </Link>
        </p>
      </div>
    );
  }

  return <Game />;
}
