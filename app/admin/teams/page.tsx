'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
  tag: string;
  region: string | null;
  game: {
    id: string;
    name: string;
  };
  rosterMemberships: any[];
}

interface Game {
  id: string;
  name: string;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    region: '',
    logo: '',
    gameId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, teamsRes] = await Promise.all([
          fetch('/api/games'),
          fetch('/api/teams'),
        ]);

        const gamesData = await gamesRes.json();
        const teamsData = await teamsRes.json();

        setGames(gamesData);
        setTeams(teamsData);

        if (gamesData.length > 0) {
          setSelectedGame(gamesData[0].id);
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
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to create team');

      const newTeam = await res.json();
      setTeams((prev) => [...prev, newTeam]);
      setFormData({
        name: '',
        tag: '',
        region: '',
        logo: '',
        gameId: formData.gameId,
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeams = teams.filter((team) =>
    selectedGame ? team.game.id === selectedGame : true
  );

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
            <h1 className="text-4xl font-bold text-white">Manage Teams</h1>
            <p className="text-indigo-100">Create teams globally • Assign to tournaments from tournament edit page</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg"
          >
            {showForm ? '✕ Cancel' : '+ Add Team'}
          </button>
        </div>

        <div className="bg-blue-500/20 border border-blue-400/30 backdrop-blur-lg rounded-lg p-6 text-white mb-8">
          <p className="text-sm">
            💡 <strong>Workflow:</strong> Create teams here → Go to Admin → Tournaments → Teams tab → Add your team
          </p>
        </div>

        {showForm && (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                    placeholder="Team name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Tag *
                  </label>
                  <input
                    type="text"
                    name="tag"
                    value={formData.tag}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                    placeholder="Team tag"
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
                    Region
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                    placeholder="e.g., NA, EU"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-2 rounded-lg"
                >
                  {submitting ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white mb-8">
          <label className="block text-sm font-semibold mb-2">Filter by Game</label>
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
          >
            <option value="">All Games</option>
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-12 text-center text-white">
            <p className="text-indigo-200">No teams yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white hover:bg-white/20 transition"
              >
                <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                <p className="text-indigo-200 text-sm mb-4">{team.tag}</p>
                <div className="space-y-2 text-sm text-indigo-100">
                  <p>🎮 {team.game.name}</p>
                  {team.region && <p>📍 {team.region}</p>}
                  <p>👥 {team.rosterMemberships.length} players</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
