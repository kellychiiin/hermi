'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Player {
  id: string;
  handle: string;
  realName: string | null;
  country: string | null;
  games?: Array<{
    id: string;
    name: string;
  }>;
  rosterMemberships: any[];
}

interface Game {
  id: string;
  name: string;
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState('');

  const [formData, setFormData] = useState({
    handle: '',
    realName: '',
    country: '',
    photo: '',
    gameId: '',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData((prev) => ({ ...prev, photo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, playersRes] = await Promise.all([
          fetch('/api/games'),
          fetch('/api/players'),
        ]);

        const gamesData = await gamesRes.json();
        const playersData = await playersRes.json();

        setGames(gamesData);
        setPlayers(playersData);

        if (gamesData.length > 0) {
          setSelectedGameId(gamesData[0].id);
          setFormData((prev) => ({ ...prev, gameId: gamesData[0].id }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create player');
      }

      const newPlayer = await res.json();
      setPlayers((prev) => [...prev, newPlayer]);
      setFormData({
        handle: '',
        realName: '',
        country: '',
        photo: '',
        gameId: selectedGameId,
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating player:', error);
      alert(error instanceof Error ? error.message : 'Failed to create player');
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
          <Link href="/admin" className="text-white hover:text-indigo-200">
            Back to Admin
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Manage Players</h1>
            <p className="text-indigo-100">Add players and manage rosters</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg"
          >
            {showForm ? '✕ Cancel' : '+ Add Player'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Handle/IGN *
                  </label>
                  <input
                    type="text"
                    name="handle"
                    value={formData.handle}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                    placeholder="In-game name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Real Name
                  </label>
                  <input
                    type="text"
                    name="realName"
                    value={formData.realName}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                    placeholder="Player's real name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                    placeholder="e.g., USA, CN"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Player Photo
                </label>
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
                {formData.photo && (
                  <div className="mt-2">
                    <img
                      src={formData.photo}
                      alt="Player preview"
                      className="max-w-full h-24 object-cover rounded-lg border border-indigo-400/30"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-2 rounded-lg"
                >
                  {submitting ? 'Creating...' : 'Create Player'}
                </button>
              </div>
            </form>
          </div>
        )}

        {players.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-12 text-center text-white">
            <p className="text-indigo-200">No players yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
              <div
                key={player.id}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white hover:bg-white/20 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{player.handle}</h3>
                  <Link
                    href={`/admin/players/${player.id}`}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm font-semibold"
                  >
                    Edit
                  </Link>
                </div>
                {player.realName && (
                  <p className="text-indigo-200 text-sm mb-4">
                    {player.realName}
                  </p>
                )}
                <div className="space-y-2 text-sm text-indigo-100">
                  {player.games && player.games.length > 0 && (
                    <div>
                      <p className="font-semibold mb-1">Games:</p>
                      {player.games.map((game) => (
                        <p key={game.id}>🎮 {game.name}</p>
                      ))}
                    </div>
                  )}
                  {player.country && <p>🌍 {player.country}</p>}
                  <p>👥 {player.rosterMemberships.length} teams</p>
                </div>
              </div>
            ))}
          </div>
        )}
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
