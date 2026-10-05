'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  participants: any[];
}

interface Champion {
  id: string;
  handle: string;
  realName: string | null;
  photo: string | null;
  championships: Array<{
    gameId: string;
    gameName: string;
    count: number;
  }>;
}

interface TeamChampion {
  id: string;
  name: string;
  tag: string;
  gameName: string;
  gameId: string;
  logo: string | null;
  tournamentName: string;
  tournamentId: string;
  tournamentEndDate: string;
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [playerChampions, setPlayerChampions] = useState<Champion[]>([]);
  const [teamChampions, setTeamChampions] = useState<TeamChampion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournamentsRes, championsRes] = await Promise.all([
          fetch('/api/tournaments'),
          fetch('/api/champions'),
        ]);
        const tournamentsData = await tournamentsRes.json();
        const championsData = await championsRes.json();

        setTournaments(tournamentsData);

        const mergedChampions = mergeChampionsByHandle(championsData.playerChampions || []);
        setPlayerChampions(mergedChampions);
        setTeamChampions(championsData.teamChampions || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const mergeChampionsByHandle = (champions: Champion[]): Champion[] => {
    const championMap = new Map<string, Champion>();

    for (const champion of champions) {
      const existing = championMap.get(champion.handle);

      if (existing) {
        // Merge championships from different games
        for (const champ of champion.championships) {
          const existingChamp = existing.championships.find(
            (c) => c.gameId === champ.gameId
          );
          if (existingChamp) {
            existingChamp.count += champ.count;
          } else {
            existing.championships.push(champ);
          }
        }
      } else {
        championMap.set(champion.handle, { ...champion });
      }
    }

    return Array.from(championMap.values()).sort((a, b) => {
      const aTotalChampionships = a.championships.reduce((sum, c) => sum + c.count, 0);
      const bTotalChampionships = b.championships.reduce((sum, c) => sum + c.count, 0);
      return bTotalChampionships - aTotalChampionships;
    });
  };

  const convertGoogleDriveUrl = (url: string): string => {
    if (!url) return '';
    const gdriveLinkMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (gdriveLinkMatch) {
      return `https://drive.google.com/uc?export=view&id=${gdriveLinkMatch[1]}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-xl">Loading tournaments...</div>
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
            <Link href="/tournaments" className="text-white hover:text-indigo-200 font-semibold">
              Tournaments
            </Link>
            <Link href="/admin" className="text-white hover:text-indigo-200">
              Admin
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tournaments</h1>
          <p className="text-indigo-100">Browse and follow ongoing tournaments</p>
        </div>

        {tournaments.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-12 text-center">
            <p className="text-white text-lg mb-6">No tournaments yet</p>
            <Link
              href="/admin/tournaments/create"
              className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-50"
            >
              Create First Tournament
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white hover:bg-white/20 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{tournament.name}</h2>
                    <p className="text-indigo-200 text-sm">{tournament.game.name}</p>
                  </div>
                  <span className="bg-indigo-500 px-3 py-1 rounded text-sm font-semibold">
                    {tournament.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-indigo-100">
                  <p>📅 {format(new Date(tournament.startDate), 'MMM dd, yyyy')}</p>
                  {tournament.location && <p>📍 {tournament.location}</p>}
                  {tournament.prizePool && <p>💰 ${tournament.prizePool.toLocaleString()}</p>}
                  <p>🏆 {tournament.participants.filter((p: any) => !p.stageId).length} teams</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {(teamChampions.length > 0 || playerChampions.length > 0) && (
          <div className="mt-16 space-y-12">
            {teamChampions.length > 0 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Team Champions</h2>
                  <p className="text-indigo-100">Winning teams by tournament</p>
                </div>

                <div className="space-y-4">
                  {teamChampions.map((team) => (
                    <div
                      key={`${team.tournamentId}-${team.id}`}
                      className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-white hover:bg-white/20 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          {team.logo && (
                            <img
                              src={team.logo}
                              alt={team.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold">{team.name}</h3>
                            <p className="text-sm text-indigo-200">{team.tag}</p>
                            <p className="text-sm text-indigo-300 mt-2">
                              🏆 {team.tournamentName}
                            </p>
                            <p className="text-xs text-indigo-400 mt-1">
                              🎮 {team.gameName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold">
                            Champion
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {playerChampions.length > 0 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Player Champions</h2>
                  <p className="text-indigo-100">Top players by championship wins</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playerChampions.map((champion) => (
                    <div
                      key={champion.id}
                      className="relative rounded-lg overflow-hidden h-96 group bg-gradient-to-br from-indigo-400 to-purple-600"
                      style={
                        champion.photo
                          ? {
                              backgroundImage: `url(${convertGoogleDriveUrl(
                                champion.photo
                              )})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }
                          : {}
                      }
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      {!champion.photo && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white/60">
                            <div className="text-5xl mb-2">🎮</div>
                            <p>No profile photo</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                        <div className="text-right">
                          <div className="bg-yellow-400 text-indigo-900 px-3 py-1 rounded-full font-bold text-lg inline-block">
                            {champion.championships.reduce((sum, c) => sum + c.count, 0)}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-1">{champion.handle}</h3>
                          {champion.realName && (
                            <p className="text-sm text-indigo-200 mb-4">{champion.realName}</p>
                          )}
                          <div className="space-y-2">
                            {champion.championships.map((champ) => (
                              <div
                                key={champ.gameId}
                                className="flex justify-between items-center bg-white/10 backdrop-blur-sm px-3 py-2 rounded"
                              >
                                <span className="text-sm">{champ.gameName}</span>
                                <span className="font-bold text-yellow-400">{champ.count}x</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
