'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'stages' | 'teams'>('details');
  const [stages, setStages] = useState<any[]>([]);
  const [showStageForm, setShowStageForm] = useState(false);
  const [stageFormData, setStageFormData] = useState({
    name: '',
    order: 1,
    type: 'SINGLE_ELIMINATION',
    bestOf: 3,
  });
  const [teams, setTeams] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentRes, gamesRes, stagesRes, teamsRes, participantsRes] = await Promise.all([
          fetch(`/api/tournaments/${params.id}`),
          fetch('/api/games'),
          fetch(`/api/stages?tournamentId=${params.id}`),
          fetch('/api/teams'),
          fetch(`/api/participants?tournamentId=${params.id}`),
        ]);

        if (!tournamentRes.ok) throw new Error('Tournament not found');
        if (!gamesRes.ok) throw new Error('Failed to load games');
        if (!stagesRes.ok) throw new Error('Failed to load stages');
        if (!teamsRes.ok) throw new Error('Failed to load teams');
        if (!participantsRes.ok) throw new Error('Failed to load participants');

        const tournamentData = await tournamentRes.json();
        const gamesData = await gamesRes.json();
        const stagesData = await stagesRes.json();
        const teamsData = await teamsRes.json();
        const participantsData = await participantsRes.json();

        setTournament(tournamentData);
        setGames(gamesData);
        setStages(stagesData);
        setAllTeams(teamsData);
        setTeams(participantsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load tournament');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
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

  const handleDelete = async () => {
    if (!tournament) return;
    if (!confirm('Are you sure you want to delete this tournament? This cannot be undone.')) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/tournaments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: tournament.id }),
      });

      if (!res.ok) throw new Error('Failed to delete tournament');

      alert('Tournament deleted successfully');
      router.push('/admin');
    } catch (error) {
      console.error('Error deleting tournament:', error);
      setError('Failed to delete tournament. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

    setSubmitting(true);

    try {
      const res = await fetch('/api/stages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...stageFormData,
          tournamentId: tournament.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to create stage');

      const newStage = await res.json();
      setStages((prev) => [...prev, newStage]);
      setStageFormData({
        name: '',
        order: 1,
        type: 'SINGLE_ELIMINATION',
        bestOf: 3,
      });
      setShowStageForm(false);
    } catch (error) {
      console.error('Error creating stage:', error);
      alert('Failed to create stage');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!confirm('Delete this stage?')) return;

    try {
      const res = await fetch('/api/stages', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: stageId }),
      });

      if (!res.ok) throw new Error('Failed to delete stage');

      setStages((prev) => prev.filter((s) => s.id !== stageId));
    } catch (error) {
      console.error('Error deleting stage:', error);
      alert('Failed to delete stage');
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament || !selectedTeamId) return;

    setSubmitting(true);

    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tournamentId: tournament.id,
          teamId: selectedTeamId,
          seed: teams.length + 1,
        }),
      });

      if (!res.ok) throw new Error('Failed to add team');

      const newTeam = await res.json();
      setTeams((prev) => [...prev, newTeam]);
      setSelectedTeamId('');
      setShowTeamForm(false);
    } catch (error) {
      console.error('Error adding team:', error);
      alert('Failed to add team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveTeam = async (participantId: string) => {
    if (!confirm('Remove this team?')) return;

    try {
      const res = await fetch('/api/participants', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: participantId }),
      });

      if (!res.ok) throw new Error('Failed to remove team');

      setTeams((prev) => prev.filter((t) => t.id !== participantId));
    } catch (error) {
      console.error('Error removing team:', error);
      alert('Failed to remove team');
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
                    style={{ colorScheme: 'dark' }}
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
                      style={{ colorScheme: 'dark' }}
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
                      style={{ colorScheme: 'dark' }}
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

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-2 rounded-lg transition"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white font-semibold px-6 py-2 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'stages' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Tournament Stages</h3>
                  <button
                    onClick={() => setShowStageForm(!showStageForm)}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg"
                  >
                    {showStageForm ? '✕ Cancel' : '+ Add Stage'}
                  </button>
                </div>

                {showStageForm && (
                  <form onSubmit={handleCreateStage} className="bg-indigo-500/20 rounded-lg p-6 mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Stage Name</label>
                      <input
                        type="text"
                        value={stageFormData.name}
                        onChange={(e) =>
                          setStageFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                        placeholder="e.g., Group Stage, Playoffs"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Order</label>
                        <input
                          type="number"
                          value={stageFormData.order}
                          onChange={(e) =>
                            setStageFormData((prev) => ({
                              ...prev,
                              order: parseInt(e.target.value),
                            }))
                          }
                          className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Type</label>
                        <select
                          value={stageFormData.type}
                          onChange={(e) =>
                            setStageFormData((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                          style={{ colorScheme: 'dark' }}
                        >
                          <option value="SINGLE_ELIMINATION">Single Elim</option>
                          <option value="DOUBLE_ELIMINATION">Double Elim</option>
                          <option value="ROUND_ROBIN">Round Robin</option>
                          <option value="SWISS">Swiss</option>
                          <option value="GROUP">Group</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Best Of</label>
                        <input
                          type="number"
                          value={stageFormData.bestOf}
                          onChange={(e) =>
                            setStageFormData((prev) => ({
                              ...prev,
                              bestOf: parseInt(e.target.value),
                            }))
                          }
                          className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                          min="1"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-2 rounded-lg"
                    >
                      {submitting ? 'Creating...' : 'Create Stage'}
                    </button>
                  </form>
                )}

                {stages.length === 0 ? (
                  <p className="text-indigo-200 text-center py-8">No stages yet. Create one to get started!</p>
                ) : (
                  <div className="space-y-3">
                    {stages.map((stage) => (
                      <div key={stage.id} className="bg-indigo-500/20 rounded-lg p-4 flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{stage.name || `Stage ${stage.order}`}</h4>
                          <p className="text-sm text-indigo-200">
                            {stage.type.replace(/_/g, ' ')} • Order: {stage.order} • Best of {stage.bestOf}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteStage(stage.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'teams' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Tournament Teams</h3>
                  <button
                    onClick={() => setShowTeamForm(!showTeamForm)}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg"
                  >
                    {showTeamForm ? '✕ Cancel' : '+ Add Team'}
                  </button>
                </div>

                {showTeamForm && (
                  <form onSubmit={handleAddTeam} className="bg-indigo-500/20 rounded-lg p-6 mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Select Team *</label>
                      <select
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        required
                        className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="">Choose a team</option>
                        {allTeams
                          .filter((t) => !teams.some((tm) => tm.teamId === t.id))
                          .map((team) => (
                            <option key={team.id} value={team.id}>
                              {team.name} ({team.tag})
                            </option>
                          ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-2 rounded-lg"
                    >
                      {submitting ? 'Adding...' : 'Add Team'}
                    </button>
                  </form>
                )}

                {teams.length === 0 ? (
                  <p className="text-indigo-200 text-center py-8">No teams registered yet. Add teams to participate!</p>
                ) : (
                  <div className="space-y-3">
                    {teams.map((team, idx) => (
                      <div key={team.id} className="bg-indigo-500/20 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">
                            {idx + 1}. {team.team.name} ({team.team.tag})
                          </h4>
                          <p className="text-sm text-indigo-200">Seed: {team.seed || idx + 1}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveTeam(team.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
