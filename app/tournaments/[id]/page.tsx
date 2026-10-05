'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
  participants?: Participant[];
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
  stageId: string | null;
  team: {
    id: string;
    name: string;
    tag: string;
    rosterMemberships?: Array<{
      player: {
        id: string;
        handle: string;
        realName: string | null;
        photo: string | null;
      };
    }>;
  };
}

interface StandingEntry {
  participantId: string;
  teamName: string;
  teamTag: string;
  wins: number;
  losses: number;
  stageName: string;
}

function getTournamentWinner(tournament: Tournament): Participant | null {
  if (tournament.stages.length === 0) return null;

  const lastStage = tournament.stages[tournament.stages.length - 1];
  if (lastStage.matches.length === 0) return null;

  const lastMatch = lastStage.matches[lastStage.matches.length - 1];
  if (!lastMatch.winner) return null;

  for (const mp of lastMatch.participants) {
    if (mp.participant.id === lastMatch.winner) {
      return mp.participant;
    }
  }

  return null;
}

function calculateStandingsByStage(tournament: Tournament): Record<string, StandingEntry[]> {
  const standingsByStage: Record<string, StandingEntry[]> = {};

  if (!tournament.participants || !tournament.stages) {
    return standingsByStage;
  }

  const tournamentLevelParticipants = tournament.participants.filter((p) => !p.stageId);

  for (const stage of tournament.stages) {
    const stageName = stage.name || `Stage ${stage.order}`;

    const teamStats: Record<string, { wins: number; losses: number }> = {};

    const stageParticipants = stage.participants && stage.participants.length > 0
      ? stage.participants
      : tournamentLevelParticipants;

    for (const participant of stageParticipants) {
      teamStats[participant.id] = { wins: 0, losses: 0 };
    }

    if (!stage.matches || stage.matches.length === 0) {
      continue;
    }

    for (const match of stage.matches) {
      if (match.status === 'COMPLETED' && match.winner && match.participants) {
        for (const mp of match.participants) {
          if (mp.participant?.id === match.winner) {
            if (teamStats[mp.participant.id]) {
              teamStats[mp.participant.id].wins++;
            }
          } else if (mp.participant?.id) {
            if (teamStats[mp.participant.id]) {
              teamStats[mp.participant.id].losses++;
            }
          }
        }
      }
    }

    const standings = stageParticipants
      .filter((p) => stage.matches && stage.matches.some((m) =>
        m.participants && m.participants.some((mp) => mp.participant?.id === p.id)
      ))
      .map((p) => ({
        participantId: p.id,
        teamName: p.team?.name || 'Unknown',
        teamTag: p.team?.tag || '-',
        wins: teamStats[p.id]?.wins || 0,
        losses: teamStats[p.id]?.losses || 0,
        stageName,
      }))
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.losses - b.losses;
      });

    if (standings.length > 0) {
      standingsByStage[stageName] = standings;
    }
  }

  return standingsByStage;
}

interface PlayerData {
  id: string;
  handle: string;
  realName: string | null;
  photo: string | null;
}

