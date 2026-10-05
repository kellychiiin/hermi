'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Tournament {
  id: string;
  name: string;
  game: {
    name: string;
  };
  status: string;
  startDate: string;
  participants: any[];
}

export default function AdminPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await fetch('/api/tournaments');
        const data = await res.json();
        setTournaments(data);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
            <Link href="/tournaments" className="text-white hover:text-indigo-200">
              Tournaments
            </Link>
            <Link href="/admin" className="text-white hover:text-indigo-200 font-semibold">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-indigo-100">Manage tournaments, teams, and matches</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Link
            href="/admin/tournaments/create"
            className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white hover:bg-white/20 transition border-2 border-green-400/50"
          >
            <div className="text-4xl mb-4">✨</div>
            <h2 className="text-xl font-bold mb-2">Create Tournament</h2>
            <p className="text-indigo-100">Set up a new tournament</p>
          </Link>

          <Link
            href="/admin/teams"
            className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white hover:bg-white/20 transition border-2 border-blue-400/50"
          >
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-xl font-bold mb-2">Manage Teams</h2>
            <p className="text-indigo-100">Add and manage teams</p>
          </Link>

          <Link
            href="/admin/stages"
            className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white hover:bg-white/20 transition border-2 border-yellow-400/50"
          >
            <div className="text-4xl mb-4">🏆</div>
            <h2 className="text-xl font-bold mb-2">Manage Stages</h2>
            <p className="text-indigo-100">Create tournament stages</p>
          </Link>

          <Link
            href="/admin/players"
            className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white hover:bg-white/20 transition border-2 border-purple-400/50"
          >
            <div className="text-4xl mb-4">🎮</div>
            <h2 className="text-xl font-bold mb-2">Manage Players</h2>
            <p className="text-indigo-100">Add players and rosters</p>
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Your Tournaments</h2>

          {tournaments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-indigo-200 mb-4">No tournaments yet</p>
              <Link
                href="/admin/tournaments/create"
                className="bg-indigo-500 hover:bg-indigo-600 px-6 py-2 rounded-lg font-semibold"
              >
                Create First Tournament
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-indigo-400/20">
                    <th className="text-left p-4 font-semibold">Tournament</th>
                    <th className="text-left p-4 font-semibold">Game</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Teams</th>
                    <th className="text-left p-4 font-semibold">Start Date</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map((tournament) => (
                    <tr
                      key={tournament.id}
                      className="border-b border-indigo-400/10 hover:bg-white/5"
                    >
                      <td className="p-4 font-semibold">{tournament.name}</td>
                      <td className="p-4">{tournament.game.name}</td>
                      <td className="p-4">
                        <span className="bg-indigo-500 px-3 py-1 rounded text-sm">
                          {tournament.status}
                        </span>
                      </td>
                      <td className="p-4">{tournament.participants.length}</td>
                      <td className="p-4 text-sm">
                        {format(new Date(tournament.startDate), 'MMM dd, yyyy')}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/tournaments/${tournament.id}`}
                            className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/tournaments/${tournament.id}`}
                            className="bg-indigo-500 hover:bg-indigo-600 px-3 py-1 rounded text-sm"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
