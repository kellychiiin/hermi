'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';

interface Player {
  id: string;
  handle: string;
  realName: string | null;
  photo: string | null;
  country: string | null;
  rosterMemberships: Array<{
    id: string;
    role: string | null;
    startDate: string;
    team: {
      id: string;
      name: string;
      tag: string;
      game: {
        id: string;
        name: string;
      };
    };
  }>;
}

interface Championship {
  gameId: string;
  gameName: string;
  count: number;
}

export default function PlayerProfilePage() {
  const params = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await fetch(`/api/players/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch player');
        const data = await res.json();
        setPlayer(data);

        // Fetch championships
        const champRes = await fetch('/api/champions');
        const champData = await champRes.json();

        // Find this player in champions
        if (champData.playerChampions) {
          const playerChamp = champData.playerChampions.find(
            (p: any) => p.id === data.id
          );
          if (playerChamp) {
            setChampionships(playerChamp.championships);
          }
        }
      } catch (error) {
        console.error('Error fetching player:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPlayer();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading player...</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
        <nav className="border-b border-indigo-400/30 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              Hermi
            </Link>
            <Link href="/tournaments" className="text-white hover:text-indigo-200">
              Back to Tournaments
            </Link>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-white text-lg">Player not found</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
      <nav className="border-b border-indigo-400/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Hermi
          </Link>
          <Link href="/tournaments" className="text-white hover:text-indigo-200">
            Back to Tournaments
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Player Info Card */}
          <div className="md:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden text-white">
              {player.photo && (
                <div className="w-full h-64 overflow-hidden">
                  <img
                    src={player.photo}
                    alt={player.handle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-2">{player.handle}</h1>
                {player.realName && (
                  <p className="text-indigo-200 mb-4">{player.realName}</p>
                )}
                {player.country && (
                  <p className="text-indigo-100 mb-6">🌍 {player.country}</p>
                )}

                {championships.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-yellow-400">
                      🏆 Championships
                    </h3>
                    <div className="space-y-2">
                      {championships.map((champ) => (
                        <div
                          key={champ.gameId}
                          className="bg-white/10 px-3 py-2 rounded flex justify-between items-center"
                        >
                          <span className="text-sm">{champ.gameName}</span>
                          <span className="font-bold text-yellow-400">
                            {champ.count}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Teams Section */}
          <div className="md:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-6">Teams</h2>

              {player.rosterMemberships.length === 0 ? (
                <p className="text-indigo-200">Not on any teams yet</p>
              ) : (
                <div className="space-y-4">
                  {player.rosterMemberships.map((membership) => (
                    <div
                      key={membership.id}
                      className="bg-white/5 rounded-lg p-4 border border-indigo-400/20"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-bold">
                            {membership.team.name}
                          </h3>
                          <p className="text-indigo-200 text-sm">
                            {membership.team.tag}
                          </p>
                        </div>
                        <span className="bg-indigo-500 px-3 py-1 rounded text-sm font-semibold">
                          {membership.team.game.name}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-indigo-100">
                        {membership.role && (
                          <p>💼 Role: {membership.role}</p>
                        )}
                        <p>📅 Joined: {format(new Date(membership.startDate), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
