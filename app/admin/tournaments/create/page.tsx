'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Game {
  id: string;
  name: string;
}

export default function CreateTournamentPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    gameId: '',
    organizer: '',
    tier: '',
    startDate: '',
    endDate: '',
    location: '',
    prizePool: '',
    status: 'UPCOMING',
    description: '',
  });

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await fetch('/api/games');
        const data = await res.json();
        setGames(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, gameId: data[0].id }));
        }
      } catch (error) {
        console.error('Error fetching games:', error);
        setError('Failed to load games');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to create tournament');
      }

      const tournament = await res.json();
      router.push(`/admin/tournaments/${tournament.id}`);
    } catch (error) {
      console.error('Error creating tournament:', error);
      setError('Failed to create tournament. Please try again.');
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
      <nav className="border-b border-indigo-400/30 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Hermi
          </Link>
          <div className="flex gap-4">
            <Link href="/admin" className="text-white hover:text-indigo-200">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-indigo-200 hover:text-white mb-4 inline-block"
          >
            ← Back to Admin
          </Link>
          <h1 className="text-4xl font-bold text-white">Create Tournament</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white"
        >
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-400 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Tournament Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white placeholder-indigo-300 focus:outline-none focus:border-indigo-400"
                placeholder="e.g., DPC 2024 Season"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Game *
              </label>
              <select
                name="gameId"
                value={formData.gameId}
                onChange={handleChange}
                required
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
                <label className="block text-sm font-semibold mb-2">Tier</label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="">Select Tier</option>
                  <option value="Pro">Pro</option>
                  <option value="Semi-Pro">Semi-Pro</option>
                  <option value="Amateur">Amateur</option>
                  <option value="Community">Community</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white placeholder-indigo-300 focus:outline-none focus:border-indigo-400"
                  placeholder="e.g., Online or City name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Prize Pool (USD)
                </label>
                <input
                  type="number"
                  name="prizePool"
                  value={formData.prizePool}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white placeholder-indigo-300 focus:outline-none focus:border-indigo-400"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Organizer
              </label>
              <input
                type="text"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white placeholder-indigo-300 focus:outline-none focus:border-indigo-400"
                placeholder="Your name or organization"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white placeholder-indigo-300 focus:outline-none focus:border-indigo-400 h-24"
                placeholder="Tournament details and rules..."
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-3 rounded-lg transition"
              >
                {submitting ? 'Creating...' : 'Create Tournament'}
              </button>
              <Link
                href="/admin"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg text-center transition"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
