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

export default function TournamentsPage() {
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

  const handleDelete = async (e: React.MouseEvent, tournamentId: string) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this tournament?')) return;

    try {
      const res = await fetch('/api/tournaments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: tournamentId }),
      });

      if (!res.ok) throw new Error('Failed to delete tournament');

      setTournaments((prev) =>
        prev.filter((t) => t.id !== tournamentId)
      );
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('Failed to delete tournament');
    }
  };

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
              <div
                key={tournament.id}
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

                <div className="space-y-2 text-sm text-indigo-100 mb-4">
                  <p>📅 {format(new Date(tournament.startDate), 'MMM dd, yyyy')}</p>
                  {tournament.location && <p>📍 {tournament.location}</p>}
                  {tournament.prizePool && <p>💰 ${tournament.prizePool.toLocaleString()}</p>}
                  <p>🏆 {tournament.participants.length} teams</p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-indigo-400/20">
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-center font-semibold transition"
                  >
                    View
                  </Link>
                  <button
                    onClick={(e) => handleDelete(e, tournament.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