function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';
  const gdriveLinkMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
  if (gdriveLinkMatch) {
    return `https://drive.google.com/uc?export=view&id=${gdriveLinkMatch[1]}`;
  }
  return url;
}

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const cookies = document.cookie.split('; ').reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.split('=');
      acc[key] = value;
      return acc;
    }, {});
    setUserRole(cookies.userRole || null);
  }, []);

  const handleLogout = () => {
    document.cookie = 'isAuthenticated=; path=/; max-age=0';
    document.cookie = 'userRole=; path=/; max-age=0';
    router.push('/login');
  };

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const res = await fetch(`/api/tournaments/${params.id}`);
        if (!res.ok) {
          console.error('Failed to fetch tournament:', res.status);
          setTournament(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!data || !data.id) {
          console.error('Invalid tournament data:', data);
          setTournament(null);
          setLoading(false);
          return;
        }
        setTournament(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tournament:', error);
        setTournament(null);
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
          <div className="flex gap-4 items-center">
            <Link href="/tournaments" className="text-white hover:text-indigo-200">
              Tournaments
            </Link>
            {userRole === 'admin' && (
              <Link href="/admin" className="text-white hover:text-indigo-200">
                Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-white mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{tournament.name || 'Tournament'}</h1>
              <p className="text-indigo-200">{tournament.game?.name || 'Unknown Game'}</p>
            </div>
            <span className="bg-indigo-500 px-4 py-2 rounded-lg text-sm font-semibold">
              {tournament.status || 'UNKNOWN'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Tournament Info</h3>
              <div className="space-y-2 text-sm text-indigo-100">
                {tournament.startDate && (
                  <p>📅 Starts: {format(new Date(tournament.startDate), 'MMM dd, yyyy HH:mm')}</p>
                )}
                {tournament.endDate && (
                  <p>📅 Ends: {format(new Date(tournament.endDate), 'MMM dd, yyyy HH:mm')}</p>
                )}
                {tournament.location && <p>📍 {tournament.location}</p>}
                {tournament.tier && <p>🏆 Tier: {tournament.tier}</p>}
                {tournament.prizePool && <p>💰 Prize Pool: ${tournament.prizePool.toLocaleString()}</p>}
                {tournament.organizer && <p>👤 Organizer: {tournament.organizer}</p>}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Tournament Info (cont.)</h3>
              <div className="space-y-2 text-sm text-indigo-100">
                <p>🏆 {tournament.participants?.filter((p) => !p.stageId).length || 0} Teams Registered</p>
              </div>
            </div>

            {tournament.status === 'COMPLETED' && (() => {
              const winner = getTournamentWinner(tournament);
              return winner ? (
                <div>
                  <h3 className="font-semibold mb-2">Champion</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-yellow-400 mb-1">🏆 {winner.team.name}</p>
                      <p className="text-indigo-200 text-sm">{winner.team.tag}</p>
                    </div>
                    {winner.team.rosterMemberships && winner.team.rosterMemberships.length > 0 && (
                      <div className="pt-2 border-t border-indigo-400/20">
                        <p className="text-xs font-semibold text-indigo-300 mb-2">Players:</p>
                        <div className="space-y-1">
                          {winner.team.rosterMemberships.map((membership) => (
                            <p key={membership.player.id} className="text-xs text-indigo-100">
                              • {membership.player.handle}
                              {membership.player.realName && ` (${membership.player.realName})`}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          {tournament.description && (
            <div className="mb-8">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-indigo-100">{tournament.description}</p>
            </div>
          )}
        </div>

        {(() => {
          const playersSet = new Map<string, PlayerData>();
          if (tournament.participants) {
            for (const participant of tournament.participants) {
              if (participant.team?.rosterMemberships) {
                for (const membership of participant.team.rosterMemberships) {
                  const player = membership.player;
                  if (!playersSet.has(player.id)) {
                    playersSet.set(player.id, {
                      id: player.id,
                      handle: player.handle,
                      realName: player.realName,
                      photo: player.photo,
                    });
                  }
                }
              }
            }
          }

          const players = Array.from(playersSet.values());

          if (players.length === 0) return null;

          return (
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-6">Players in Tournament</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="relative rounded-lg overflow-hidden h-72 group bg-gradient-to-br from-indigo-400 to-purple-600"
                    style={
                      player.photo
                        ? {
                            backgroundImage: `url(${convertGoogleDriveUrl(player.photo)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : {}
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    {!player.photo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white/60">
                          <div className="text-4xl mb-2">🎮</div>
                          <p className="text-sm">No photo</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                      <h3 className="text-lg font-bold mb-1">{player.handle}</h3>
                      {player.realName && (
                        <p className="text-sm text-indigo-200">{player.realName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {tournament.stages && tournament.stages.length > 0 ? (
          <div className="space-y-8">
            {tournament.stages
              .sort((a, b) => (a.order || 0) - (b.order || 0))
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
                                    {mp.participant?.team?.name || 'TBD'}
                                  </p>
                                  <p className="text-sm text-indigo-200">
                                    {mp.participant?.team?.tag || '-'}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-indigo-200 mb-2">
                                {match.status}
                              </p>
                              {match.winner && match.participants ? (
                                <div className="text-green-400 font-bold">
                                  <p className="text-xs mb-1">✓ Complete</p>
                                  <p className="text-sm">
                                    {match.participants.find(
                                      (p) => p.participant?.id === match.winner
                                    )?.participant?.team?.tag || '-'}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-indigo-300 text-sm">-</p>
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

            {(() => {
              const standingsByStage = calculateStandingsByStage(tournament);
              const hasStandings = Object.keys(standingsByStage).length > 0;

              if (!hasStandings) return null;

              return (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-white">Standings</h2>
                  {Object.entries(standingsByStage).map(([stageName, standings]) => {
                    const isFinalsStage = stageName.toLowerCase().includes('final') || stageName.toLowerCase().includes('playoff');

                    return (
                      <div
                        key={stageName}
                        className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white"
                      >
                        <h3 className="text-xl font-bold mb-4">{stageName} Standings</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b border-indigo-400/30">
                              <tr>
                                <th className="text-left py-2 px-3">#</th>
                                <th className="text-left py-2 px-3">Team</th>
                                <th className="text-center py-2 px-3">Record</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-indigo-400/20">
                              {standings.map((entry, index) => (
                                <tr key={entry.participantId} className="hover:bg-white/5">
                                  <td className="py-3 px-3 font-semibold">{index + 1}</td>
                                  <td className="py-3 px-3">
                                    <div>
                                      <p className="font-semibold">{entry.teamName}</p>
                                      <p className="text-xs text-indigo-300">{entry.teamTag}</p>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 text-center font-semibold text-indigo-200">
                                    {entry.wins}-{entry.losses}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {isFinalsStage && (
                          <p className="text-xs text-indigo-300 mt-3">
                            💡 Finals results show individual match records and do not count toward group stage standings.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
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
