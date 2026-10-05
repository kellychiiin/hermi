'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
  tag: string;
  region: string | null;
  logo: string | null;
  gameId: string;
}

interface Game {
  id: string;
  name: string;
}

export default function EditTeamPage() {
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, gamesRes] = await Promise.all([
          fetch(`/api/teams/${params.id}`),
          fetch('/api/games'),
        ]);

        if (!teamRes.ok) throw new Error('Team not found');
        if (!gamesRes.ok) throw new Error('Failed to load games');

        const teamData = await teamRes.json();
        const gamesData = await gamesRes.json();

        setTeam(teamData);
        setGames(gamesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTeam((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/teams/${team.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team),
      });

      if (!res.ok) throw new Error('Failed to update team');

      alert('Team updated successfully');
      router.push('/admin/teams');
    } catch (err) {
      console.error('Error updating team:', err);
      setError(err instanceof Error ? err.message : 'Failed to update team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!team || !confirm('Delete this team permanently?')) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/teams/${team.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete team');

      alert('Team deleted successfully');
      router.push('/admin/teams');
    } catch (err) {
      console.error('Error deleting team:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete team');
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

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
        <nav className="border-b border-indigo-400/30 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/admin/teams" className="text-white hover:text-indigo-200">
              ← Back to Teams
            </Link>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-white text-lg">{error || 'Team not found'}</p>
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
          <Link href="/admin/teams" className="text-white hover:text-indigo-200">
            Back to Teams
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Edit Team</h1>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Team Name *</label>
            <input
              type="text"
              name="name"
              value={team.name}
              onChange={handleChange}
              required
              className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Tag *</label>
            <input
              type="text"
              name="tag"
              value={team.tag}
              onChange={handleChange}
              required
              className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Game *</label>
              <select
                name="gameId"
                value={team.gameId}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                style={{ colorScheme: 'dark' }}
              >
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {game.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Region</label>
              <input
                type="text"
                name="region"
                value={team.region || ''}
                onChange={handleChange}
                className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                placeholder="e.g., NA, EU"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Logo URL</label>
            <input
              type="url"
              name="logo"
              value={team.logo || ''}
              onChange={handleChange}
              className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-3 rounded-lg transition"
            >
              {submitting ? 'Saving...' : 'Save Team'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white font-semibold py-3 rounded-lg transition"
            >
              {submitting ? 'Deleting...' : 'Delete Team'}
            </button>
          </div>
        </form>
      </div>

      {submitting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
            <p className="text-white font-semibold">Processing...</p>
          </div>
        </div>
      )}
    </main>
  );
}
