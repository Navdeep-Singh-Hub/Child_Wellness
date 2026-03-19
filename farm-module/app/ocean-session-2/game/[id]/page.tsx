'use client';

import OceanCleanUp from '@/components/games/OceanCleanUp';
import RhymeHunt from '@/components/games/RhymeHunt';
import SyllableClapOcean from '@/components/games/SyllableClapOcean';
import MatchSetsToNumbers from '@/components/games/MatchSetsToNumbers';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const GAMES: Record<string, React.ComponentType> = {
  '1': OceanCleanUp,
  '2': RhymeHunt,
  '3': SyllableClapOcean,
  '4': MatchSetsToNumbers,
};

export default function OceanGamePage() {
  const params = useParams();
  const id = params?.id as string;
  const Game = GAMES[id];

  if (!Game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-ocean-blue/20">
        <p className="text-xl">
          Game not found.{' '}
          <Link href="/ocean-session-2" className="text-ocean-blue underline">
            Back to session
          </Link>
        </p>
      </div>
    );
  }

  return <Game />;
}
