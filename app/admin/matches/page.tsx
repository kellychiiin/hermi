'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface MatchParticipant {
  id: string;
  side: string;
  participant: {
    id: string;
    team: {
      id: string;
      name: string;
      tag: string;
    };
  };
}

interface Match {
  id: string;
  stageId: string;
  round: number;
  position: number | null;
  bestOf: number;
  scheduledAt: string | null;
  status: string;
  winner: string | null;
  participants: MatchParticipant[];
  mapResults: MapResult[];
  stage: {
    id: string;
    name: string | null;
    type: string;
    tournament: {
      id: string;
      name: string;
    };
  };
}

interface Tournament {
  id: string;
  name: string;
}

interface MapResult {
  id: string;
  mapName: string | null;
  mapOrder: number;
  scoreA: number;
  scoreB: number;
  winner: string | null;
}

const MATCH_STATUSES = ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'];

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState('');
  const [matchWinner, setMatchWinner] = useState('');

  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [quickScoreMatchId, setQuickScoreMatchId] = useState<string | null>(null);
  const [quickScoreData, setQuickScoreData] = useState({
    scoreA: 0,
    scoreB: 0,
  });
  const [mapFormData, setMapFormData] = useState({
    scoreA: 0,
    scoreB: 0,
    winner: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, tournamentsRes] = await Promise.all([
          fetch('/api/matches'),
          fetch('/api/tournaments'),
        ]);
        const matchesData = await matchesRes.json();
        const tournamentsData = await tournamentsRes.json();
        setMatches(matchesData);
        setTournaments(tournamentsData);
        if (tournamentsData.length > 0) {
          setSelectedTournament(tournamentsData[0].id);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateMatch = async (matchId: string) => {
    try {
      const res = await fetch('/api/matches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: matchId,
          status: matchStatus,
          winner: matchWinner || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to update match');

      const updated = await res.json();
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? updated : m))
      );
      setEditingMatchId(null);
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Failed to update match');
    }
  };

  const handleUpdateMapResult = async (mapId: string) => {
    try {
      const res = await fetch('/api/map-results', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: mapId,
          ...mapFormData,
        }),
      });

      if (!res.ok) throw new Error('Failed to update map result');

      const updated = await res.json();
      setMatches((prev) =>
        prev.map((m) => ({
          ...m,
          mapResults: m.mapResults.map((mr) =>
            mr.id === mapId ? updated : mr
          ),
        }))
      );
      setEditingMapId(null);
    } catch (error) {
      console.error('Error updating map result:', error);
      alert('Failed to update map result');
    }
  };

  const handleQuickScore = async (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const teamA = match.participants.find((p) => p.side === 'A');
    const teamB = match.participants.find((p) => p.side === 'B');
    if (!teamA || !teamB) return;

    const totalMaps = quickScoreData.scoreA + quickScoreData.scoreB;
    if (totalMaps === 0) {
      alert('Enter at least one map result');
      return;
    }

    try {
      const winner = quickScoreData.scoreA > quickScoreData.scoreB ? teamA.participant.id : teamB.participant.id;

      await fetch('/api/matches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: matchId,
          status: 'COMPLETED',
          winner,
        }),
      });

      for (let i = 0; i < totalMaps; i++) {
        const isTeamAWinner = i < quickScoreData.scoreA;
        await fetch('/api/map-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            matchId,
            mapName: `Map ${i + 1}`,
            mapOrder: i + 1,
            scoreA: isTeamAWinner ? 1 : 0,
            scoreB: isTeamAWinner ? 0 : 1,
            winner: isTeamAWinner ? teamA.participant.id : teamB.participant.id,
          }),
        });
      }

      const res = await fetch('/api/matches');
      const updated = await res.json();
      setMatches(updated);

      setQuickScoreMatchId(null);
      setQuickScoreData({ scoreA: 0, scoreB: 0 });
    } catch (error) {
      console.error('Error setting quick score:', error);
      alert('Failed to set match score');
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('Delete this match? This action cannot be undone.')) return;

    try {
      const res = await fetch('/api/matches', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: matchId }),
      });

      if (!res.ok) throw new Error('Failed to delete match');

      setMatches((prev) => prev.filter((m) => m.id !== matchId));
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Failed to delete match');
    }
  };

  const filteredMatches = selectedTournament
    ? matches.filter((m) => m.stage.tournament.id === selectedTournament)
    : matches;

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Match Scoring</h1>
          <p className="text-indigo-100">Update match results and scores</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white mb-8">
          <label className="block text-sm font-semibold mb-2">
            Filter by Tournament
          </label>
          <select
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
            className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
          >
            <option value="">All Tournaments</option>
            {tournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-12 text-center text-white">
            <p className="text-indigo-200">No matches yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMatches.map((match) => {
              const teamA = match.participants.find((p) => p.side === 'A');
              const teamB = match.participants.find((p) => p.side === 'B');
              const isEditing = editingMatchId === match.id;

              return (
                <div
                  key={match.id}
                  className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white"
                >
                  <div className="mb-4">
                    <p className="text-sm text-indigo-200">
                      {match.stage.tournament.name} • {match.stage.name || `Stage ${match.round}`}
                    </p>
                    <h2 className="text-2xl font-bold mt-2">
                      {teamA?.participant.team.name || 'TBD'} vs{' '}
                      {teamB?.participant.team.name || 'TBD'}
                    </h2>
                  </div>

                  {match.scheduledAt && (
                    <p className="text-sm text-indigo-200 mb-4">
                      📅 {format(new Date(match.scheduledAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Status
                      </label>
                      {isEditing ? (
                        <select
                          value={matchStatus}
                          onChange={(e) => setMatchStatus(e.target.value)}
                          className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                        >
                          {MATCH_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="bg-indigo-500 px-4 py-2 rounded-lg inline-block">
                          {match.status}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Winner
                      </label>
                      {isEditing ? (
                        <select
                          value={matchWinner}
                          onChange={(e) => setMatchWinner(e.target.value)}
                          className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400"
                        >
                          <option value="">No Winner</option>
                          {teamA && (
                            <option value={teamA.participant.id}>
                              {teamA.participant.team.name}
                            </option>
                          )}
                          {teamB && (
                            <option value={teamB.participant.id}>
                              {teamB.participant.team.name}
                            </option>
                          )}
                        </select>
                      ) : (
                        <span className="text-indigo-200">
                          {match.winner
                            ? match.participants.find(
                                (p) => p.participant.id === match.winner
                              )?.participant.team.name
                            : 'TBD'}
                        </span>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 mb-6">
                      <button
                        onClick={() =>
                          handleUpdateMatch(match.id)
                        }
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingMatchId(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex gap-2 mb-6">
                      <button
                        onClick={() => {
                          setEditingMatchId(match.id);
                          setMatchStatus(match.status);
                          setMatchWinner(match.winner || '');
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg"
                      >
                        Edit Match
                      </button>
                      <button
                        onClick={() => handleDeleteMatch(match.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg"
                      >
                        Delete Match
                      </button>
                    </div>
                  )}

                  {quickScoreMatchId === match.id ? (
                    <div className="bg-white/5 rounded-lg p-4 mb-6 border border-green-400/30">
                      <h3 className="font-bold mb-3">🏆 Quick Score (Best of {match.bestOf})</h3>
                      <p className="text-xs text-indigo-300 mb-4">
                        Enter the final score for this match (e.g., 2-1 means Team A won 2 maps, Team B won 1)
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            {teamA?.participant.team.tag || 'Team A'} Wins
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={match.bestOf}
                            value={quickScoreData.scoreA}
                            onChange={(e) =>
                              setQuickScoreData((prev) => ({
                                ...prev,
                                scoreA: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400 text-center text-xl font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            {teamB?.participant.team.tag || 'Team B'} Wins
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={match.bestOf}
                            value={quickScoreData.scoreB}
                            onChange={(e) =>
                              setQuickScoreData((prev) => ({
                                ...prev,
                                scoreB: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-full bg-white/10 border border-indigo-400/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-400 text-center text-xl font-bold"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleQuickScore(match.id)
                          }
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg"
                        >
                          Set Score
                        </button>
                        <button
                          onClick={() => setQuickScoreMatchId(null)}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setQuickScoreMatchId(match.id);
                        setQuickScoreData({ scoreA: 0, scoreB: 0 });
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg mb-6"
                    >
                      ⚡ Quick Score
                    </button>
                  )}

                  <div className="border-t border-indigo-400/20 pt-6">
                    <h3 className="font-bold mb-4">Map Results</h3>

                    {match.mapResults.length === 0 ? (
                      <p className="text-indigo-200 text-sm">
                        No map results yet
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {match.mapResults.map((mapResult) => {
                          const isEditingMap = editingMapId === mapResult.id;

                          return (
                            <div
                              key={mapResult.id}
                              className="bg-white/5 rounded-lg p-4"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <p className="font-semibold">
                                  Map {mapResult.mapOrder}:{' '}
                                  {mapResult.mapName || 'Unknown'}
                                </p>
                                {!isEditingMap && (
                                  <button
                                    onClick={() => {
                                      setEditingMapId(mapResult.id);
                                      setMapFormData({
                                        scoreA: mapResult.scoreA,
                                        scoreB: mapResult.scoreB,
                                        winner: mapResult.winner || '',
                                      });
                                    }}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>

                              {isEditingMap ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs text-indigo-200 mb-1">
                                        {teamA?.participant.team.tag || 'Team A'} Score
                                      </label>
                                      <input
                                        type="number"
                                        value={mapFormData.scoreA}
                                        onChange={(e) =>
                                          setMapFormData((prev) => ({
                                            ...prev,
                                            scoreA: parseInt(e.target.value),
                                          }))
                                        }
                                        className="w-full bg-white/10 border border-indigo-400/30 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs text-indigo-200 mb-1">
                                        {teamB?.participant.team.tag || 'Team B'} Score
                                      </label>
                                      <input
                                        type="number"
                                        value={mapFormData.scoreB}
                                        onChange={(e) =>
                                          setMapFormData((prev) => ({
                                            ...prev,
                                            scoreB: parseInt(e.target.value),
                                          }))
                                        }
                                        className="w-full bg-white/10 border border-indigo-400/30 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-400"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleUpdateMapResult(
                                          mapResult.id
                                        )
                                      }
                                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-2 rounded text-sm"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() =>
                                        setEditingMapId(null)
                                      }
                                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-3 py-2 rounded text-sm"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-center">
                                  <span className="text-lg">
                                    {mapResult.scoreA} - {mapResult.scoreB}
                                  </span>
                                  {mapResult.winner && (
                                    <span className="text-sm text-green-400">
                                      ✓ Completed
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
