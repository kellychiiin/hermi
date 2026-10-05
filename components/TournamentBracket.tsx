'use client';

import { useEffect, useState } from 'react';

interface Match {
  id: string;
  round: number;
  position: number | null;
  bestOf: number;
  status: string;
  winner: string | null;
  participants: Array<{
    participant: {
      team: {
        name: string;
        tag: string;
      };
    };
  }>;
  mapResults: Array<{
    scoreA: number;
    scoreB: number;
  }>;
}

interface Stage {
  id: string;
  name: string | null;
  type: string;
  matches: Match[];
}

interface BracketProps {
  tournamentId: string;
}

export default function TournamentBracket({ tournamentId }: BracketProps) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await fetch(
          `/api/stages?tournamentId=${tournamentId}`
        );
        const data = await res.json();
        setStages(data);
      } catch (error) {
        console.error('Error fetching stages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStages();
  }, [tournamentId]);

  if (loading) {
    return <div className="text-white text-center py-8">Loading bracket...</div>;
  }

  if (stages.length === 0) {
    return (
      <div className="text-center py-12 text-indigo-200">
        No stages created yet
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {stages.map((stage) => (
        <div key={stage.id} className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            {stage.name || `Stage ${stage.id}`}
          </h2>
          <p className="text-indigo-200 text-sm mb-6">
            {stage.type.replace(/_/g, ' ')}
          </p>

          {stage.type === 'SINGLE_ELIMINATION' && (
            <SingleEliminationBracket matches={stage.matches} />
          )}

          {stage.type === 'ROUND_ROBIN' && (
            <RoundRobinBracket matches={stage.matches} />
          )}

          {stage.type === 'GROUP' && (
            <GroupBracket matches={stage.matches} />
          )}

          {(stage.type === 'DOUBLE_ELIMINATION' ||
            stage.type === 'SWISS') && (
            <StandardBracket matches={stage.matches} />
          )}
        </div>
      ))}
    </div>
  );
}

function SingleEliminationBracket({ matches }: { matches: Match[] }) {
  const roundGroups = matches.reduce(
    (acc, match) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    },
    {} as Record<number, Match[]>
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 min-w-full pb-4">
        {Object.entries(roundGroups)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([round, matches]) => (
            <div key={round} className="flex-shrink-0">
              <p className="text-sm text-indigo-300 mb-4 font-semibold">
                Round {round}
              </p>
              <div className="space-y-4">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function RoundRobinBracket({ matches }: { matches: Match[] }) {
  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

function GroupBracket({ matches }: { matches: Match[] }) {
  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

function StandardBracket({ matches }: { matches: Match[] }) {
  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const teamA = match.participants[0]?.participant.team;
  const teamB = match.participants[1]?.participant.team;

  const mapScore =
    match.mapResults.length > 0
      ? `${match.mapResults.filter((m) => m.scoreA > m.scoreB).length} - ${match.mapResults.filter((m) => m.scoreB > m.scoreA).length}`
      : null;

  const statusColor = {
    SCHEDULED: 'bg-indigo-500/50',
    ONGOING: 'bg-yellow-500/50',
    COMPLETED: 'bg-green-500/50',
    CANCELLED: 'bg-red-500/50',
  }[match.status];

  return (
    <div className={`rounded-lg p-4 text-white ${statusColor || 'bg-white/5'}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-indigo-200">
          {match.status}
        </span>
        {mapScore && (
          <span className="text-sm font-bold text-green-300">{mapScore}</span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold">
            {teamA?.name || 'TBD'} ({teamA?.tag || '?'})
          </span>
          {match.mapResults.length > 0 && (
            <span className="font-bold">
              {match.mapResults.filter((m) => m.scoreA > m.scoreB).length}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <span className="font-semibold">
            {teamB?.name || 'TBD'} ({teamB?.tag || '?'})
          </span>
          {match.mapResults.length > 0 && (
            <span className="font-bold">
              {match.mapResults.filter((m) => m.scoreB > m.scoreA).length}
            </span>
          )}
        </div>
      </div>

      {match.status === 'COMPLETED' && match.winner && (
        <div className="mt-3 pt-3 border-t border-white/20 text-center">
          <span className="text-sm text-green-300 font-semibold">✓ Winner</span>
        </div>
      )}
    </div>
  );
}
