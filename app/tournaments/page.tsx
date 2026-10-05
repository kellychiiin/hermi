'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Tournament {
  id: string;
  name: string;
  game: {
    id: string;
    name: string;
  };
  status: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  prizePool: number | null;
  participants: any[];
}

interface Champion {
  id: string;
  handle: string;
  realName: string | null;
  photo: string | null;
  championships: Array<{
    gameId: string;
    gameName: string;
    count: number;
  }>;
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentsRes, championsRes] = await Promise.all([
          fetch('/api/tournaments'),
          fetch('/api/champions'),
        ]);
        const tournamentsData = await tournamentsRes.json();
        const championsData = await championsRes.json();
        setTournaments(tournamentsData);
        setChampions(championsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading tournaments...</div>
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
          <div className="flex gap-4">
            <Link href="/tournaments" className="text-white hover:text-indigo-200 font-semibold">
              Tournaments
            </Link>
            <Link href="/admin" className="text-white hover:text-indigo-200">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tournaments</h1>
          <p className="text-indigo-100">Browse and follow ongoing tournaments</p>
        </div>

        {tournaments.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-12 text-center">
            <p className="text-white text-lg mb-6">No tournaments yet</p>
            <Link
              href="/admin/tournaments/create"
              className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-50"
            >
              Create First Tournament
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white hover:bg-white/20 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{tournament.name}</h2>
                    <p className="text-indigo-200 text-sm">{tournament.game.name}</p>
                  </div>
                  <span className="bg-indigo-500 px-3 py-1 rounded text-sm font-semibold">
                    {tournament.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-indigo-100">
                  <p>📅 {format(new Date(tournament.startDate), 'MMM dd, yyyy')}</p>
                  {tournament.location && <p>📍 {tournament.location}</p>}
                  {tournament.prizePool && <p>💰 ${tournament.prizePool.toLocaleString()}</p>}
                  <p>🏆 {tournament.participants.filter((p: any) => !p.stageId).length} teams</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {champions.length > 0 && (
          <div className="mt-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Previous Champions</h2>
              <p className="text-indigo-100">Top players by championship wins</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white">
              <div className="space-y-4">
                {champions.map((champion) => (
                  <div
                    key={champion.id}
                    className="bg-white/5 rounded-lg p-4 flex items-start justify-between hover:bg-white/10 transition"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {champion.photo && (
                        <img
                          src={champion.photo}
                          alt={champion.handle}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{champion.handle}</h3>
                        {champion.realName && (
                          <p className="text-sm text-indigo-200">{champion.realName}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {champion.championships.map((champ) => (
                            <span
                              key={champ.gameId}
                              className="text-xs bg-indigo-500/30 px-2 py-1 rounded"
                            >
                              {champ.count}x {champ.gameName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-400">
                        {champion.championships.reduce((sum, c) => sum + c.count, 0)}
                      </p>
                      <p className="text-xs text-indigo-300">Titles</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
