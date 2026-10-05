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

interface Team {
  id: string;
  name: string;
  tag: string;
}

interface Participant {
  id: string;
  teamId: string;
  team: Team;
  seed: number | null;
}

interface Stage {
  id: string;
  name: string | null;
  order: number;
  type: string;
  bestOf: number | null;
}

export default function EditTournamentPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'stages' | 'teams'>('details');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedTeamSeed, setSelectedTeamSeed] = useState('');
  const [showStageForm, setShowStageForm] = useState(false);
  const [stageFormData, setStageFormData] = useState({
    name: '',
    order: 1,
    type: 'ROUND_ROBIN',
    bestOf: 1,
  });

  const handleLogout = () => {
    document.cookie = 'isAuthenticated=; path=/; max-age=0';
    document.cookie = 'userRole=; path=/; max-age=0';
    router.push('/login');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentRes, gamesRes, teamsRes, stagesRes] = await Promise.all([
          fetch(`/api/tournaments/${params.id}`),
          fetch('/api/games'),
          fetch('/api/teams'),
          fetch(`/api/stages?tournamentId=${params.id}`),
        ]);

        if (!tournamentRes.ok) throw new Error('Tournament not found');
        if (!gamesRes.ok) throw new Error('Failed to load games');
        if (!stagesRes.ok) throw new Error('Failed to load stages');
        if (!teamsRes.ok) throw new Error('Failed to load teams');

        const tournamentData = await tournamentRes.json();
        const gamesData = await gamesRes.json();
        const teamsData = await teamsRes.json();
        const stagesData = await stagesRes.json();

        setTournament(tournamentData);
        setGames(gamesData);
        setTeams(teamsData);
        setParticipants(tournamentData.participants || []);
        setStages(stagesData);

        if (teamsData.length > 0) {
          setSelectedTeamId(teamsData[0].id);
        }
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

  const handleAddTeam = async () => {
    if (!tournament || !selectedTeamId) return;

    try {
      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tournamentId: tournament.id,
          teamId: selectedTeamId,
          seed: selectedTeamSeed ? parseInt(selectedTeamSeed) : null,
        }),
      });

      if (!res.ok) throw new Error('Failed to add team');

      const newParticipant = await res.json();
      setParticipants((prev) => [...prev, newParticipant]);
      setSelectedTeamSeed('');
    } catch (error) {
      console.error('Error adding team:', error);
      alert('Failed to add team');
    }
  };

  const handleRemoveTeam = async (participantId: string) => {
    if (!confirm('Remove this team from the tournament?')) return;

    try {
      const res = await fetch('/api/participants', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: participantId }),
      });

      if (!res.ok) throw new Error('Failed to remove team');

      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    } catch (error) {
      console.error('Error removing team:', error);
      alert('Failed to remove team');
    }
  };

  const handleStageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setStageFormData((prev) => ({
      ...prev,
      [name]: name === 'order' || name === 'bestOf' ? parseInt(value) : value,
    }));
  };

  const handleCreateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;

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
        order: stages.length + 1,
        type: 'ROUND_ROBIN',
        bestOf: 1,
      });
      setShowStageForm(false);
    } catch (error) {
      console.error('Error creating stage:', error);
      alert('Failed to create stage');
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

  const handleDeleteTournament = async () => {
    if (!tournament) return;
    if (!confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/tournaments/${tournament.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to delete tournament');

      alert('Tournament deleted successfully');
      router.push('/admin');
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('Failed to delete tournament');
    }
  };

  const handleAutoGenerateStages = async () => {
    if (!tournament || participants.length === 0) {
      alert('Please add teams first');
      return;
    }

    if (stages.length > 0) {
      if (!confirm('This will delete existing stages. Continue?')) return;
      for (const stage of stages) {
        await handleDeleteStage(stage.id);
      }
    }

    const teamCount = participants.length;
    const stagesToCreate = [];

    if (teamCount === 3) {
      stagesToCreate.push(
        { name: 'Group Stage', order: 1, type: 'ROUND_ROBIN', bestOf: 1 },
        { name: 'Finals', order: 2, type: 'SINGLE_ELIMINATION', bestOf: 3 }
      );
    } else if (teamCount === 4) {
      stagesToCreate.push(
        { name: 'Group Stage', order: 1, type: 'ROUND_ROBIN', bestOf: 1 },
        { name: 'Playoffs', order: 2, type: 'SINGLE_ELIMINATION', bestOf: 3 }
      );
    } else if (teamCount <= 8) {
      stagesToCreate.push(
        { name: 'Group Stage', order: 1, type: 'ROUND_ROBIN', bestOf: 1 },
        { name: 'Playoffs', order: 2, type: 'SINGLE_ELIMINATION', bestOf: 3 }
      );
    } else {
      stagesToCreate.push(
        { name: 'Group Stage', order: 1, type: 'GROUP', bestOf: 1 },
        { name: 'Playoffs', order: 2, type: 'SINGLE_ELIMINATION', bestOf: 3 }
      );
    }

    try {
      for (const stageData of stagesToCreate) {
        const res = await fetch('/api/stages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...stageData,
            tournamentId: tournament.id,
          }),
        });

        if (!res.ok) throw new Error('Failed to create stage');
        const newStage = await res.json();
        setStages((prev) => [...prev, newStage]);
      }

      alert(`Auto-generated ${stagesToCreate.length} stages for ${teamCount} teams`);
    } catch (error) {
      console.error('Error auto-generating stages:', error);
      alert('Failed to auto-generate stages');
    }
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
          <div className="flex gap-4 items-center">
            <Link href="/admin" className="text-white hover:text-indigo-200">
              Back to Admin
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Logout
            </button>
          </div>
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

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-2 rounded-lg transition"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteTournament}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
                  >
                    Delete Tournament
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'stages' && (
              <div className="space-y-6">
                {!showStageForm ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowStageForm(true);
                        setStageFormData({
                          name: '',
                          order: stages.length + 1,
                          type: 'ROUND_ROBIN',
                          bestOf: 1,
                        });
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg"
                    >
                      + Add Stage
                    </button>
                    <button
                      onClick={handleAutoGenerateStages}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg"
                    >
                      ⚡ Auto-Generate
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCreateStage} className="bg-white/5 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Stage Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={stageFormData.name}
                          onChange={handleStageChange}
                          className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                          placeholder="e.g., Group Stage"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Order
                        </label>
                        <input
                          type="number"
                          name="order"
                          value={stageFormData.order}
                          onChange={handleStageChange}
                          min="1"
                          className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Type
                        </label>
                        <select
                          name="type"
                          value={stageFormData.type}
                          onChange={handleStageChange}
                          className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                        >
                          <option value="ROUND_ROBIN">Round Robin</option>
                          <option value="SINGLE_ELIMINATION">Single Elimination</option>
                          <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                          <option value="SWISS">Swiss</option>
                          <option value="GROUP">Group</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Best Of
                        </label>
                        <input
                          type="number"
                          name="bestOf"
                          value={stageFormData.bestOf}
                          onChange={handleStageChange}
                          min="1"
                          className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg"
                      >
                        Create Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowStageForm(false)}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div>
                  <h3 className="font-semibold mb-4">Tournament Stages ({stages.length})</h3>
                  {stages.length === 0 ? (
                    <p className="text-indigo-200">No stages created yet</p>
                  ) : (
                    <div className="space-y-3">
                      {stages.map((stage) => (
                        <div
                          key={stage.id}
                          className="bg-white/5 rounded-lg p-4 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-semibold">
                              {stage.name || `Stage ${stage.order}`}
                            </p>
                            <p className="text-sm text-indigo-200">
                              {stage.type.replace(/_/g, ' ')} • Best of {stage.bestOf || 1}
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
              </div>
            )}

            {activeTab === 'teams' && (
              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Add Teams to Tournament</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Select Team
                      </label>
                      <select
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                      >
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name} ({team.tag})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Seed (Optional)
                      </label>
                      <input
                        type="number"
                        value={selectedTeamSeed}
                        onChange={(e) => setSelectedTeamSeed(e.target.value)}
                        className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                        placeholder="e.g., 1, 2, 3..."
                      />
                    </div>
                    <button
                      onClick={handleAddTeam}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg"
                    >
                      + Add Team
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">
                    Registered Teams ({participants.length})
                  </h3>
                  {participants.length === 0 ? (
                    <p className="text-indigo-200">No teams registered yet</p>
                  ) : (
                    <div className="space-y-2">
                      {participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex justify-between items-center bg-white/5 rounded-lg p-4"
                        >
                          <div>
                            <p className="font-semibold">
                              {participant.team.name}
                            </p>
                            <p className="text-sm text-indigo-200">
                              {participant.team.tag}
                              {participant.seed && ` • Seed ${participant.seed}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveTeam(participant.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
