'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';

interface Tournament {
  id: string;
  name: string;
  game: {
    id: string;
    name: string;
  };
  status: string;
  startDate: string;
  endDate: string | null;
  location: string | null;
  prizePool: number | null;
  description: string | null;
  organizer: string | null;
  tier: string | null;
  stages: Stage[];
  participants: Participant[];
}

interface Stage {
  id: string;
  name: string | null;
  type: string;
  order: number;
  bestOf: number | null;
  matches: Match[];
}

interface Match {
  id: string;
  round: number;
  position: number | null;
  status: string;
  winner: string | null;
  participants: MatchParticipant[];
}

interface MatchParticipant {
  id: string;
  side: string;
  mapWins: number;
  participant: Participant;
}

interface Participant {
  id: string;
  seed: number | null;
  placement: number | null;
  prize: number | null;
  team: {
    id: string;
    name: string;
    tag: string;
  };
}

export default function TournamentDetailPage() {
  const params = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateStandings = (tournament: Tournament) => {
    const standings: {
      participantId: string;
      teamName: string;
      teamTag: string;
      wins: number;
      losses: number;
    }[] = [];

    tournament.participants.forEach((participant) => {
      standings.push({
        participantId: participant.id,
        teamName: participant.team.name,
        teamTag: participant.team.tag,
        wins: 0,
        losses: 0,
      });
    });

    tournament.stages.forEach((stage) => {
      stage.matches.forEach((match) => {
        if (match.winner) {
          match.participants.forEach((mp) => {
            const standingEntry = standings.find(
              (s) => s.participantId === mp.participant.id
            );
            if (standingEntry) {
              if (mp.participant.id === match.winner) {
                standingEntry.wins++;
              } else {
                standingEntry.losses++;
              }
            }
          });
        }
      });
    });

    return standings.sort((a, b) => b.wins - a.wins);
  };

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await fetch(`/api/tournaments/${params.id}`);
        const data = await res.json();
        setTournament(data);
      } catch (error) {
        console.error('Error fetching tournament:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchTournament();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading tournament...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
        <nav className="border-b border-indigo-400/30 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              Hermi
            </Link>
            <Link href="/tournaments" className="text-white hover:text-indigo-200">
              Back to Tournaments
            </Link>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-white text-lg">Tournament not found</p>
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
          <div className="flex gap-4">
            <Link href="/tournaments" className="text-white hover:text-indigo-200">
              Tournaments
            </Link>
            <Link href="/admin" className="text-white hover:text-indigo-200">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{tournament.name}</h1>
              <p className="text-indigo-200">{tournament.game.name}</p>
            </div>
            <span className="bg-indigo-500 px-4 py-2 rounded-lg text-sm font-semibold">
              {tournament.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Tournament Info</h3>
              <div className="space-y-2 text-sm text-indigo-100">
                <p>📅 Starts: {format(new Date(tournament.startDate), 'MMM dd, yyyy HH:mm')}</p>
                {tournament.endDate && (
                  <p>📅 Ends: {format(new Date(tournament.endDate), 'MMM dd, yyyy HH:mm')}</p>
                )}
                {tournament.location && <p>📍 {tournament.location}</p>}
                {tournament.tier && <p>🏆 Tier: {tournament.tier}</p>}
                {tournament.prizePool && <p>💰 Prize Pool: ${tournament.prizePool.toLocaleString()}</p>}
                {tournament.organizer && <p>👤 Organizer: {tournament.organizer}</p>}
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-semibold mb-4">Standings</h3>
              <div className="bg-white/5 rounded-lg overflow-hidden">
                <div className="space-y-2">
                  {calculateStandings(tournament).length > 0 ? (
                    calculateStandings(tournament).map((standing, index) => (
                      <div
                        key={standing.participantId}
                        className="flex items-center justify-between p-3 hover:bg-white/10 transition"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-bold text-lg w-8 text-indigo-300">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold">{standing.teamName}</p>
                            <p className="text-xs text-indigo-300">
                              {standing.teamTag}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-semibold">
                            {standing.wins}-{standing.losses}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-indigo-200 p-3">No completed matches yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {tournament.description && (
            <div className="mb-8">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-indigo-100">{tournament.description}</p>
            </div>
          )}
        </div>

        {tournament.stages.length > 0 ? (
          <div className="space-y-8">
            {tournament.stages
              .sort((a, b) => a.order - b.order)
              .map((stage) => (
                <div
                  key={stage.id}
                  className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white"
                >
                  <h2 className="text-2xl font-bold mb-4">{stage.name || 'Stage'}</h2>
                  <p className="text-indigo-200 mb-6">Format: {stage.type}</p>

                  {stage.matches.length > 0 ? (
                    <div className="space-y-3">
                      {stage.matches.map((match) => (
                        <div
                          key={match.id}
                          className="bg-white/5 rounded-lg p-4 border border-indigo-400/20"
                        >
                          <div className="flex justify-between items-center gap-4">
                            <div className="flex-1">
                              {match.participants.map((mp) => (
                                <div
                                  key={mp.id}
                                  className={`p-2 ${
                                    mp.side === 'A'
                                      ? 'border-b border-indigo-400/20'
                                      : ''
                                  }`}
                                >
                                  <p className="font-semibold">
                                    {mp.participant.team.name}
                                  </p>
                                  <p className="text-sm text-indigo-200">
                                    {mp.participant.team.tag}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-indigo-200 mb-2">
                                {match.status}
                              </p>
                              {match.winner && (
                                <p className="text-green-400 font-bold">✓ Complete</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-indigo-200">No matches scheduled yet</p>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-center text-white">
            <p className="text-indigo-200">No stages or matches created yet</p>
            <Link
              href="/admin"
              className="mt-4 inline-block bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-50"
            >
              Go to Admin Panel
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
