'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Player {
  id: string;
  handle: string;
  realName: string | null;
  country: string | null;
  photo: string | null;
  games?: Array<{
    id: string;
    name: string;
  }>;
  gameIds?: string[];
}

interface Game {
  id: string;
  name: string;
}

export default function EditPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playerRes, gamesRes] = await Promise.all([
          fetch(`/api/players/${params.id}`),
          fetch('/api/games'),
        ]);

        if (!playerRes.ok) throw new Error('Player not found');
        if (!gamesRes.ok) throw new Error('Failed to load games');

        const playerData = await playerRes.json();
        const gamesData = await gamesRes.json();

        setPlayer({
          ...playerData,
          gameIds: playerData.games?.map((g: any) => g.id) || [],
        });
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await res.json();
      setPlayer((prev) => prev ? { ...prev, photo: data.url } : null);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement & HTMLSelectElement;

    setPlayer((prev) => {
      if (!prev) return null;

      if (type === 'checkbox') {
        const gameIds = (prev.gameIds || []).includes(value)
          ? (prev.gameIds || []).filter((id) => id !== value)
          : [...(prev.gameIds || []), value];
        return { ...prev, gameIds };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!player) return;

    setSubmitting(true);
    setError('');

    try {
      const { games, ...playerData } = player;
      const res = await fetch(`/api/players/${player.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });

      if (!res.ok) throw new Error('Failed to update player');

      alert('Player updated successfully');
      router.push('/admin/players');
    } catch (err) {
      console.error('Error updating player:', err);
      setError(err instanceof Error ? err.message : 'Failed to update player');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!player || !confirm('Delete this player permanently?')) return;

    setSubmitting(true);

    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete player');

      alert('Player deleted successfully');
      router.push('/admin/players');
    } catch (err) {
      console.error('Error deleting player:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete player');
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

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
        <nav className="border-b border-indigo-400/30 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/admin/players" className="text-white hover:text-indigo-200">
              ← Back to Players
            </Link>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-white text-lg">{error || 'Player not found'}</p>
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
          <Link href="/admin/players" className="text-white hover:text-indigo-200">
            Back to Players
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Edit Player</h1>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-400 rounded-lg p-4 text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2">Handle/IGN *</label>
            <input
              type="text"
              name="handle"
              value={player.handle}
              onChange={handleChange}
              required
              className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Real Name</label>
            <input
              type="text"
              name="realName"
              value={player.realName || ''}
              onChange={handleChange}
              className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Games *</label>
            <div className="space-y-2">
              {games.map((game) => (
                <label key={game.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="gameIds"
                    value={game.id}
                    checked={(player.gameIds || []).includes(game.id)}
                    onChange={handleChange}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-white">{game.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Country</label>
            <input
              type="text"
              name="country"
              value={player.country || ''}
              onChange={handleChange}
              className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
              placeholder="e.g., USA, CN"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Player Photo</label>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="block w-full text-sm text-indigo-200
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-500 file:text-white
                  hover:file:bg-indigo-600
                  cursor-pointer"
              />
              <p className="text-xs text-indigo-300 mt-2">
                Upload JPG, PNG, or other image formats
              </p>
            </div>
            {player.photo && (
              <div>
                <p className="text-xs text-indigo-200 mb-2">Preview:</p>
                <div className="relative">
                  <img
                    src={player.photo}
                    alt="Player preview"
                    className="max-w-full h-48 object-cover rounded-lg border border-indigo-400/30"
                  />
                  <button
                    type="button"
                    onClick={() => setPlayer((prev) => prev ? { ...prev, photo: null } : null)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-3 rounded-lg transition"
            >
              {submitting ? 'Saving...' : 'Save Player'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white font-semibold py-3 rounded-lg transition"
            >
              {submitting ? 'Deleting...' : 'Delete Player'}
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
