'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Player {
  id: string;
  handle: string;
  realName: string | null;
  game: {
    id: string;
    name: string;
  };
}

interface Team {
  id: string;
  name: string;
  tag: string;
  game: {
    id: string;
    name: string;
  };
}

interface RosterMembership {
  id: string;
  playerId: string;
  teamId: string;
  role: string | null;
  startDate: string;
  endDate: string | null;
  player: Player;
  team: Team;
}

export default function RostersPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rosters, setRosters] = useState<RosterMembership[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    playerId: '',
    teamId: '',
    role: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, playersRes, rostersRes] = await Promise.all([
          fetch('/api/teams'),
          fetch('/api/players'),
          fetch('/api/roster-memberships'),
        ]);

        const teamsData = await teamsRes.json();
        const playersData = await playersRes.json();
        const rostersData = await rostersRes.json();

        setTeams(teamsData);
        setPlayers(playersData);
        setRosters(rostersData);

        if (teamsData.length > 0) {
          setSelectedTeam(teamsData[0].id);
          setFormData((prev) => ({ ...prev, teamId: teamsData[0].id }));
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
      const res = await fetch('/api/roster-memberships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to add player to roster');

      const newMembership = await res.json();
      setRosters((prev) => [...prev, newMembership]);
      setFormData({
        playerId: '',
        teamId: formData.teamId,
        role: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding to roster:', error);
      alert('Failed to add player to roster');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove player from roster?')) return;

    setSubmitting(true);

    try {
      const res = await fetch('/api/roster-memberships', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: memberId }),
      });

      if (!res.ok) throw new Error('Failed to remove player');

      setRosters((prev) => prev.filter((r) => r.id !== memberId));
    } catch (error) {
      console.error('Error removing player:', error);
      alert('Failed to remove player');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTeamData = teams.find((t) => t.id === selectedTeam);
  const teamRoster = rosters.filter((r) => r.teamId === selectedTeam);

  const availablePlayers = players.filter((p) =>
    !teamRoster.some((r) => r.playerId === p.id)
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
            <h1 className="text-4xl font-bold text-white">Manage Rosters</h1>
            <p className="text-indigo-100">Add players to team rosters</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg"
          >
            {showForm ? '✕ Cancel' : '+ Add Player'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
              <label className="block text-sm font-semibold mb-4">
                Select Team
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => {
                  setSelectedTeam(e.target.value);
                  setFormData((prev) => ({ ...prev, teamId: e.target.value }));
                }}
                className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400 mb-6"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.tag})
                  </option>
                ))}
              </select>

              {selectedTeamData && (
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-indigo-200">🎮 {selectedTeamData.game.name}</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {showForm && (
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white mb-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Player *
                    </label>
                    <select
                      name="playerId"
                      value={formData.playerId}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                    >
                      <option value="">Select a player</option>
                      {availablePlayers.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.handle}{player.realName ? ` (${player.realName})` : ''} • {player.game.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                      placeholder="e.g., IGL, Support, Main"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-2 rounded-lg"
                    >
                      {submitting ? 'Adding...' : 'Add to Roster'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">
                Team Roster ({teamRoster.length})
              </h2>

              {teamRoster.length === 0 ? (
                <p className="text-indigo-200">No players in this team yet</p>
              ) : (
                <div className="space-y-3">
                  {teamRoster.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white/5 rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold">{member.player.handle}</p>
                        {member.player.realName && (
                          <p className="text-sm text-indigo-200">
                            {member.player.realName}
                          </p>
                        )}
                        {member.role && (
                          <p className="text-xs text-indigo-300 mt-1">
                            Role: {member.role}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
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
