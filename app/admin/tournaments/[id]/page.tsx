'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Tournament {
  id: string;
  name: string;
  gameId: string;
  organizer: string | null;
  tier: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  prizePool: number | null;
  status: string;
  description: string | null;
}

interface Game {
  id: string;
  name: string;
}

export default function EditTournamentPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'stages' | 'teams'>('details');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentRes, gamesRes] = await Promise.all([
          fetch(`/api/tournaments/${params.id}`),
          fetch('/api/games'),
        ]);

        if (!tournamentRes.ok) throw new Error('Tournament not found');

        const tournamentData = await tournamentRes.json();
        const gamesData = await gamesRes.json();

        setTournament(tournamentData);
        setGames(gamesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load tournament');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTournament((prev) =>
      prev ? { ...prev, [name]: value } : null
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/tournaments/${tournament.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tournament),
      });

      if (!res.ok) throw new Error('Failed to update tournament');

      alert('Tournament updated successfully');
    } catch (error) {
      console.error('Error updating tournament:', error);
      setError('Failed to update tournament. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
        <nav className="border-b border-indigo-400/30 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/admin" className="text-white hover:text-indigo-200">
              ← Back to Admin
            </Link>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-white text-lg">{error || 'Tournament not found'}</p>
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
          <Link href="/admin" className="text-white hover:text-indigo-200">
            Back to Admin
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">{tournament.name}</h1>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg overflow-hidden">
          <div className="flex border-b border-indigo-400/20">
            {(['details', 'stages', 'teams'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === tab
                    ? 'text-white bg-indigo-500/30 border-b-2 border-indigo-400'
                    : 'text-indigo-200 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-8 text-white">
            {activeTab === 'details' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 text-red-200">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Tournament Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={tournament.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Game
                  </label>
                  <select
                    name="gameId"
                    value={tournament.gameId}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                  >
                    {games.map((game) => (
                      <option key={game.id} value={game.id}>
                        {game.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Tier
                    </label>
                    <select
                      name="tier"
                      value={tournament.tier || ''}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="">Select Tier</option>
                      <option value="Pro">Pro</option>
                      <option value="Semi-Pro">Semi-Pro</option>
                      <option value="Amateur">Amateur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={tournament.status}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="UPCOMING">Upcoming</option>
                      <option value="ONGOING">Ongoing</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={tournament.description || ''}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400 h-24"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-2 rounded-lg transition"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {activeTab === 'stages' && (
              <div className="text-center py-12">
                <p className="text-indigo-200 mb-6">Stages and bracket management coming soon</p>
                <Link
                  href={`/tournaments/${tournament.id}`}
                  className="bg-indigo-500 hover:bg-indigo-600 px-6 py-2 rounded-lg font-semibold"
                >
                  View Tournament
                </Link>
              </div>
            )}

            {activeTab === 'teams' && (
              <div className="text-center py-12">
                <p className="text-indigo-200 mb-6">Team registration and management coming soon</p>
                <Link
                  href="/admin/teams"
                  className="bg-indigo-500 hover:bg-indigo-600 px-6 py-2 rounded-lg font-semibold"
                >
                  Manage Teams
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
